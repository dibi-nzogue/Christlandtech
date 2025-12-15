import os
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction

import cloudinary.uploader

# ✅ importe tes modèles ici (adapte selon tes noms réels)
from christland.models import Categories, ImagesProduits


def is_cloudinary_value(v: str) -> bool:
    if not v:
        return False
    s = str(v).strip().lower()
    return s.startswith("http://") or s.startswith("https://") or "res.cloudinary.com" in s


def resolve_local_file(stored_value: str) -> Path | None:
    """
    Convertit une valeur stockée en base (ex: 'uploads/produits/a.jpg', '/media/uploads/a.jpg')
    en chemin disque réel sous MEDIA_ROOT.
    """
    if not stored_value:
        return None

    p = str(stored_value).strip()

    # si url http(s), on ne peut pas lire le fichier local ici
    if p.lower().startswith(("http://", "https://")):
        return None

    # enlève MEDIA_URL si présent
    media_prefix = (getattr(settings, "MEDIA_URL", "/media/") or "/media/").rstrip("/")
    if not media_prefix.startswith("/"):
        media_prefix = "/" + media_prefix

    if p.startswith(media_prefix):
        p = p[len(media_prefix):]

    p = p.lstrip("/")

    # chemin final
    root = Path(getattr(settings, "MEDIA_ROOT", "media"))
    full = root / p
    return full if full.exists() else None


class Command(BaseCommand):
    help = "Upload toutes les images locales existantes sur Cloudinary et met à jour la DB."

    def add_arguments(self, parser):
        parser.add_argument("--dry-run", action="store_true", help="N'upload rien, n'écrit rien en DB.")
        parser.add_argument(
            "--store",
            choices=["public_id", "secure_url"],
            default="public_id",
            help="Ce qu'on enregistre en DB après upload.",
        )
        parser.add_argument(
            "--folder",
            default="uploads",
            help="Dossier Cloudinary (ex: uploads/produits).",
        )
        parser.add_argument(
            "--limit",
            type=int,
            default=0,
            help="Limiter le nombre d'uploads (0 = pas de limite).",
        )

    @transaction.atomic
    def handle(self, *args, **opts):
        dry = opts["dry_run"]
        store_mode = opts["store"]
        base_folder = opts["folder"].strip("/")

        total_uploaded = 0
        total_skipped = 0
        total_missing = 0

        self.stdout.write(self.style.WARNING(f"DRY_RUN={dry} | STORE={store_mode} | FOLDER={base_folder}"))

        # =========================================================
        # 1) MIGRATION CATEGORIES (adapte le champ si besoin)
        # =========================================================
        # ⚠️ adapte ici si ton champ s’appelle autrement (ex: image_url, image, photo, etc.)
        categories = Categories.objects.all()

        for cat in categories:
            # 🔁 ADAPTE ce champ si besoin
            current = getattr(cat, "image_url", None) if hasattr(cat, "image_url") else getattr(cat, "image", None)

            if not current:
                total_skipped += 1
                continue

            if is_cloudinary_value(current):
                total_skipped += 1
                continue

            file_path = resolve_local_file(current)
            if not file_path:
                total_missing += 1
                self.stdout.write(self.style.ERROR(f"[CATEG] missing local file: {current} (cat_id={cat.id})"))
                continue

            # dossier cloudinary : ex uploads/categories
            folder = f"{base_folder}/categories"

            if dry:
                self.stdout.write(f"[DRY] Would upload: {file_path} -> {folder}")
                total_uploaded += 1
                continue

            res = cloudinary.uploader.upload(
                str(file_path),
                folder=folder,
                resource_type="image",
                use_filename=True,
                unique_filename=True,
            )

            new_value = res["public_id"] if store_mode == "public_id" else res["secure_url"]

            # 🔁 écriture DB
            if hasattr(cat, "image_url"):
                cat.image_url = new_value
            else:
                cat.image = new_value

            cat.save(update_fields=["image_url"] if hasattr(cat, "image_url") else ["image"])

            total_uploaded += 1
            self.stdout.write(self.style.SUCCESS(f"[CATEG] OK cat_id={cat.id} -> {new_value}"))

            if opts["limit"] and total_uploaded >= opts["limit"]:
                break

        # =========================================================
        # 2) MIGRATION IMAGES PRODUITS (adapte le champ si besoin)
        # =========================================================
        images = ImagesProduits.objects.all()

        for img in images:
            # 🔁 ADAPTE ce champ si ton modèle n’utilise pas "url"
            current = getattr(img, "url", None)

            if not current:
                total_skipped += 1
                continue

            if is_cloudinary_value(current):
                total_skipped += 1
                continue

            file_path = resolve_local_file(current)
            if not file_path:
                total_missing += 1
                self.stdout.write(self.style.ERROR(f"[PROD] missing local file: {current} (img_id={img.id})"))
                continue

            folder = f"{base_folder}/produits"

            if dry:
                self.stdout.write(f"[DRY] Would upload: {file_path} -> {folder}")
                total_uploaded += 1
                continue

            res = cloudinary.uploader.upload(
                str(file_path),
                folder=folder,
                resource_type="image",
                use_filename=True,
                unique_filename=True,
            )

            new_value = res["public_id"] if store_mode == "public_id" else res["secure_url"]

            img.url = new_value
            img.save(update_fields=["url"])

            total_uploaded += 1
            self.stdout.write(self.style.SUCCESS(f"[PROD] OK img_id={img.id} -> {new_value}"))

            if opts["limit"] and total_uploaded >= opts["limit"]:
                break

        self.stdout.write(self.style.WARNING("==== SUMMARY ===="))
        self.stdout.write(self.style.WARNING(f"uploaded={total_uploaded} | skipped={total_skipped} | missing={total_missing}"))

        if dry:
            # empêche toute écriture si dry-run (même si save n’a pas été appelé)
            transaction.set_rollback(True)
