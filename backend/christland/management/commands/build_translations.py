# christland/management/commands/build_translations.py

from django.core.management.base import BaseCommand
from django.db import transaction
import hashlib

from christland.models import (
    Produits,
    Categories,
    Marques,
    Couleurs,
    ArticlesBlog,
    TranslationEntry,
)
from christland.services.i18n_translate import translate_field_for_instance

# Langues cibles (hors "fr" qui est la langue de base)
TARGET_LANGS = ["en"]  # tu pourras rajouter "es", etc. plus tard


class Command(BaseCommand):
    help = "Pré-calcule et stocke les traductions dans TranslationEntry"

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING("=== Build translations ==="))

        # Dictionnaire : modèle -> liste de champs à traduire
        model_fields = {
            Produits: ["nom", "description_courte"],
            Categories: ["nom"],
            Marques: ["nom"],
            Couleurs: ["nom"],
            ArticlesBlog: ["titre", "extrait", "contenu"],
        }

        for model, fields in model_fields.items():
            self._build_for_model(model, fields)

        self.stdout.write(self.style.SUCCESS("✔ Translations build terminé."))

    @transaction.atomic
    def _build_for_model(self, model_cls, fields):
        app_label = model_cls._meta.app_label
        model_name = model_cls._meta.model_name

        self.stdout.write(f"→ {app_label}.{model_name}")

        for obj in model_cls.objects.all():
            obj_id = str(obj.pk)

            for field_name in fields:
                value_fr = getattr(obj, field_name, "") or ""
                if not value_fr.strip():
                    continue

                # hash du texte source FR pour détecter les changements
                src_hash = hashlib.sha256(value_fr.encode("utf-8")).hexdigest()

                for lang in TARGET_LANGS:
                    if lang == "fr":
                        continue

                    # 1️⃣ On cherche une éventuelle entrée existante pour cette clé UNIQUE
                    entry = TranslationEntry.objects.filter(
                        app_label=app_label,
                        model_name=model_name,
                        object_id=obj_id,
                        field_name=field_name,
                        lang=lang,
                    ).first()

                    # 2️⃣ Si elle existe déjà AVEC le même source_hash et un texte non vide,
                    #    on considère que la traduction est à jour → on skip
                    if entry and entry.source_hash == src_hash and (entry.text or "").strip():
                        continue

                    # 3️⃣ Sinon on (re)traduit le texte FR
                    text_tr = translate_field_for_instance(
                        app_label,
                        model_name,
                        obj_id,
                        field_name,
                        value_fr,
                        lang,
                    ) or ""

                    # 4️⃣ Et on met à jour ou crée l'entrée
                    TranslationEntry.objects.update_or_create(
                        app_label=app_label,
                        model_name=model_name,
                        object_id=obj_id,
                        field_name=field_name,
                        lang=lang,
                        defaults={
                            "text": text_tr,
                            "source_hash": src_hash,
                        },
                    )
