# christland/services/text_translate.py
import hashlib
from django.core.cache import cache
from christland.models import TextTranslation

def _norm_lang(lang: str | None) -> str:
    lang = (lang or "fr").split(",")[0].split("-")[0].lower()
    return lang or "fr"


def _make_cache_key(src: str, dst: str, text: str) -> str:
    """
    On hash le texte pour éviter les caractères interdits
    dans certaines backends (memcached).
    """
    digest = hashlib.md5(text.encode("utf-8")).hexdigest()
    return f"txt:{src}:{dst}:{digest}"


def translate_text(
    text: str,
    target_lang: str,
    source_lang: str = "fr",
) -> str:
    if not text:
        return ""

    src = _norm_lang(source_lang)
    dst = _norm_lang(target_lang)

    if src == dst:
        return text

    cache_key = _make_cache_key(src, dst, text)
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    # 1) chercher dans TextTranslation
    entry = (
        TextTranslation.objects
        .filter(
            source_lang=src,
            target_lang=dst,
            source_text=text,
        )
        .order_by("-id")
        .first()
    )

    if entry:
        cache.set(cache_key, entry.translated_text, 24 * 3600)  # 24h
        return entry.translated_text

    # 2) pas de traduction dispo → on renvoie le texte original
    cache.set(cache_key, text, 5 * 60)  # 5 min
    return text
