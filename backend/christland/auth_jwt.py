from datetime import timedelta
from typing import Optional, Tuple
from django.conf import settings
from django.utils import timezone
from rest_framework.authentication import BaseAuthentication, get_authorization_header
import jwt
from .models import Utilisateurs

JWT_ALGO = "HS256"
ACCESS_TTL_MIN = 60 * 24          # 24h
REFRESH_TTL_DAYS = 30


def make_access_token(user: Utilisateurs) -> str:
    now = timezone.now()
    payload = {
        "typ": "access",
        "uid": user.id,
        "email": user.email,
        "role": user.role,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=ACCESS_TTL_MIN)).timestamp()),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=JWT_ALGO)


def make_refresh_token(user: Utilisateurs) -> str:
    now = timezone.now()
    payload = {
        "typ": "refresh",
        "uid": user.id,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(days=REFRESH_TTL_DAYS)).timestamp()),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=JWT_ALGO)


def decode_jwt_raw(raw: str) -> Optional[dict]:
    """Décode un JWT brut (sans préfixe). Retourne le payload ou None si invalide."""
    try:
        return jwt.decode(raw, settings.SECRET_KEY, algorithms=[JWT_ALGO])
    except jwt.PyJWTError:
        return None


class JWTAuthentication(BaseAuthentication):
    """
    Authentification JWT “soft” :
    - Si aucun header → anonyme.
    - Si token invalide/expiré → anonyme (pas d’erreur).
    - Si token valide → request.user est rempli.
    """
    keyword = b"Bearer"

    def authenticate(self, request) -> Optional[Tuple[Utilisateurs, None]]:
        parts = get_authorization_header(request).split()

        # Pas d'en-tête Authorization correct → on laisse passer en anonyme
        if not parts or parts[0] != self.keyword or len(parts) != 2:
            return None

        token = parts[1].decode("utf-8").strip()
        if not token:
            return None

        payload = decode_jwt_raw(token)
        if not payload or payload.get("typ") != "access":
            # Soft: pas d'exception => utilisateur reste anonyme
            return None

        uid = payload.get("uid")
        if not uid:
            return None

        user = Utilisateurs.objects.filter(id=uid, actif=True).first()
        if not user:
            return None

        return (user, None)
