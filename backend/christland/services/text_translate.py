# christland/services/text_translate.py

from __future__ import annotations

import logging
from typing import Optional

from django.conf import settings
from christland.models import TextTranslation

from googletrans import Translator  # pip install googletrans==4.0.0rc1

logger = logging.getLogger(__name__)

# Crée un traducteur global (réutilisé)
_translator = Translator()


def _call_external_translation_api(
    text: str,
    source_lang: str,
    target_lang: str,
) -> str:
    """
    Appelle Google Translate via la librairie googletrans.
    Pas besoin de clé d'API, mais c'est non-officiel (peut casser si Google change son HTML).
    """

    try:
        # googletrans utilise codes courts : 'fr', 'en', 'es', ...
        src = source_lang or "auto"
        dest = target_lang or "en"

        result = _translator.translate(text, src=src, dest=dest)
        translated = (result.text or "").strip()
        return translated or text
    except Exception:
        logger.exception("Erreur lors de l'appel à googletrans")
        return text


def translate_text(
    text: Optional[str],
    target_lang: str = "en",
    source_lang: str = "fr",
) -> str:
    """
    1) Normalise texte + codes langue.
    2) Si source_lang == target_lang → renvoie le texte tel quel.
    3) Cherche dans TextTranslation (cache).
    4) Si trouvé → renvoie translated_text.
    5) Sinon → appelle googletrans, stocke dans TextTranslation, renvoie.
    """

    # 0) Normalisation
    text = (text or "").strip()
    if not text:
        return text

    target_lang = (target_lang or "").split(",")[0].split("-")[0].lower()
    source_lang = (source_lang or "").split(",")[0].split("-")[0].lower()

    # 1) Même langue → pas de traduction
    if target_lang == source_lang:
        return text

    # 2) Cache
    try:
        cached = TextTranslation.objects.filter(
            source_text=text,
            source_lang=source_lang,
            target_lang=target_lang,
        ).first()
    except Exception:
        logger.exception("Erreur en lisant TextTranslation")
        return text

    if cached and (cached.translated_text or "").strip():
        return cached.translated_text

    # 3) Appel provider (googletrans)
    translated = _call_external_translation_api(
        text=text,
        source_lang=source_lang,
        target_lang=target_lang,
    )

    translated = (translated or "").strip() or text

    # 4) Sauvegarde en cache
    try:
        TextTranslation.objects.update_or_create(
            source_text=text,
            source_lang=source_lang,
            target_lang=target_lang,
            defaults={"translated_text": translated},
        )
    except Exception:
        logger.exception("Erreur en écrivant dans TextTranslation")

    return translated
