import logging

from django.core.cache import cache

from christland.models import TextTranslation

from googletrans import Translator

logger = logging.getLogger(__name__)

translator = Translator()

CACHE_TTL = 60 * 60 * 24 * 7  # 7 jours


def _norm_lang(code: str | None, default: str) -> str:
    if not code:
        return default
    c = str(code).strip()
    if not c:
        return default
    primary = c.split(",")[0].split(";")[0].split("-")[0]
    return primary.lower() or default


def translate_text(text: str, target_lang: str, source_lang: str = "fr") -> str:
    """
    Traduit un simple texte en utilisant googletrans (gratuit, non officiel).

    Pipeline :
      1) Cache Django
      2) Table TextTranslation (source_text + source_lang + target_lang)
      3) googletrans (appel réseau vers Google) si rien en base

    On évite de refaire des appels pour rien grâce à la DB + cache.
    """
    if not text:
        return text

    target_lang = _norm_lang(target_lang, "en")
    source_lang = _norm_lang(source_lang, "fr")

    # Même langue -> pas de traduction
    if target_lang == source_lang:
        return text

    # Clé de cache
    cache_key = f"text_i18n:{source_lang}:{target_lang}:{hash(text)}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    # 1) Vérifier en base
    existing = TextTranslation.objects.filter(
        source_lang=source_lang,
        target_lang=target_lang,
        source_text=text,
    ).first()

    if existing:
        # Si c'est une vraie traduction (différente du texte source), on l'utilise
        if existing.translated_text and existing.translated_text != existing.source_text:
            cache.set(cache_key, existing.translated_text, CACHE_TTL)
            return existing.translated_text
        # Sinon, on tentera une nouvelle traduction ci-dessous

    # 2) Appel googletrans (gratuit, peut parfois être capricieux)
    try:
        result = translator.translate(text, src=source_lang, dest=target_lang)
        translated = result.text or text
    except Exception as e:
        print("Erreur googletrans =========")
        print(e)
        logger.error("Erreur googletrans: %s", e, exc_info=True)
        translated = text  # fallback

    # 3) Sauvegarde en base
    try:
        obj, created = TextTranslation.objects.get_or_create(
            source_lang=source_lang,
            target_lang=target_lang,
            source_text=text,
            defaults={"translated_text": translated},
        )
        if not created and obj.translated_text != translated:
            obj.translated_text = translated
            obj.save(update_fields=["translated_text"])
    except Exception as e:
        print("Erreur sauvegarde TextTranslation =========")
        print(e)
        logger.error("Erreur sauvegarde TextTranslation: %s", e, exc_info=True)

    cache.set(cache_key, translated, CACHE_TTL)
    return translated
