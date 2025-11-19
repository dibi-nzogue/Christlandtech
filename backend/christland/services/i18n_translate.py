# christland/services/i18n_translate.py

"""
Stub / compatibilité : on garde translate_field_for_instance
pour les anciens imports, mais on ne l'utilise plus réellement.

Toute la logique de traduction passe maintenant par :
    christland.services.text_translate.translate_text
via le mixin I18nTranslateMixin dans serializers_i18n.py
"""

from __future__ import annotations


def translate_field_for_instance(
    app_label: str,
    model_name: str,
    obj_id: str,
    field_name: str,
    value: str,
    lang: str,
) -> str:
    """
    Ancienne API de traduction basée sur TranslationEntry.

    Maintenant, on ne fait plus rien ici : on renvoie simplement `value`.
    Les serializers utilisent `translate_text` (texte -> texte).

    Cette fonction est juste là pour éviter les ImportError
    sur les vieux imports (views, vieux fichiers, etc.).
    """
    return value
