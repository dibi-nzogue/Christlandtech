import os
import requests
from .i18n_translate import translate_field_for_instance
LT_API_URL = os.getenv("LT_API_URL", "https://libretranslate.com/translate").strip()

def _norm_lang(lang: str) -> str:
    """
    Normalise la langue cible pour LibreTranslate.
    Ex: 'en-US' -> 'en', 'EN' -> 'en'
    """
    if not lang:
        return "en"
    lang = str(lang).split("-")[0].lower()
    # langues communes supportées par LibreTranslate
    supported = {
        "ar","az","zh","cs","da","nl","en","fi","fr","de","el","hi",
        "hu","id","ga","it","ja","ko","fa","pl","pt","ru","sk","es",
        "sv","tr","uk","vi"
    }
    return lang if lang in supported else "en"

def _translate_via_provider(text: str, target_lang: str) -> str:
    """
    Traduit FR -> target_lang via LibreTranslate.
    Ne lève jamais d'exception : en cas d'erreur, renvoie le texte source.
    """
    txt = (text or "").strip()
    if not txt:
        return text

    target = _norm_lang(target_lang)

    try:
        r = requests.post(
            LT_API_URL,
            json={"q": txt, "source": "fr", "target": target, "format": "text"},
            timeout=7,
        )
        if r.ok:
            data = r.json()
            translated = data.get("translatedText")
            # sécurité : si API renvoie vide, on garde la valeur source
            return translated if translated not in (None, "") else text
    except Exception:
        pass
    return text
