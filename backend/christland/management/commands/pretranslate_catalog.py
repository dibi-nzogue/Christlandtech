# christland/management/commands/pretranslate_catalog.py
from django.core.management.base import BaseCommand
from django.db import transaction
from django.db.models import Q

from christland.models import Categories, Produits, Marques, Couleurs, ArticlesBlog
from christland.services.text_translate import translate_text


class Command(BaseCommand):
    help = "Pré-traduit le catalogue (FR -> EN) dans TextTranslation pour accélérer le frontend."

    def add_arguments(self, parser):
        parser.add_argument(
            "--lang",
            type=str,
            default="en",
            help="Langue cible (ex: en, es, pt, ...). Défaut: en",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        target_lang = options["lang"].lower()
        source_lang = "fr"

        self.stdout.write(self.style.MIGRATE_HEADING(f"Pré-traduction FR -> {target_lang}"))

        # ---------- CATEGORIES ----------
        self.stdout.write(self.style.HTTP_INFO("Traduction des catégories..."))
        for c in Categories.objects.all():
            if c.nom:
                translate_text(c.nom, target_lang=target_lang, source_lang=source_lang)

        # ---------- MARQUES ----------
        self.stdout.write(self.style.HTTP_INFO("Traduction des marques..."))
        for m in Marques.objects.all():
            if m.nom:
                translate_text(m.nom, target_lang=target_lang, source_lang=source_lang)

        # ---------- COULEURS ----------
        self.stdout.write(self.style.HTTP_INFO("Traduction des couleurs..."))
        for col in Couleurs.objects.all():
            if col.nom:
                translate_text(col.nom, target_lang=target_lang, source_lang=source_lang)

        # ---------- PRODUITS ----------
        self.stdout.write(self.style.HTTP_INFO("Traduction des produits..."))
        for p in Produits.objects.all():
            if p.nom:
                translate_text(p.nom, target_lang=target_lang, source_lang=source_lang)
            if p.description_courte:
                translate_text(p.description_courte, target_lang=target_lang, source_lang=source_lang)
            if p.description_long:
                translate_text(p.description_long, target_lang=target_lang, source_lang=source_lang)

        # ---------- ARTICLES / BLOG ----------
        self.stdout.write(self.style.HTTP_INFO("Traduction des articles de blog..."))
        for a in ArticlesBlog.objects.all():
            if a.titre:
                translate_text(a.titre, target_lang=target_lang, source_lang=source_lang)
            if a.extrait:
                translate_text(a.extrait, target_lang=target_lang, source_lang=source_lang)
            if a.contenu:
                translate_text(a.contenu, target_lang=target_lang, source_lang=source_lang)

        self.stdout.write(self.style.SUCCESS("Pré-traduction terminée."))
