# christland/services/i18n_translate.py

import hashlib
import os
import requests
from django.db import connection
from django.apps import apps
from django.db.utils import ProgrammingError, OperationalError

_TABLE_PROBED = False
_TABLE_EXISTS = False

def _ensure_table_exists():
    global _TABLE_PROBED, _TABLE_EXISTS
    if _TABLE_PROBED:
        return _TABLE_EXISTS
    try:
        with connection.cursor():
            tables = connection.introspection.table_names()
        _TABLE_EXISTS = "christland_translationentry" in tables
    except Exception:
        _TABLE_EXISTS = False
    _TABLE_PROBED = True
    return _TABLE_EXISTS

def _normalize_lang(lang: str) -> str:
    return (lang or "en").split("-")[0].lower()

def _sha(s: str) -> str:
    return hashlib.sha256((s or "").encode("utf-8")).hexdigest()

def _translate_via_provider(text: str, target_lang: str) -> str | None:
    """
    Essaie d'abord une détection automatique (LibreTranslate),
    puis MyMemory. En cas d'échec, retourne None (très important :
    on NE renverra pas le texte source ici → évite le 'mauvais cache').
    """
    text = text or ""
    if not text.strip():
        return text

    tgt = _normalize_lang(target_lang)

    # ---------- 1) LibreTranslate (auto-detect) ----------
    try:
        lt_url = os.getenv("LIBRETRANSLATE_URL", "https://libretranslate.com/translate")
        r = requests.post(
            lt_url,
            json={"q": text, "source": "auto", "target": tgt, "format": "text"},
            timeout=8
        )
        if r.ok:
            data = r.json()
            tr = (data or {}).get("translatedText")
            if isinstance(tr, str) and tr.strip() and tr.strip() != text.strip():
                return tr
    except Exception:
        pass

    # ---------- 2) MyMemory (on suppose fr->tgt, mais on accepte identique) ----------
    try:
        params = {"q": text, "langpair": f"fr|{tgt}"}
        email = os.getenv("MYMEMORY_EMAIL")
        if email:
            params["de"] = email
        r = requests.get("https://api.mymemory.translated.net/get", params=params, timeout=6)
        if r.ok:
            data = r.json()
            tr = (data.get("responseData") or {}).get("translatedText")
            if isinstance(tr, str) and tr.strip() and tr.strip() != text.strip():
                return tr
    except Exception:
        pass

    # ---------- 3) échec → None (pour éviter de "cacher" le texte source) ----------
    return None

def translate_field_for_instance(app_label, model_name, object_id, field_name, source_text, lang):
    """
    Retourne la traduction si obtenue, sinon le texte source, MAIS
    n'écrit dans la table de cache QUE si on a une vraie traduction
    (ou si le texte source a changé).
    """
    lang = _normalize_lang(lang)

    # 1) FR → texte original
    if not lang or lang.startswith("fr"):
        return source_text

    try:
        # 2) si la table n’existe pas → fallback non bloquant
        if not _ensure_table_exists():
            return source_text

        TranslationEntry = apps.get_model("christland", "TranslationEntry")
        src = source_text or ""
        src_hash = _sha(src)

        # 3) lire le cache
        row = (TranslationEntry.objects
               .filter(app_label=app_label,
                       model_name=model_name,
                       object_id=str(object_id),
                       field_name=field_name,
                       lang=lang)
               .first())

        # 3b) cache valide → renvoie directement
        if row and row.text and getattr(row, "source_hash", "") == src_hash:
            return row.text

        # 4) sinon, tenter de (re)traduire
        translated = _translate_via_provider(src, lang)

        # 5) mise à jour du cache :
        #    - si on a VRAIMENT une traduction différente du texte source
        if translated and translated.strip() and translated.strip() != src.strip():
            if row:
                row.text = translated
                row.source_hash = src_hash
                row.save(update_fields=["text", "source_hash", "updated_at"])
            else:
                TranslationEntry.objects.create(
                    app_label=app_label, model_name=model_name, object_id=str(object_id),
                    field_name=field_name, lang=lang, text=translated, source_hash=src_hash
                )
            return translated

        # 6) pas de traduction (provider KO / identique) :
        #    - ne PAS créer/écraser une entrée avec le texte source (pas de mauvais cache)
        #    - retourner le texte source pour l’instant → on retentera plus tard
        if row and getattr(row, "source_hash", "") != src_hash:
            # le texte source a changé : on invalide juste le hash pour forcer une future tentative
            row.source_hash = src_hash
            row.save(update_fields=["source_hash", "updated_at"])

        return src

    except (ProgrammingError, OperationalError):
        return source_text
    except Exception:
        return source_text
