from core.settings import *

# Base de données en mémoire pour aller plus vite
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
    }
}

# Cache plus simple pour les tests
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "test-cache",
    } 
}

# Pour éviter d’envoyer des mails réels
EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"

# Désactiver éventuellement des middlewares lourds, etc.
