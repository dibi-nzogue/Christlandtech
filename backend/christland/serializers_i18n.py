# christland/serializers_i18n.py
from rest_framework import serializers
from christland.services.i18n_translate import translate_field_for_instance

class I18nTranslateMixin(serializers.ModelSerializer):
    """
    Mixin pour traduire automatiquement certains champs string selon ?lang=xx
    Dans ton serializer concret, définis:
       i18n_fields = ("titre", "extrait", "contenu", ...)
    """
    i18n_fields: tuple[str, ...] = tuple()

    def to_representation(self, instance):
        data = super().to_representation(instance)

        # langue depuis ?lang= ou Accept-Language (défaut fr)
        request = self.context.get("request") if hasattr(self, "context") else None
        lang = None
        if request is not None:
            lang = request.query_params.get("lang") or request.headers.get("Accept-Language")
        lang = (lang or "fr").strip().lower()

        # infos modèle (clé de cache)
        meta = getattr(instance, "_meta", None)
        app_label  = getattr(meta, "app_label", "christland")
        model_name = getattr(meta, "model_name", instance.__class__.__name__)
        obj_id     = getattr(instance, "pk", None)

        # trad uniquement sur les champs listés et si str
        for f in getattr(self, "i18n_fields", ()):
            if f in data and isinstance(data[f], str) and obj_id is not None:
                data[f] = translate_field_for_instance(
                    app_label, model_name, str(obj_id), f, data[f], lang
                )

        return data
