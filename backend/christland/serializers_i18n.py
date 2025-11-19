from rest_framework import serializers
from christland.services.text_translate import translate_text


class I18nTranslateMixin(serializers.ModelSerializer):
    """
    Mixin simple :
      - i18n_fields : champs directs à traduire
      - i18n_nested : champs imbriqués (ex: {"categorie": ["nom"]})
    """

    i18n_fields = ()
    i18n_nested = {}

    def to_representation(self, instance):
        data = super().to_representation(instance)

        request = self.context.get("request")
        if not request:
            return data

        # ⛔ NE PAS traduire les endpoints du dashboard
        path = getattr(request, "path", "") or ""
        if path.startswith("/christland/api/dashboard/"):
            return data

        # Récupérer la langue
        lang = request.query_params.get("lang")
        if not lang:
            lang = request.headers.get("Accept-Language", "fr")

        lang = (lang or "fr").split(",")[0].split("-")[0].lower()

        # Si on est en français → pas de traduction
        if lang == "fr":
            return data

        # 1) Champs directs
        for field in getattr(self, "i18n_fields", []):
            if field in data and isinstance(data[field], str):
                data[field] = translate_text(
                    text=data[field],
                    target_lang=lang,
                    source_lang="fr",
                )

        # 2) Champs imbriqués
        for nested_field, subfields in getattr(self, "i18n_nested", {}).items():
            nested = data.get(nested_field)
            if not nested:
                continue

            # Cas classique : {"categorie": {"nom": "..."}}
            if isinstance(nested, dict):
                for sub in subfields:
                    if sub in nested and isinstance(nested[sub], str):
                        nested[sub] = translate_text(
                            text=nested[sub],
                            target_lang=lang,
                            source_lang="fr",
                        )

            # Cas liste d’objets (ex: "variantes": [{ "nom": "..." }, {...}])
            elif isinstance(nested, list):
                for item in nested:
                    if not isinstance(item, dict):
                        continue
                    for sub in subfields:
                        if sub in item and isinstance(item[sub], str):
                            item[sub] = translate_text(
                                text=item[sub],
                                target_lang=lang,
                                source_lang="fr",
                            )

        return data
