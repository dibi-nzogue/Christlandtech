# christland/services/i18n_db.py

import hashlib
from django.utils.functional import cached_property
from christland.models import TranslationEntry  # adapte le path si besoin

BASE_LANG = "fr"


def get_lang_from_request(request):
    """
    Détecte la langue de la requête :
    - ?lang=en
    - X-Lang
    - Accept-Language
    """
    # query params (DRF)
    q = ""
    if hasattr(request, "query_params"):
        q = (request.query_params.get("lang") or "").strip().lower()
    if q:
        return q.split(",")[0].split("-")[0]

    # header custom
    x = (request.headers.get("X-Lang") or "").strip().lower()
    if x:
        return x.split(",")[0].split("-")[0]

    # Accept-Language
    raw = (request.headers.get("Accept-Language") or BASE_LANG).lower()
    primary = raw.split(",")[0].strip()
    return primary.split("-")[0] if primary else BASE_LANG


def get_translated_value(instance, field_name: str, lang: str) -> str:
    """
    Lit la valeur traduite en base (TranslationEntry) si dispo,
    sinon renvoie la valeur FR d’origine.
    """
    if not instance:
        return ""

    value_fr = getattr(instance, field_name, "") or ""
    if not value_fr or lang == BASE_LANG:
        return value_fr

    meta = getattr(instance, "_meta", None)
    if meta is None:
        return value_fr

    app_label = meta.app_label
    model_name = meta.model_name
    obj_id = str(instance.pk)

    # IMPORTANT : on utilise le hash du texte source pour invalidation
    src_hash = hashlib.sha256(value_fr.encode("utf-8")).hexdigest()

    entry = (
        TranslationEntry.objects.filter(
            app_label=app_label,
            model_name=model_name,
            object_id=obj_id,
            field_name=field_name,
            lang=lang,
            source_hash=src_hash,
        )
        .order_by("-updated_at")
        .first()
    )

    if entry and entry.text:
        return entry.text

    # fallback FR
    return value_fr
