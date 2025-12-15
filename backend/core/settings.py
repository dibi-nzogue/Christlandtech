"""
Django settings for core project.

- PostgreSQL via variables d'environnement (.env)
- Cloudinary optionnel (USE_CLOUDINARY=True/False)
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# === Chemins ===
BASE_DIR = Path(__file__).resolve().parent.parent

# Charge le fichier .env situé dans backend/.env
load_dotenv(BASE_DIR / ".env")

# === Sécurité / Debug ===
SECRET_KEY = os.getenv("SECRET_KEY", "dev-insecure-key")
DEBUG = os.getenv("DEBUG", "True") == "True"

ALLOWED_HOSTS = os.getenv(
    "ALLOWED_HOSTS",
    "localhost,127.0.0.1,christlandtech.onrender.com",
).split(",")

# === Base de données ===
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("DB_NAME"),
        "USER": os.getenv("DB_USER"),
        "PASSWORD": os.getenv("DB_PASSWORD"),
        "HOST": os.getenv("DB_HOST"),
        "PORT": os.getenv("DB_PORT", "5432"),
    }
}

# === Static / Media (valeurs par défaut, potentiellement overridées plus bas) ===
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# === APPS ===
INSTALLED_APPS = [
    # Django
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Tiers
    "rest_framework",
    "corsheaders",
    "csp",

    # Cloudinary
    "cloudinary",
    "cloudinary_storage",

    # App principale
    "christland",
]

# === MIDDLEWARE ===
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",

    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",

    "csp.middleware.CSPMiddleware",
]

ROOT_URLCONF = "core.urls"

# === Templates ===
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "core.wsgi.application"

# ======================
# CSP (django-csp >= 4)
# ======================
CSP_DEFAULT_SRC = ("'self'",)

CSP_SCRIPT_SRC = (
    "'self'",
    "'unsafe-inline'",
)

CSP_STYLE_SRC = (
    "'self'",
    "'unsafe-inline'",
    "https://fonts.googleapis.com",
)

CSP_IMG_SRC = (
    "'self'",
    "data:",
    "https://res.cloudinary.com",
)

CSP_FONT_SRC = (
    "'self'",
    "https://fonts.gstatic.com",
)

CSP_CONNECT_SRC = (
    "'self'",
    "https://christlandtech.onrender.com",
    "https://christlandtech-frontend.onrender.com",
    "https://api.cloudinary.com",
    "https://res.cloudinary.com",
)

# === Traduction interne ===
I18N_TARGET_LANGS = ["en"]
AUTO_BUILD_TRANSLATIONS = True

# ======================
# Cloudinary (OPTIONNEL)
# ======================
CLOUDINARY_STORAGE = {
    "CLOUD_NAME": os.getenv("CLOUDINARY_CLOUD_NAME"),
    "API_KEY": os.getenv("CLOUDINARY_API_KEY"),
    "API_SECRET": os.getenv("CLOUDINARY_API_SECRET"),
}

USE_CLOUDINARY = os.getenv("USE_CLOUDINARY", "False") == "True"

if USE_CLOUDINARY:
    DEFAULT_FILE_STORAGE = "cloudinary_storage.storage.MediaCloudinaryStorage"
    MEDIA_URL = f"https://res.cloudinary.com/{os.getenv('CLOUDINARY_CLOUD_NAME')}/"
else:
    # On garde le stockage local
    DEFAULT_FILE_STORAGE = "django.core.files.storage.FileSystemStorage"
    MEDIA_URL = "/media/"
    MEDIA_ROOT = BASE_DIR / "media"

# ======================
# CORS / CSRF
# ======================
CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
    "x-lang",
]

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "https://christlandtech.onrender.com",
    "https://christlandtech-frontend.onrender.com",
    "https://christland.tech",
    "https://www.christland.tech",
]

if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True
else:
    CORS_ALLOWED_ORIGINS = [
        "https://christlandtech-frontend.onrender.com",
        "https://christland.tech",
        "https://www.christland.tech",
    ]

# === Password validation ===
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# === Internationalisation ===
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# =========================
# CONTACT / EMAIL
# =========================
CONTACT_INBOX = os.getenv("CONTACT_INBOX", "nzogue.dibiye@gmail.com")

EMAIL_BACKEND = os.getenv(
    "EMAIL_BACKEND",
    "django.core.mail.backends.smtp.EmailBackend",
)

EMAIL_HOST = os.getenv("EMAIL_HOST", "ssl0.ovh.net")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", "587"))
EMAIL_USE_TLS = os.getenv("EMAIL_USE_TLS", "True") == "True"

EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER")  # ex : rol@dibiye.com
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD")

DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", EMAIL_HOST_USER)
EMAIL_TIMEOUT = int(os.getenv("EMAIL_TIMEOUT", "20"))

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ======================
# DRF
# ======================
REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
    "DEFAULT_PARSER_CLASSES": ["rest_framework.parsers.JSONParser"],
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "christland.auth_jwt.JWTAuthentication",
    ),
}

# === Cache ===
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "christland-locmem-cache",
    }
}
