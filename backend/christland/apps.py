from django.apps import AppConfig


class ChristlandConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "christland"

    def ready(self):
        # importe les receivers pour qu'ils soient connectés
        from . import signals  # noqa: F401
