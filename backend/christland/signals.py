# christland/signals.py

from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Categories, Produits, Marques, Couleurs, ArticlesBlog
from .services.text_translate import translate_text


TARGET_LANGS = getattr(settings, "I18N_TARGET_LANGS", ["en"])


def _build_translations_for_instance(instance, fields):
    """
    Pour chaque champ FR de `fields`, on pré-calcule la traduction
    dans toutes les langues de TARGET_LANGS en utilisant translate_text(),
    ce qui remplit la table TextTranslation.
    """
    # si on veut pouvoir désactiver facilement
    if not getattr(settings, "AUTO_BUILD_TRANSLATIONS", False):
        return

    for field_name in fields:
        value_fr = getattr(instance, field_name, "") or ""
        if not value_fr.strip():
            continue

        for lang in TARGET_LANGS:
            if lang == "fr":
                continue
            # ⚠️ on ne se sert pas du retour, on veut juste remplir le cache
            translate_text(
                text=value_fr,
                target_lang=lang,
                source_lang="fr",
            )


@receiver(post_save, sender=Categories)
def _categories_post_save(sender, instance, **kwargs):
    _build_translations_for_instance(instance, ["nom"])


@receiver(post_save, sender=Marques)
def _marques_post_save(sender, instance, **kwargs):
    _build_translations_for_instance(instance, ["nom"])


@receiver(post_save, sender=Couleurs)
def _couleurs_post_save(sender, instance, **kwargs):
    _build_translations_for_instance(instance, ["nom"])


@receiver(post_save, sender=Produits)
def _produits_post_save(sender, instance, **kwargs):
    _build_translations_for_instance(
        instance,
        ["nom", "description_courte", "description_long"],
    )


@receiver(post_save, sender=ArticlesBlog)
def _articles_post_save(sender, instance, **kwargs):
    _build_translations_for_instance(
        instance,
        ["titre", "extrait", "contenu"],
    )
