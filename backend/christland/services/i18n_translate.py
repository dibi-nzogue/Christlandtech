# christland/services/i18n_translate.py
from django.core.cache import cache
from christland.models import TextTranslation  # adapte si le nom est différent

CACHE_TTL = 3600  # 1h

def translate_field_for_instance(
    app_label: str,
    model_name: str,
    object_id: str | int,
    field_name: str,
    value: str,
    target_lang: str,
) -> str:
    """
    Retourne la traduction depuis TextTranslation + cache.
    ❌ Aucun appel Google/HTTP ici.
    """
    if not value:
        return value

    # FR = valeur brute, jamais traduit
    if not target_lang:
        return value
    lang = target_lang.split(",")[0].split("-")[0].lower()
    if lang == "fr":
        return value

    cache_key = f"i18n:{lang}:{app_label}:{model_name}:{object_id}:{field_name}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    tr = (
        TextTranslation.objects.filter(
            app_label=app_label,
            model_name=model_name,
            object_id=str(object_id),
            field_name=field_name,
            source_lang="fr",
            target_lang=lang,
        )
        .values_list("translated_text", flat=True)
        .first()
    )

    if tr:
        cache.set(cache_key, tr, CACHE_TTL)
        return tr

    # Pas de traduction pré-calculée → on renvoie la valeur FR
    cache.set(cache_key, value, CACHE_TTL)
    return value