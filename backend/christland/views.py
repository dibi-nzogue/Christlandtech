from collections import defaultdict
from decimal import Decimal
from typing import Iterable
from urllib import request
from django.db.models import Count
from rest_framework import status, generics
from django.db.models import Q, Min, Max
from django.db.models.functions import Coalesce  # ✅ pour annoter min/max prix
from django.shortcuts import get_object_or_404
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from django.db.models import QuerySet
from django.views.decorators.http import require_GET
from django.http import JsonResponse
from django.conf import settings
from django.core.mail import EmailMessage
from django.utils import timezone
from rest_framework.decorators import api_view
import logging
logger = logging.getLogger(__name__)
from decimal import Decimal, InvalidOperation
# import requests
from django.http import JsonResponse, HttpResponseBadRequest
from django.core.cache import cache
from datetime import datetime
from django.utils import timezone
from christland.models import TextTranslation
from .models import (
    Categories, Produits, VariantesProduits, ImagesProduits,
    Marques, Couleurs, CategorieAttribut,
    Attribut, ValeurAttribut, SpecProduit, SpecVariante, ArticlesBlog, MessagesContact, Produits, VariantesProduits, Categories, Marques, 
    Couleurs, ArticlesBlog,Utilisateurs,

)
from django.utils.cache import _generate_cache_key  # optionnel
from django.views.decorators.vary import vary_on_headers
from django.utils.decorators import method_decorator
from django.core.cache import cache
from christland.services.i18n_translate import translate_field_for_instance
from rest_framework.permissions import AllowAny, IsAuthenticated
from .auth_jwt import JWTAuthentication, make_access_token, make_refresh_token, decode_jwt_raw
# import jwt
from django.db.models import Sum
from django.utils.text import slugify
from christland.services.text_translate import translate_text
from django.db.models import Subquery, OuterRef
from .serializers import (
    ProduitCardSerializer,
    ProduitsSerializer,
    ArticleDashboardSerializer,
    ArticleEditSerializer,
    ArticleCreateSerializer,
    CategorieMiniSerializer,
    MarqueMiniSerializer,
    CouleurMiniSerializer,
    CategoryDashboardSerializer,
     _etat_label, 
     get_request_lang,
)
from rest_framework.pagination import PageNumberPagination
from django.core.mail import send_mail
import json
from django.views.decorators.csrf import csrf_exempt
from django.utils.text import slugify
from django.db import transaction
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views import View
from django.core.files.storage import default_storage
from django.core import signing
from rest_framework.parsers import MultiPartParser, FormParser
import os, uuid,hashlib
from django.db import IntegrityError, transaction
from django.db.models import F
from rest_framework import status, permissions
from django.contrib.auth.hashers import check_password, make_password
from urllib.parse import urlparse


def normalize_image_url(raw):
    if not raw:
        return None

    raw = str(raw).strip()

    parsed = urlparse(raw)

    # Si on reçoit une URL complète: http://127.0.0.1:8000/media/...
    if parsed.scheme in ("http", "https"):
        path = parsed.path or ""
        # on retire le premier "/" pour stocker "media/..." ou "images/achat/..."
        return path.lstrip("/") or None

    # Sinon on considère que c'est déjà un chemin du style "images/achat/..."
    return raw.lstrip("/")


def _as_int(val):
    try:
        return int(val)
    except (TypeError, ValueError):
        return None

def _product_min_price(prod: Produits) -> Decimal | None:
    prices = []
    for v in prod.variantes.all():
        prix = v.prix_actuel()
        if prix is not None:
            prices.append(prix)
    return min(prices) if prices else None

def _descendants_ids(cat: Categories) -> list[int]:
    todo = [cat]
    ids = []
    while todo:
        c = todo.pop()
        ids.append(c.id)
        todo.extend(list(c.enfants.all()))
    return ids

def _product_main_image_url(request, prod: Produits) -> str | None:
    img = prod.images.filter(principale=True).first() or prod.images.order_by("position", "id").first()
    if not img or not getattr(img, "url", None):
        return None
    url = str(img.url).strip()
    if url.lower().startswith(("http://", "https://", "data:")):
        return url
    return request.build_absolute_uri(url)


def _image_accessor_name() -> str:
    """
    Retourne le nom du related name pour les images produit (ex: 'images', 'imagesproduits_set', etc.).
    On autodétecte le backward accessor vers ImagesProduits.
    """
    for f in Produits._meta.get_fields():
        if getattr(f, "is_relation", False) and getattr(f, "auto_created", False) and getattr(f, "one_to_many", False):
            if getattr(f, "related_model", None) and f.related_model is ImagesProduits:
                return f.get_accessor_name()
    # fallback le plus courant
    return "images"


def _apply_faceted_filters(qs, params, cate_ids: Iterable[int]):
    # 1) marque
    brand = params.get("brand")
    if brand:
        slugs = [s.strip() for s in brand.split(",") if s.strip()]
        qs = qs.filter(marque__slug__in=slugs)

    # 0) état produit
    etat = params.get("etat")
    if etat:
        etats = [s.strip() for s in etat.split(",") if s.strip()]
        qs = qs.filter(etat__in=etats)

    # 2) couleur
    color = params.get("color")
    if color:
        cs = [s.strip() for s in color.split(",") if s.strip()]
        qs = qs.filter(variantes__couleur__slug__in=cs)

    # 3) prix
    pmin = params.get("price_min")
    pmax = params.get("price_max")
    if pmin:
        try:
            val = Decimal(pmin)
            qs = qs.filter(Q(variantes__prix_promo__gte=val) | Q(variantes__prix__gte=val))
        except Exception:
            pass
    if pmax:
        try:
            val = Decimal(pmax)
            qs = qs.filter(Q(variantes__prix_promo__lte=val) | Q(variantes__prix__lte=val))
        except Exception:
            pass

    # 4) attributs dynamiques attr_<code>
    for key, val in params.items():
        if not key.startswith("attr_") or key.endswith("_min") or key.endswith("_max"):
            continue
        code = key[5:]
        values = [v.strip() for v in val.split(",") if v.strip()]
        try:
            attr = Attribut.objects.get(code=code, actif=True)
        except Attribut.DoesNotExist:
            continue

        q_attr = Q(specs__attribut=attr) | Q(variantes__specs__attribut=attr)

        if attr.type == Attribut.CHOIX:
            qs = qs.filter(
                q_attr & (
                    Q(specs__valeur_choice__slug__in=values) |
                    Q(variantes__specs__valeur_choice__slug__in=values)
                )
            )
        elif attr.type == Attribut.TEXTE:
            regex = "|".join(values)
            qs = qs.filter(
                q_attr & (
                    Q(specs__valeur_text__iregex=regex) |
                    Q(variantes__specs__valeur_text__iregex=regex)
                )
            )
        else:
            q_num = Q()
            nums = []
            for v in values:
                try:
                    nums.append(Decimal(v))
                except Exception:
                    pass
            if nums:
                q_num |= Q(specs__valeur_int__in=nums) | Q(variantes__specs__valeur_int__in=nums)
                q_num |= Q(specs__valeur_dec__in=nums) | Q(variantes__specs__valeur_dec__in=nums)

            vmin = params.get(f"attr_{code}_min")
            vmax = params.get(f"attr_{code}_max")
            if vmin:
                try:
                    dv = Decimal(vmin)
                    q_num &= (
                        Q(specs__valeur_int__gte=dv) | Q(variantes__specs__valeur_int__gte=dv) |
                        Q(specs__valeur_dec__gte=dv) | Q(variantes__specs__valeur_dec__gte=dv)
                    )
                except Exception:
                    pass
            if vmax:
                try:
                    dv = Decimal(vmax)
                    q_num &= (
                        Q(specs__valeur_int__lte=dv) | Q(variantes__specs__valeur_int__lte=dv) |
                        Q(specs__valeur_dec__lte=dv) | Q(variantes__specs__valeur_dec__lte=dv)
                    )
                except Exception:
                    pass

            if q_num:
                qs = qs.filter(q_attr & q_num)

    return qs.distinct()



class SmallPagination(PageNumberPagination):
    page_size = 24
    page_size_query_param = "page_size"
    max_page_size = 100


# -----------------------------
# 1) Liste produits (query params)
# -----------------------------

from rest_framework.response import Response

class CategoryProductList(generics.ListAPIView):
    serializer_class = ProduitCardSerializer
    pagination_class = SmallPagination

    def get_queryset(self):
        cat_slug = (self.request.query_params.get("category") or "tous").strip().lower()
        sub_slug = (self.request.query_params.get("subcategory") or "").strip().lower()

        if sub_slug:
            sub = get_object_or_404(Categories, slug=sub_slug, est_actif=True)
            cat_ids = [sub.id]
        elif cat_slug and cat_slug != "tous":
            cat = get_object_or_404(Categories, slug=cat_slug, est_actif=True)
            cat_ids = _descendants_ids(cat)
        else:
            cat_ids = list(
                Categories.objects.filter(est_actif=True).values_list("id", flat=True)
            )

        qs = (
            Produits.objects
            .filter(est_actif=True, visible=1, categorie_id__in=cat_ids)
            .select_related("categorie", "marque")
            .prefetch_related("images", "variantes")
            .distinct()
        )

        # Filtres facetés
        qs = _apply_faceted_filters(qs, self.request.query_params, cat_ids)

        # 🔎 Recherche multi-champs + traductions (nom)
               # 🔎 Recherche full-text multi-champs + traductions TextTranslation
        q = (self.request.query_params.get("q") or "").strip()
        if q:
            # langue courante (fr, en, ...)
            lang = get_request_lang(self.request)  # ex: "fr" / "en"

            # --- 1) recherche sur les champs FR (nom, slug, descriptions, marque, catégorie) ---
            terms = [t.strip() for t in q.split() if t.strip()]
            base_q = Q()
            if terms:
                for term in terms:
                    base_q &= (
                        Q(nom__icontains=term) |
                        Q(slug__icontains=term) |
                        Q(description_courte__icontains=term) |
                        Q(description_long__icontains=term) |
                        Q(marque__nom__icontains=term) |
                        Q(categorie__nom__icontains=term)
                    )

            ids_match: set[int] = set()
            if base_q:
                ids_match |= set(
                    qs.filter(base_q).values_list("id", flat=True)
                )

            # --- 2) si langue ≠ fr → chercher aussi dans TextTranslation ---
            if lang != "fr":
                # On cherche "lap" dans translated_text → ça retourne les noms FR d’origine
                translated_sources = (
                    TextTranslation.objects.filter(
                        source_lang="fr",
                        target_lang=lang,
                        translated_text__icontains=q,
                    )
                    .values_list("source_text", flat=True)
                )

                source_texts = list(set(translated_sources))
                if source_texts:
                    ids_match |= set(
                        qs.filter(nom__in=source_texts).values_list("id", flat=True)
                    )

            # Si on a des IDs → on restreint, sinon aucun résultat
            if ids_match:
                qs = qs.filter(id__in=ids_match).distinct()
            else:
                qs = qs.none()

        # Tri
        sort = self.request.query_params.get("sort")
        if sort in ("price_asc", "price_desc"):
            qs = qs.annotate(
                _min_price_tmp=Coalesce(
                    Min("variantes__prix_promo"),
                    Min("variantes__prix"),
                )
            )
            qs = qs.order_by(
                "_min_price_tmp" if sort == "price_asc" else "-_min_price_tmp",
                "-id",
            )
        elif sort == "new":
            qs = qs.order_by("-cree_le", "-id")
        else:
            qs = qs.order_by("-id")

        return qs

    @method_decorator(vary_on_headers("Accept-Language", "X-Lang"))
    def list(self, request, *args, **kwargs):
        lang = (
            request.query_params.get("lang")
            or request.headers.get("X-Lang")
            or request.headers.get("Accept-Language", "fr")
        )
        lang = (lang or "fr").split(",")[0].split("-")[0]
        cache_key = f"products_v2:{lang}:{request.get_full_path()}"

        cached = cache.get(cache_key)
        if cached:
            logger.info("CategoryProductList CACHE HIT %s", cache_key)
            return Response(cached)

        logger.info("CategoryProductList CACHE MISS %s", cache_key)

        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            response = self.get_paginated_response(serializer.data)
        else:
            serializer = self.get_serializer(queryset, many=True)
            response = Response(serializer.data)

        cache.set(cache_key, response.data, 180)
        return response


# -----------------------------
# 2) Facettes/filters (query params)
# -----------------------------

class CategoryFilters(APIView):
    """
    GET /api/catalog/filters/?category=tous|<slug_cat>&subcategory=<slug_sub>
    -> renvoie les filtres disponibles (options) selon le périmètre.
    """
    def get(self, request):
        lang = get_request_lang(request)
        cat_slug = (request.query_params.get("category") or "tous").strip().lower()
        sub_slug = (request.query_params.get("subcategory") or "").strip().lower()

        if sub_slug:
            sub = get_object_or_404(Categories, slug=sub_slug, est_actif=True)
            cat = sub
            cat_ids = [sub.id]
        elif cat_slug and cat_slug != "tous":
            cat = get_object_or_404(Categories, slug=cat_slug, est_actif=True)
            cat_ids = _descendants_ids(cat)
        else:
            cat = None
            cat_ids = list(Categories.objects.filter(est_actif=True).values_list("id", flat=True))

        base = Produits.objects.filter(est_actif=True, visible=1, categorie_id__in=cat_ids)

        # États (neuf / occasion / reconditionné)
        states_qs = base.exclude(etat__isnull=True).exclude(etat__exact="").values_list("etat", flat=True).distinct()
        states = []
        for v in states_qs:
            label = _etat_label(v, request=request)  # FR ou EN auto
            states.append({"value": v, "label": label})

        # Marques (brut – traduit par MarqueMiniSerializer si tu l'utilises ailleurs)
        marques_qs = Marques.objects.filter(produits__in=base).distinct().order_by("nom")
        marques = [{"nom": m.nom, "slug": m.slug, "logo_url": m.logo_url} for m in marques_qs]

                # Couleurs (avec traduction du nom)
        couleurs_qs = (
            Couleurs.objects
            .filter(variantes__produit__in=base)
            .distinct()
            .order_by("nom")
        )

        couleurs = []
        for c in couleurs_qs:
            name = c.nom or ""
            if lang != "fr" and name:
                name = translate_text(
                    text=name,
                    target_lang=lang,
                    source_lang="fr",
                )
            couleurs.append({
                "nom": name,
                "slug": c.slug,
                "code_hex": c.code_hex,
            })

        # Fallback global si aucune couleur dans la catégorie
        if not couleurs:
            fallback_qs = Couleurs.objects.filter(est_active=True).order_by("nom")
            for c in fallback_qs:
                name = c.nom or ""
                if lang != "fr" and name:
                    name = translate_text(
                        text=name,
                        target_lang=lang,
                        source_lang="fr",
                    )
                couleurs.append({
                    "nom": name,
                    "slug": c.slug,
                    "code_hex": c.code_hex,
                })

        # Prix min/max
        prix_aggr = VariantesProduits.objects.filter(produit__in=base).aggregate(
            min=Min("prix_promo"), min_fallback=Min("prix"),
            max=Max("prix_promo"), max_fallback=Max("prix"),
        )
        price_min = prix_aggr["min"] or prix_aggr["min_fallback"]
        price_max = prix_aggr["max"] or prix_aggr["max_fallback"]

        # Attributs dynamiques (inchangé – parfait)
        try:
            from .models import CategorieAttribut
            ca_qs = CategorieAttribut.objects.filter(categorie_id__in=cat_ids)\
                                            .select_related("attribut")\
                                            .order_by("ordre")
        except Exception:
            ca_qs = []

        attrs_meta = []
        seen = set()
        for ca in ca_qs:
            a = ca.attribut
            if a.id in seen or not a.actif:
                continue
            seen.add(a.id)
            meta = {"code": a.code, "libelle": a.libelle, "type": a.type}
            if a.type == Attribut.CHOIX:
                meta["options"] = list(ValeurAttribut.objects.filter(attribut=a).values("valeur", "slug").order_by("valeur"))
            attrs_meta.append(meta)

        # Séparation produit / variante
        prod_attr_codes = set(SpecProduit.objects.filter(produit__in=base).values_list("attribut__code", flat=True).distinct())
        var_attr_codes = set(SpecVariante.objects.filter(variante__produit__in=base).values_list("attribut__code", flat=True).distinct())

        def is_variant_attr(code: str) -> bool:
            c = (code or "").lower()
            return c == "couleur" or (c in var_attr_codes and c not in prod_attr_codes)

        attributes_product = [m for m in attrs_meta if not is_variant_attr(m["code"])]
        attributes_variant = [m for m in attrs_meta if is_variant_attr(m["code"])]

        # Catégorie courante
        category_data = {"nom": cat.nom, "slug": cat.slug} if cat else None

        payload = {
            "category": category_data,
            "brands": marques,
            "colors": couleurs,
            "price": {"min": float(price_min) if price_min else None, "max": float(price_max) if price_max else None},
            "states": states,
            "attributes_product": attributes_product,
            "attributes_variant": attributes_variant,
        }
        return Response(payload)


class CategoryListBase(APIView):
    """
    Liste des catégories (niveau 1 ou toutes)
    Traduction gérée par CategorieMiniSerializer
    """
    def get(self, request):
        level = (request.query_params.get("level") or "1").strip()
        qs = Categories.objects.filter(est_actif=True)
        if str(level) == "1":
            qs = qs.filter(parent__isnull=True)

        qs = qs.order_by("nom")

        # 🔁 on passe par le serializer pour déclencher I18nTranslateMixin
        serializer = CategorieMiniSerializer(
            qs, many=True, context={"request": request}
        )
        data = serializer.data

        # 👉 si tu veux garder image_url + position, on enrichit
        def abs_media(path):
            if not path:
                return None
            p = str(path).strip()
            if p.lower().startswith(("http://", "https://", "data:")):
                return p
            base = request.build_absolute_uri(settings.MEDIA_URL)
            return f"{base.rstrip('/')}/{p.lstrip('/')}"

        for item, c in zip(data, qs):
            item["image_url"] = abs_media(getattr(c, "image_url", None))
            item["position"] = getattr(c, "position", None)
            item["parent_id"] = c.parent_id 

        return Response(data)


class CategoryListPublic(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        qs = (
            Categories.objects
            .filter(est_actif=True)
            .order_by("nom")
        )

        serializer = CategorieMiniSerializer(
            qs, many=True, context={"request": request}
        )
        data = serializer.data

        # --- Fonction helper pour rendre l’image absolue ---
        def abs_media(path):
            if not path:
                return None
            p = str(path).strip()
            if p.lower().startswith(("http://", "https://", "data:")):
                return p
            base = request.build_absolute_uri(settings.MEDIA_URL)
            return f"{base.rstrip('/')}/{p.lstrip('/')}"

        # ------ 1️⃣ Préparation : on relie les objets et leur dict ------
        pairs = list(zip(qs, data))

        # ------ 2️⃣ On enrichit chaque item ------
        for c, item in pairs:
            item["image_url"] = abs_media(getattr(c, "image_url", None))
            item["position"] = getattr(c, "position", None)
            item["parent_id"] = c.parent_id
            item["children"] = []   # 👈 IMPORTANT ici !

        # ------ 3️⃣ On construit les sous-catégories ------
        by_id = {c.id: item for c, item in pairs}
        for c, item in pairs:
            if c.parent_id:
                parent_item = by_id.get(c.parent_id)
                if parent_item:
                    parent_item["children"].append({
                        "id": c.id,
                        "nom": item["nom"],
                        "slug": item["slug"],
                    })

        return Response(data)


class CategoryListDashboard(CategoryListBase):
    permission_classes = [IsAuthenticated]          # ✅ protégé
    authentication_classes = [JWTAuthentication]

    class CategoryListTop(APIView):
        """
    GET /christland/api/catalog/categories/top/
    👉 Ne renvoie que les catégories parents (niveau 1), sans sous-catégories
    """
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        qs = (
            Categories.objects
            .filter(est_actif=True, parent__isnull=True)  # 🚀 uniquement top-level
            .order_by("nom")
        )

        serializer = CategorieMiniSerializer(
            qs, many=True, context={"request": request}
        )
        data = serializer.data

        # 🔗 Absolutiser image_url et ajouter position
        def abs_media(path):
            if not path:
                return None
            p = str(path).strip()
            if p.lower().startswith(("http://", "https://")):
                return p
            base = request.build_absolute_uri(settings.MEDIA_URL)
            return f"{base.rstrip('/')}/{p.lstrip('/')}"

        for item, c in zip(data, qs):
            item["image_url"] = abs_media(getattr(c, "image_url", None))
            item["position"] = getattr(c, "position", None)
            item["parent_id"] = c.parent_id  # toujours None ici

        return Response(data)


class CategoryListTop(APIView):
    """
    GET /christland/api/catalog/categories/top/
    👉 Ne renvoie que les catégories parents (niveau 1), sans sous-catégories
    """
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        qs = (
            Categories.objects
            .filter(est_actif=True, parent__isnull=True)  # 🚀 uniquement top-level
            .order_by("nom")
        )

        serializer = CategorieMiniSerializer(
            qs, many=True, context={"request": request}
        )
        data = serializer.data

        # 🔗 Absolutiser image_url et ajouter position
        def abs_media(path):
            if not path:
                return None
            p = str(path).strip()
            if p.lower().startswith(("http://", "https://")):
                return p
            base = request.build_absolute_uri(settings.MEDIA_URL)
            return f"{base.rstrip('/')}/{p.lstrip('/')}"

        for item, c in zip(data, qs):
            item["image_url"] = abs_media(getattr(c, "image_url", None))
            item["position"] = getattr(c, "position", None)
            item["parent_id"] = c.parent_id  # toujours None ici

        return Response(data)



    
class ProductMiniView(APIView):
    """
    GET /christland/api/catalog/product/<pk_or_slug>/mini/
    -> { id, slug, nom, ref, image }
    - ref : premier SKU de variante si dispo, sinon slug produit
    - image : image principale (ou première) du produit
    Traduction gérée automatiquement par les serializers
    """
    def get(self, request, pk_or_slug: str):
        qs = Produits.objects.filter(est_actif=True, visible=1)\
                             .select_related("categorie", "marque")\
                             .prefetch_related("images", "variantes")

        if pk_or_slug.isdigit():
            prod = get_object_or_404(qs, id=int(pk_or_slug))
        else:
            prod = get_object_or_404(qs, slug=pk_or_slug)

        # Image principale
        img = prod.images.filter(principale=True).first() or prod.images.order_by("position", "id").first()
        img_url = ""
        if img and getattr(img, "url", None):
            img_url = str(img.url).strip()
            if not img_url.lower().startswith(("http://", "https://", "data:")):
                img_url = request.build_absolute_uri(img_url)

        # Référence (SKU ou slug)
        sku = (prod.variantes
               .exclude(sku__isnull=True)
               .exclude(sku__exact="")
               .values_list("sku", flat=True)
               .first()) or prod.slug
        payload = {
            "id": prod.id,
            "slug": prod.slug,   # ← traduit automatiquement si besoin
            "nom": prod.nom,     # ← traduit automatiquement par le serializer
            "ref": sku,
            "image": img_url,
        }

        return Response(payload) 
    
# --------- Helpers ----------
def _abs_media(request, path: str | None) -> str | None:
    """
    Transforme un chemin relatif en URL absolue avec MEDIA_URL
    """
    if not path:
        return None
    p = str(path).strip()
    if p.lower().startswith(("http://", "https://", "data:")):
        return p
    base = request.build_absolute_uri(settings.MEDIA_URL)
    return f"{base.rstrip('/')}/{p.lstrip('/')}"

# Nouvelle fonction propre – plus de _tr
from christland.services.text_translate import translate_text
from .serializers import get_request_lang  # tu l'as déjà importé plus haut

def _serialize_article(a: ArticlesBlog, request) -> dict:
    """
    Sérialise un article blog (utilisé par BlogPostsView)
    avec traduction automatique en fonction de la langue.
    """
    lang = get_request_lang(request) or "fr"
    lang = (lang or "fr").split(",")[0].split("-")[0].lower()

    # valeurs brutes FR
    title = a.titre or ""
    excerpt = a.extrait or ""
    content = a.contenu or ""

    # 🔁 si langue ≠ fr → on passe par translate_text (cache + Google)
    if lang != "fr":
        if title:
            title = translate_text(
                text=title,
                target_lang=lang,
                source_lang="fr",
            )
        if excerpt:
            excerpt = translate_text(
                text=excerpt,
                target_lang=lang,
                source_lang="fr",
            )
        if content:
            content = translate_text(
                text=content,
                target_lang=lang,
                source_lang="fr",
            )

    return {
        "id": a.id,
        "slug": a.slug,  # ❗ on NE traduit PAS le slug pour garder les URLs stables
        "title": title,
        "excerpt": excerpt,
        "content": content,
        "image": _abs_media(request, getattr(a, "image_couverture", None)),
    }



class BlogHeroView(APIView):
    def get(self, request):
        a = ArticlesBlog.objects.order_by("id").first()
        if not a:
            return Response({"title": "", "slug": ""})

        lang = get_request_lang(request) or "fr"
        lang = (lang or "fr").split(",")[0].split("-")[0].lower()

        # 🎯 Traduction du titre (si langue ≠ fr)
        title = a.titre or ""
        if lang != "fr" and title:
            title = translate_text(
                text=title,
                target_lang=lang,
                source_lang="fr",
            )

        # 🎯 Traduction du slug (puisqu’il n’est pas un lien technique)
        slug_text = a.slug or ""
        if lang != "fr" and slug_text:
            # On remplace les tirets avant traduction pour avoir un texte naturel
            slug_text_clean = slug_text.replace("-", " ").strip()

            slug_text = translate_text(
                text=slug_text_clean,
                target_lang=lang,
                source_lang="fr",
            )

        return Response({
            "title": title,
            "slug": slug_text,   # 👈 Maintenant le slug est bien traduit
        })


class BlogPostsView(APIView):
    """
    GET /christland/api/blog/posts/
    -> { "top": [...tous sauf les 2 derniers...], "bottom": [...2 derniers...] }
    L’ordre est chronologique (id ASC) pour que "les 2 derniers" restent en bas.
    """
    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx
    
    def get(self, request):
        qs: QuerySet[ArticlesBlog] = ArticlesBlog.objects.all().order_by("id")
        items = list(qs)

        if not items:
            return Response({"top": [], "bottom": []})

        if len(items) >= 2:
            top_items = items[:-2]
            bottom_items = items[-2:]
        else:
            top_items = []
            bottom_items = items

        data = {
            "top": [_serialize_article(a, request) for a in top_items],
            "bottom": [_serialize_article(a, request) for a in bottom_items],
        }
        return Response(data)


# --- helpers pour sérialiser uniquement les specs remplies ---

def _spec_value_from_obj(spec) -> str | None:
    """Retourne la valeur normalisée en string depuis SpecProduit/SpecVariante, ou None si vide."""
    if getattr(spec, "valeur_choice", None):
        return spec.valeur_choice.valeur
    if getattr(spec, "valeur_text", None):
        # "true"/"false" déjà gérés côté création ; on renvoie tel quel
        return spec.valeur_text
    if getattr(spec, "valeur_int", None) is not None:
        return str(spec.valeur_int)
    if getattr(spec, "valeur_dec", None) is not None:
        return str(spec.valeur_dec)
    return None


def _specs_to_filled_list(specs_qs):
    """
    Convertit un queryset de SpecProduit/SpecVariante en liste d'objets
    {code, type, libelle, unite?, value} **UNIQUEMENT** si une valeur est présente.
    """
    items = []
    for sp in specs_qs.select_related("attribut", "valeur_choice"):
        attr = sp.attribut
        if not attr or not attr.actif:
            continue
        val = _spec_value_from_obj(sp)
        if val in (None, ""):
            continue
        items.append({
            "code": attr.code,
            "type": attr.type,         # côté front tu as déjà un mapping -> "text|int|dec|bool|choice"
            "libelle": attr.libelle or attr.code,
            "unite": getattr(attr, "unite", "") or "",
            "value": val,
        })
    return items



# -----------------------------
# ESPACE ADMINISTRATEUR
# -----------------------------

# views.py
# views.py
class ProduitsListCreateView(generics.ListCreateAPIView):
    serializer_class = ProduitsSerializer
    pagination_class = SmallPagination
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        qs = (
            Produits.objects
            .filter(est_actif=True)
            .order_by('-cree_le', '-id')
            .select_related('marque', 'categorie')
            .prefetch_related('images', 'variantes')
            .distinct()
        )

        q = (self.request.query_params.get("q") or "").strip()
        if q:
            # Recherche simple et rapide en français uniquement (c’est le dashboard)
            # Pas besoin de traduction ici → on cherche dans le nom original
            qs = qs.filter(nom__icontains=q)

        return qs


class ProduitsDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Produits.objects.all()
    serializer_class = ProduitsSerializer
    permission_classes = [permissions.IsAuthenticated]          # ✅
    authentication_classes = [JWTAuthentication]  
    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["disable_i18n"] = True   # 🛑 ON BLOQUE TOUTE TRADUCTION ICI
        return ctx

# --- helpers pour image absolue et specs/prix ---

from typing import Optional

# utils URL
from urllib.parse import urljoin
from django.conf import settings


def _product_main_image_url(request, prod: Produits) -> str | None:
    img = (
        prod.images.filter(principale=True).first()
        or prod.images.order_by("position", "id").first()
    )
    return _abs_media(request, img.url if img else None)


def _product_min_price(prod: Produits) -> Optional[Decimal]:
    prices: list[Decimal] = []
    for v in prod.variantes.all():
        if v.prix_promo is not None:
            prices.append(Decimal(v.prix_promo))
        elif v.prix is not None:
            prices.append(Decimal(v.prix))
    return min(prices) if prices else None

def _product_specs_summary(prod: Produits, max_items: int = 5) -> str:
    """
    Construit un résumé texte court à partir des specs produit/variantes.
    Ex: "i5 10e gen | 16 Go RAM | 256 Go SSD | 13.3'' FHD"
    Adapte selon tes modèles si besoin.
    """
    lines: list[str] = []

    # Specs au niveau produit
    for sp in getattr(prod, "specs", []).all() if hasattr(prod, "specs") else []:
        label = getattr(sp.attribut, "libelle", "") or getattr(sp.attribut, "code", "")
        val = None
        if getattr(sp, "valeur_text", None):
            val = sp.valeur_text
        elif getattr(sp, "valeur_choice", None):
            val = sp.valeur_choice.valeur
        elif getattr(sp, "valeur_int", None) is not None:
            val = str(sp.valeur_int)
        elif getattr(sp, "valeur_dec", None) is not None:
            val = str(sp.valeur_dec)
        if label and val:
            lines.append(f"{val}")

    # Si rien côté produit, essaie une variante pour enrichir
    if not lines:
        var = prod.variantes.first()
        if var and hasattr(var, "specs"):
            for sv in var.specs.all():
                val = None
                if getattr(sv, "valeur_text", None):
                    val = sv.valeur_text
                elif getattr(sv, "valeur_choice", None):
                    val = sv.valeur_choice.valeur
                elif getattr(sv, "valeur_int", None) is not None:
                    val = str(sv.valeur_int)
                elif getattr(sv, "valeur_dec", None) is not None:
                    val = str(sv.valeur_dec)
                if val:
                    lines.append(f"{val}")

    # Limite et joint
    if not lines:
        return ""
    return " | ".join(lines[:max_items])

# views.py
class DashboardArticlesListCreateView(generics.ListCreateAPIView):
    serializer_class = ArticleDashboardSerializer
    pagination_class = SmallPagination
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def get_serializer_class(self):
        # 👉 GET = liste d’articles (dashboard)
        if self.request.method == "GET":
            return ArticleDashboardSerializer
        # 👉 POST = création d’article
        if self.request.method == "POST":
            return ArticleCreateSerializer
        # fallback
        return ArticleDashboardSerializer
    
    
    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx
    
    def get_queryset(self):
        q = (self.request.query_params.get("q") or "").strip()
        qs = (
            ArticlesBlog.objects
            .select_related("categorie", "auteur")
            .order_by("-cree_le", "-id")
        )
        if q:
            qs = qs.filter(
                Q(titre__icontains=q) |
                Q(extrait__icontains=q) |
                Q(contenu__icontains=q)
            )
        return qs


class DashboardArticleDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET/PUT/DELETE /christland/api/dashboard/articles/<id>/
    """
    queryset = ArticlesBlog.objects.all().order_by("-id")
    serializer_class = ArticleDashboardSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx 
class DashboardArticleEditView(generics.RetrieveAPIView):
    """
    ✅ GET /christland/api/dashboard/articles/<id>/edit/
    → ne renvoie que: id, titre, slug, extrait, contenu, image, publie_le
    """
    queryset = ArticlesBlog.objects.all()
    serializer_class = ArticleEditSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx

# views.py
class BlogLatestView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            limit = int(request.query_params.get("limit") or "2")
        except ValueError:
            limit = 2

        qs = ArticlesBlog.objects.all().order_by("-cree_le", "-id")[:max(1, limit)]

        lang = get_request_lang(request) or "fr"
        lang = (lang or "fr").split(",")[0].split("-")[0].lower()

        data = []
        for a in qs:
            title = a.titre or ""
            excerpt = a.extrait or ""

            if lang != "fr":
                if title:
                    title = translate_text(title, target_lang=lang, source_lang="fr")
                if excerpt:
                    excerpt = translate_text(excerpt, target_lang=lang, source_lang="fr")

            data.append({
                "id": a.id,
                "slug": a.slug,   # pas traduit
                "title": title,
                "excerpt": excerpt,
                "image": _abs_media(request, getattr(a, "image_couverture", None)),
            })

        return Response(data, status=200)

from christland.services.text_translate import translate_text

class LatestProductsView(APIView):
    permission_classes = [AllowAny]

    @method_decorator(vary_on_headers("Accept-Language", "X-Lang"))
    def get(self, request):
        # langue demandée
        lang = request.query_params.get("lang") or request.headers.get("X-Lang") or "fr"
        lang = (lang or "fr").split(",")[0].split("-")[0].lower()

        cache_key = f"latest:{lang}"
        cached = cache.get(cache_key)
        if cached:
            return Response(cached)

        # on récupère les 10 derniers produits actifs & visibles
        qs = (
            Produits.objects
            .filter(est_actif=True, visible=1)
            .select_related("marque", "categorie", "categorie__parent")  # 🔹 + parent
            .prefetch_related(
                "images",
                "variantes",
                "specs", "specs__attribut", "specs__valeur_choice",
                "variantes__specs", "variantes__specs__attribut", "variantes__specs__valeur_choice"
            )
            .order_by("-cree_le", "-id")[:10]
        )

        # base : on laisse le serializer faire son travail (nom, description, etc.)
        serializer = ProduitCardSerializer(qs, many=True, context={"request": request})
        base_data = list(serializer.data)

        results = []

        for item, prod in zip(base_data, qs):
            # on part de l'objet sérialisé
            obj = dict(item)

            # ---------- Specs (comme avant) ----------
            specs_text = ""
            if prod.specs.exists():
                specs_text = " | ".join([
                    sp.valeur_text
                    or (sp.valeur_choice.valeur if sp.valeur_choice else "")
                    or str(sp.valeur_int or sp.valeur_dec or "")
                    for sp in prod.specs.all()[:5]
                    if sp.valeur_text
                    or sp.valeur_choice
                    or sp.valeur_int is not None
                    or sp.valeur_dec is not None
                ])
            elif prod.variantes.exists():
                var = prod.variantes.first()
                if var and var.specs.exists():
                    specs_text = " | ".join([
                        sp.valeur_text
                        or (sp.valeur_choice.valeur if sp.valeur_choice else "")
                        or str(sp.valeur_int or sp.valeur_dec or "")
                        for sp in var.specs.all()[:5]
                        if sp.valeur_text
                        or sp.valeur_choice
                        or sp.valeur_int is not None
                        or sp.valeur_dec is not None
                    ])
            obj["specs"] = specs_text.strip()

            # ---------- Image principale ----------
            main_img = prod.images.filter(principale=True).first() or prod.images.order_by("position", "id").first()
            if main_img and main_img.url:
                url = str(main_img.url).strip()
                if not url.lower().startswith(("http://", "https://", "data:")):
                    url = request.build_absolute_uri(url)
                obj["image"] = url
            else:
                obj["image"] = None

            # ---------- Prix min ----------
          # On garde le price calculé par le serializer
            obj["price"] = item.get("price")

                       # État (utilise le helper i18n)
            obj["state"] = _etat_label(prod.etat, request=request)

            # ---------- Catégorie pour les onglets ----------
# ---------- Catégorie / Sous-catégorie pour les onglets ----------
            if prod.categorie:
                cat = prod.categorie

                # 1) on remonte jusqu'à la catégorie racine
                root = cat
                # si tu as max 2 niveaux, ça suffit ; sinon la boucle gère plusieurs niveaux
                while getattr(root, "parent_id", None):
                    root = root.parent

                # 2) nom traduit de la catégorie racine
                root_name = root.nom or ""
                if lang != "fr" and root_name:
                    root_name = translate_text(
                        text=root_name,
                        target_lang=lang,
                        source_lang="fr",
                    )

                # 🔹 catégorie utilisée pour les onglets = catégorie racine
                obj["category"] = {
                    "id": root.id,
                    "nom": root_name,
                    "slug": root.slug,
                }

                # (optionnel) exposer aussi la sous-catégorie si tu veux
                if cat.id != root.id:
                    sub_name = cat.nom or ""
                    if lang != "fr" and sub_name:
                        sub_name = translate_text(
                            text=sub_name,
                            target_lang=lang,
                            source_lang="fr",
                        )

                    obj["subcategory"] = {
                        "id": cat.id,
                        "nom": sub_name,
                        "slug": cat.slug,
                    }
                else:
                    obj["subcategory"] = None
            else:
                obj["category"] = None
                obj["subcategory"] = None

            results.append(obj)

        cache.set(cache_key, results,20)
        return Response(results)


from .models import MessagesContact

def _serialize_contact(m: MessagesContact) -> dict:
    return {
        "id": m.id,
        "nom": m.nom or "",
        "email": m.email or "",
        "telephone": m.telephone or "",
        "sujet": m.sujet or "",
        "message": m.message or "",
        "cree_le": m.cree_le,
    }

class ContactMessageView(APIView):
    """
    POST /christland/api/contact/messages/
      body: {nom?, email?, telephone?, sujet, message}
      -> enregistre + envoie un email (FROM = DEFAULT_FROM_EMAIL, REPLY-TO = email utilisateur si fourni)

    GET  /christland/api/contact/messages/?limit=50
      -> derniers messages
    """
    permission_classes = [AllowAny]
    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx
    
    def post(self, request):
        nom = (request.data.get("nom") or "").strip()
        email = (request.data.get("email") or "").strip()         # optionnel
        telephone = (request.data.get("telephone") or "").strip() # optionnel
        sujet = (request.data.get("sujet") or "").strip()
        message = (request.data.get("message") or "").strip()

        if not sujet or not message:
            return Response(
                {"detail": "sujet et message sont requis."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 1) Enregistrer en BD
        mc = MessagesContact.objects.create(
            nom=nom,
            email=email,
            telephone=telephone,
            sujet=sujet,
            message=message,
            cree_le=timezone.now(),
        )

        # 2) Envoyer l’e-mail
        to_addr = getattr(settings, "CONTACT_INBOX", None)
        from_addr = getattr(settings, "DEFAULT_FROM_EMAIL", None)

        if to_addr and from_addr:
            # On utilise EmailMessage pour injecter Reply-To proprement
            body = (
                f"Nom: {nom or '-'}\n"
                f"Email: {email or '-'}\n"
                f"Téléphone: {telephone or '-'}\n\n"
                f"Message:\n{message}"
            )
            mail = EmailMessage(
                subject=f"CHRISTLAND TECH {sujet}",
                body=body,
                from_email=from_addr,
                to=[to_addr],
                headers={"Reply-To": email} if email else None,
            )
            # On n’échoue pas la requête si l’envoi mail tombe (logguez si besoin)
            try:
                mail.send(fail_silently=True)
            except Exception:
                pass

        return Response({"ok": True, "message": "Message enregistré et envoyé."}, status=201)

    def get(self, request):
        try:
            limit = int(request.query_params.get("limit") or "50")
        except ValueError:
            limit = 50
        qs = MessagesContact.objects.all().order_by("-cree_le", "-id")[: max(1, limit)]
        return Response([_serialize_contact(m) for m in qs])
from rest_framework.permissions import IsAuthenticated  # si besoin


class DashboardProductEditDataView(APIView):
    """
    GET  /christland/api/dashboard/produits/<id>/edit/
         -> renvoie uniquement les champs REMPLIS pour faciliter l’édition :
            - product: champs simples + marque + catégorie + images
            - variant: 1ère variante (si présente)
            - product_attributes: specs produit **remplies**
            - variant_attributes: specs variante **remplies**

    PUT  /christland/api/dashboard/produits/<id>/edit/
         payload "flat" (comme ton formulaire) :
         - champs produit simples
         - champs de la 1ère variante (variante_*)
         - images: [{url, alt_text?, position?, principale?}]
         - product_attributes: [{code,type,libelle?,unite?,value}]
         - variant_attributes: [{code,type,libelle?,unite?,value}]
    
    
    """
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    # permission_classes = [IsAuthenticated]

    # ---------- READ (rempli uniquement) ----------
    
    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx
    def get(self, request, pk: int):
        qs = (
            Produits.objects
            .select_related("marque", "categorie")
            .prefetch_related(
                "images",
                "variantes",
                "variantes__couleur",
                "specs", "specs__attribut", "specs__valeur_choice",
                "variantes__specs", "variantes__specs__attribut", "variantes__specs__valeur_choice",
            )
        )
        prod = get_object_or_404(qs, pk=pk)

        images = [{
            "url": _abs_media(request, im.url),
            "alt_text": im.alt_text or "",
            "position": im.position,
            "principale": bool(im.principale),
        } for im in prod.images.all().order_by("position", "id") if im.url]

        all_vars = list(prod.variantes.all().order_by("id"))

        cat = prod.categorie  # raccourci
        parent_cat = cat.parent if cat and cat.parent_id else None

        payload = {
            "id": prod.id,
            "nom": prod.nom or "",
            "slug": prod.slug or "",
            "description_courte": prod.description_courte or "",
            "description_long": prod.description_long or "",
            "etat": prod.etat or "neuf",
            "est_actif": bool(prod.est_actif),
            "visible": prod.visible,
            "garantie_mois": getattr(prod, "garantie_mois", None),
            "poids_grammes": prod.poids_grammes,
            "dimensions": prod.dimensions or "",
            "marque": (
                {"id": prod.marque.id, "slug": prod.marque.slug, "nom": prod.marque.nom}
                if prod.marque_id else None
            ),
            # 🔹 Catégorie = parent si existant, sinon catégorie elle-même
            "categorie": (
                {
                    "id": parent_cat.id,
                    "slug": parent_cat.slug,
                    "nom": parent_cat.nom,
                    "parent_id": parent_cat.parent_id,
                } if parent_cat else (
                    {
                        "id": cat.id,
                        "slug": cat.slug,
                        "nom": cat.nom,
                        "parent_id": cat.parent_id,
                    } if cat else None
                )
            ),
            # 🔹 Sous-catégorie = enfant uniquement si cat a un parent
            "sous_categorie": (
                {
                    "id": cat.id,
                    "slug": cat.slug,
                    "nom": cat.nom,
                } if cat and cat.parent_id else None
            ),

            "images": images,
            "product_attributes": _specs_to_filled_list(prod.specs.all()) if hasattr(prod, "specs") else [],
        }


        # 🔹 toutes les variantes
        variants_payload = []
        for v in all_vars:
            variants_payload.append({
                "id": v.id,
                "nom": v.nom or "",
                "sku": v.sku or "",
                "code_barres": v.code_barres or "",
                "prix": v.prix,
                "prix_promo": v.prix_promo,
                "promo_active": bool(v.promo_active),
                "promo_debut": v.promo_debut,
                "promo_fin": v.promo_fin,
                "stock": v.stock,
                "prix_achat": getattr(v, "prix_achat", None),
                "variante_poids_grammes": getattr(v, "poids_grammes", None),
                "variante_est_actif": bool(getattr(v, "est_actif", True)),
                "couleur": (
                    {"id": v.couleur.id, "slug": v.couleur.slug, "nom": v.couleur.nom}
                    if v.couleur_id else None
                ),
            })

        # tableau complet (pour ton ProductEditForm)
        payload["variants"] = variants_payload
        payload["variantes"] = variants_payload  # alias au cas où le front lit 'variantes'

        # compat : on garde aussi "variant" = 1ère variante + ses attributes
        if all_vars:
            first = all_vars[0]
            payload["variant"] = variants_payload[0]
            payload["variant_attributes"] = _specs_to_filled_list(first.specs.all()) if hasattr(first, "specs") else []
        else:
            payload["variant"] = None
            payload["variant_attributes"] = []


        return Response(payload, status=status.HTTP_200_OK)

    # ---------- UPDATE (deep) ----------
    @transaction.atomic
    def put(self, request, pk: int):
        prod = get_object_or_404(
            Produits.objects.select_related("marque", "categorie").prefetch_related(
                "images", "variantes", "variantes__specs", "specs"
            ),
            pk=pk
        )
        data = request.data

        # ---- Produit : champs simples ----
        for fld in [
            "nom", "slug", "description_courte", "description_long",
            "garantie_mois", "poids_grammes", "dimensions", "etat", "visible", "est_actif"
        ]:
            if fld in data:
                setattr(prod, fld, data.get(fld))

                # Catégorie / Sous-catégorie (optionnelles)
        cat_obj = None

        # 🔹 Priorité à la sous_categorie si fournie
        if "sous_categorie" in data and data["sous_categorie"]:
            cat_obj = Categories.objects.filter(id=_as_int(data["sous_categorie"])).first()
        elif "categorie" in data and data["categorie"]:
            cat_obj = Categories.objects.filter(id=_as_int(data["categorie"])).first()

        if cat_obj:
            prod.categorie = cat_obj


        # Marque (obligatoire côté création, ici optionnelle pour l’update)
        if "marque" in data and data["marque"]:
            m, _note = _resolve_marque_verbose(data["marque"])
            if m:
                prod.marque = m

        prod.save()

        # ---- Variante (1re, créée si absente) ----
        var = prod.variantes.order_by("id").first()
        if not var:
            var = VariantesProduits.objects.create(produit=prod, nom=prod.nom or "", prix=0)

        def _set_if_present(obj, key, transform=lambda x: x):
            if key in data:
                setattr(obj, key, transform(data.get(key)))

        _set_if_present(var, "nom",        lambda v: v or prod.nom or "")
        _set_if_present(var, "sku",        lambda v: v or "")
        _set_if_present(var, "code_barres",lambda v: v or "")
        _set_if_present(var, "prix")
        _set_if_present(var, "prix_promo")
        _set_if_present(var, "promo_active", bool)
        if "promo_debut" in data:
            var.promo_debut = _parse_dt_local(data.get("promo_debut"))
        if "promo_fin" in data:
            var.promo_fin = _parse_dt_local(data.get("promo_fin"))
        _set_if_present(var, "stock",      lambda v: v or 0)
        _set_if_present(var, "prix_achat")
        _set_if_present(var, "poids_grammes", lambda v: data.get("variante_poids_grammes"))
        if "variante_poids_grammes" in data:
            var.poids_grammes = data.get("variante_poids_grammes")
        _set_if_present(var, "est_actif",  lambda v: data.get("variante_est_actif") if "variante_est_actif" in data else getattr(var, "est_actif", True))
        if "variante_est_actif" in data:
            var.est_actif = bool(data.get("variante_est_actif"))

        if "couleur" in data:
            var.couleur = _resolve_couleur(data.get("couleur"))

        var.save()

        # Miroir attribut "couleur"
        if var.couleur_id:
            attr_c = _get_or_create_attr("couleur", Attribut.CHOIX, "Couleur")
            va_c   = _upsert_valeur_choice(attr_c, var.couleur.nom)
            SpecVariante.objects.update_or_create(
                variante=var, attribut=attr_c,
                defaults={"valeur_choice": va_c, "valeur_text": None, "valeur_int": None, "valeur_dec": None},
            )

        # ---- Images (remplacement par la liste reçue) ----
        if "images" in data:
            imgs = _clean_images_payload(data.get("images"))
            # on remplace simplement l’existant
            prod.images.all().delete()
            for i, im in enumerate(imgs, start=1):
                ImagesProduits.objects.create(
                    produit=prod,
                    url=im["url"],
                    alt_text=im.get("alt_text", "") or "",
                    position=im.get("position") or i,
                    principale=bool(im.get("principale", False)),
                )

                # ---- Attributs Produit ----
        for it in data.get("product_attributes", []) or []:
            code = (it.get("code") or "").strip().lower()
            if not code:
                continue

            raw_value = it.get("value", None)

            # 🔒 Si aucune vraie valeur envoyée → on NE TOUCHE PAS à la spec existante
            if raw_value in (None, "", [], {}):
                continue

            attr = _get_or_create_attr(
                code,
                it.get("type"),
                it.get("libelle"),
                it.get("unite"),
            )
            if not attr or not attr.actif:
                continue

            _write_spec_produit(prod, attr, raw_value)


        # ---- Attributs Variante ----
        for it in data.get("variant_attributes", []) or []:
            code = (it.get("code") or "").strip().lower()
            if not code:
                continue
            if code == "couleur" and var.couleur_id:
                # ne pas dupliquer "couleur" si déjà gérée via FK
                continue
            attr = _get_or_create_attr(code, it.get("type"), it.get("libelle"), it.get("unite"))
            if not attr or not attr.actif:
                continue
            _write_spec_variante(var, attr, it.get("value"))

        return Response(
            {"ok": True, "message": "Produit mis à jour.", "id": prod.id},
            status=status.HTTP_200_OK
        )
    
class MarquesListView(APIView):
    """
    GET /christland/api/catalog/marques/?q=&active_only=1
    -> [{id, nom, slug, logo_url}]
    Traduction gérée automatiquement par MarqueMiniSerializer
    """
    permission_classes = [AllowAny]

    def get(self, request):
        q = (request.query_params.get("q") or "").strip()
        active_only = request.query_params.get("active_only", "").lower() in ("1", "true", "yes")

        qs = Marques.objects.all().order_by("nom")
        if active_only:
            qs = qs.filter(Q(est_active=True) | Q(est_active__isnull=True))
        if q:
            qs = qs.filter(Q(nom__icontains=q) | Q(slug__icontains=q))

        data = [
            {
                "id": m.id,
                "nom": m.nom,          # ← traduit automatiquement
                "slug": m.slug,
                "logo_url": m.logo_url,
            }
            for m in qs
        ]

        return Response(data)


class CouleursListView(APIView):
    """
    GET /christland/api/catalog/couleurs/?q=&active_only=1
    -> [{id, nom, slug, code_hex, est_active}]
    Traduction gérée automatiquement par CouleurMiniSerializer
    """
    permission_classes = [AllowAny]

    def get(self, request):
        q = (request.query_params.get("q") or "").strip()
        active_only = request.query_params.get("active_only", "").lower() in ("1", "true", "yes")

        qs = Couleurs.objects.all().order_by("nom")
        if active_only:
            qs = qs.filter(est_active=True)
        if q:
            qs = qs.filter(Q(nom__icontains=q) | Q(slug__icontains=q))

        serializer = CouleurMiniSerializer(
            qs, many=True, context={"request": request}
        )
        return Response(serializer.data)
# views.py (ajoute/replace ces parties)
import re
from django.db.utils import IntegrityError

def _integrity_to_field_error(exc: IntegrityError):
    msg = str(exc)

    # SQLite: "UNIQUE constraint failed: app_model.field"
    m = re.search(r"UNIQUE constraint failed:\s*([^.]+)\.([^.]+)\.([^\s]+)", msg, re.I)
    if m:
        field = m.group(3)
        return field, "Cette valeur existe déjà."

    # Postgres: 'violates unique constraint "app_model_field_key"'
    m = re.search(r'violates unique constraint\s+"([^"]+)"', msg, re.I)
    if m:
        parts = m.group(1).split("_")
        if parts and parts[-1] in ("key", "uniq", "unique"):
            parts = parts[:-1]
        if parts:
            return parts[-1], "Cette valeur existe déjà."

    return None, "Contrainte d’unicité violée."

# ---------- Helpers uniques ----------
def _as_int(val):
    try:
        return int(val)
    except Exception:
        return None

def _resolve_marque_verbose(val):
    """
    -> (obj|None, note:str|None)
    - id (int/"12") -> récupère
    - nom (str)     -> get_or_create
    - None/""       -> None
    note ∈ {"created","exists"} quand créé/existant, sinon None
    """
    if val in (None, ""):
        return None, None

    maybe_id = _as_int(val)
    if maybe_id:
        obj = Marques.objects.filter(id=maybe_id).first()
        return (obj, "exists" if obj else None)

    name = str(val).strip()
    if not name:
        return None, None

    obj, created = Marques.objects.get_or_create(
        nom=name,
        defaults={"slug": slugify(name)}
    )
    return obj, ("created" if created else "exists")

def _resolve_couleur(val):
    """
    Résout une couleur à partir de :
      - un id (int / "12")
      - un nom ("Beige", "beige", " BEIGE ")
    en respectant la contrainte UNIQUE sur Couleurs.slug.
    """
    if val in (None, ""):
        return None

    # 1) id numérique ?
    maybe_id = _as_int(val)
    if maybe_id:
        return Couleurs.objects.filter(id=maybe_id).first()

    # 2) nom -> slug
    name = str(val).strip()
    if not name:
        return None

    slug = slugify(name)
    if not slug:
        return None

    # 3) On essaie d'abord de récupérer par slug ou nom__iexact
    existing = Couleurs.objects.filter(
        Q(slug=slug) | Q(nom__iexact=name)
    ).first()
    if existing:
        # Optionnel : si le nom est vide ou différent, on peut le rafraîchir
        if not existing.nom:
            existing.nom = name
            existing.save(update_fields=["nom"])
        return existing

    # 4) Sinon on crée ; si une autre requête a créé entre-temps,
    #    on rattrape l'IntegrityError et on relit.
    try:
        return Couleurs.objects.create(nom=name, slug=slug)
    except IntegrityError:
        return Couleurs.objects.filter(slug=slug).first()


def _clean_images_payload(images):
    """
    Accepte:
      - ["https://...jpg", ...] OU
      - [{url, alt_text?, position?, principale?}, ...]
    -> Nettoie, force une seule 'principale', normalise position->int|None
    """
    out = []
    for it in (images or []):
        if isinstance(it, str):
            url = it.strip()
            alt = ""
            pos = None
            principale = False
        elif isinstance(it, dict):
            url = (it.get("url") or "").strip()
            alt = (it.get("alt_text") or "").strip()
            pos = it.get("position", None)
            try:
                pos = int(pos) if pos not in (None, "") else None
            except Exception:
                pos = None
            principale = bool(it.get("principale", False))
        else:
            continue

        if not url:
            continue

        out.append({"url": url, "alt_text": alt, "position": pos, "principale": principale})

    if not out:
        return []

    # Forcer une seule principale (la première true sinon la 1ère image)
    if not any(x["principale"] for x in out):
        out[0]["principale"] = True
    else:
        seen = False
        for x in out:
            if x["principale"] and not seen:
                seen = True
            else:
                x["principale"] = False
    return out

def _parse_dt_local(s: str | None):
    """
    Accepte:
      - '2025-10-24T14:30' ou '2025-10-24T14:30:45' (datetime-local HTML)
      - '24/10/2025 14:30' ou '24/10/2025 14:30:45' (affichage FR)
    Retourne un datetime aware (TZ serveur) ou None.
    """
    if not s:
        return None
    for fmt in ("%Y-%m-%dT%H:%M", "%Y-%m-%dT%H:%M:%S",
                "%d/%m/%Y %H:%M", "%d/%m/%Y %H:%M:%S"):
        try:
            dt = datetime.strptime(s, fmt)
            return timezone.make_aware(dt, timezone.get_current_timezone())
        except ValueError:
            continue
    return None



# ---------- Upload image ----------
class UploadProductImageView(APIView):
    """
    POST /christland/api/uploads/images/
    form-data:
      - file: <image>
      - alt_text: (optionnel)
    -> { url, alt_text }
    """
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        f = request.FILES.get("file")
        if not f:
            return Response({"error": "Aucun fichier reçu (clé 'file')."}, status=400)

        name, ext = os.path.splitext(f.name)
        safe_name = slugify(name) or "image"
        unique = uuid.uuid4().hex[:8]
        rel_dir = "uploads/produits"
        rel_path = f"{rel_dir}/{safe_name}-{unique}{ext.lower()}"

        # assure le dossier
        full_dir = os.path.join(settings.MEDIA_ROOT, rel_dir)
        os.makedirs(full_dir, exist_ok=True)

        # sauvegarde (retourne path relatif depuis MEDIA_ROOT)
        saved_path = default_storage.save(rel_path, f)

        # construit URL absolue
        media_url = settings.MEDIA_URL.rstrip("/")
        abs_url = request.build_absolute_uri(f"{media_url}/{saved_path}")

        return Response({
            "url": abs_url,
            "alt_text": request.data.get("alt_text") or ""
        }, status=201)

# ---------- ATTRIBUTS: helpers génériques ----------
def _get_or_create_attr(code: str, type_hint: str | None = None, libelle: str | None = None, unite: str | None = None):
    """
    Récupère/Crée un Attribut par code. Si création:
    - type = type_hint ou TEXTE par défaut
    - libelle = libelle ou code
    - unite si fournie
    """
    code = (code or "").strip().lower()
    if not code:
        return None
    attr, created = Attribut.objects.get_or_create(
        code=code,
        defaults={
            "libelle": libelle or code.replace("_", " ").title(),
            "type": (type_hint if type_hint in dict(Attribut.TYPES) else Attribut.TEXTE),
            "unite": unite or "",
            "ordre": 0,
            "actif": True,
        },
    )
    # si déjà existant et on te donne une unite, on peut la compléter sans casser
    if not created and unite and not attr.unite:
        attr.unite = unite
        attr.save(update_fields=["unite"])
    return attr

def _upsert_valeur_choice(attr: Attribut, raw_value: str):
    """Crée/retourne ValeurAttribut pour un attribut CHOIX."""
    val = (str(raw_value or "")).strip()
    if not val:
        return None
    slug = slugify(val)[:140] or uuid.uuid4().hex[:8]
    va, _ = ValeurAttribut.objects.get_or_create(
        attribut=attr, slug=slug,
        defaults={"valeur": val},
    )
    return va

def _coerce_numeric(value):
    """Essaie de caster en int puis decimal, sans jamais laisser les deux à None."""
    if value is None or value == "":
        return None, None

    s = str(value).strip()

    iv = None
    dv = None

    # toujours tenter int
    try:
        iv = int(s)
    except Exception:
        iv = None

    # toujours tenter Decimal (même si int a marché)
    try:
        dv = Decimal(s)
    except InvalidOperation:
        dv = None

    return iv, dv

def _write_spec_produit(produit: Produits, attr: Attribut, raw_value):
    """
    Écrit/Met à jour SpecProduit selon le type de l'attribut.
    ⚠️ IMPORTANT :
      - si raw_value est vide / None / invalide -> on NE TOUCHE PAS à la spec existante
        (pas d'update, pas de delete)
    """

    # 👉 1) si aucune valeur envoyée -> on ne modifie rien
    if raw_value in (None, "", [], {}):
        return

    if attr.type == Attribut.CHOIX:
        va = _upsert_valeur_choice(attr, raw_value)
        if not va:
            return
        SpecProduit.objects.update_or_create(
            produit=produit,
            attribut=attr,
            defaults={
                "valeur_choice": va,
                "valeur_text": None,
                "valeur_int": None,
                "valeur_dec": None,
            },
        )

    elif attr.type in (Attribut.TEXTE, Attribut.BOOLEEN):
        # bool -> "true"/"false" en texte lisible
        if attr.type == Attribut.BOOLEEN:
            txt = str(bool(raw_value)).lower()
        else:
            txt = str(raw_value).strip()
            if txt == "":
                # valeur vide -> on ne change rien
                return

        SpecProduit.objects.update_or_create(
            produit=produit,
            attribut=attr,
            defaults={
                "valeur_text": txt,
                "valeur_choice": None,
                "valeur_int": None,
                "valeur_dec": None,
            },
        )

    else:
        # ENTIER / DECIMAL
        iv, dv = _coerce_numeric(raw_value)
        if iv is None and dv is None:
            # valeur numérique invalide -> ne rien faire
            return

        SpecProduit.objects.update_or_create(
            produit=produit,
            attribut=attr,
            defaults={
                "valeur_int": iv if attr.type == Attribut.ENTIER else None,
                "valeur_dec": dv if attr.type == Attribut.DECIMAL else None,
                "valeur_text": None,
                "valeur_choice": None,
            },
        )


def _write_spec_variante(variante: VariantesProduits, attr: Attribut, raw_value):
    """
    Idem pour SpecVariante.
    - ne modifie la spec que si une vraie valeur est envoyée
    """

    # 👉 1) si aucune valeur envoyée -> on ne modifie rien
    if raw_value in (None, "", [], {}):
        return

    if attr.type == Attribut.CHOIX:
        va = _upsert_valeur_choice(attr, raw_value)
        if not va:
            return
        SpecVariante.objects.update_or_create(
            variante=variante,
            attribut=attr,
            defaults={
                "valeur_choice": va,
                "valeur_text": None,
                "valeur_int": None,
                "valeur_dec": None,
            },
        )

    elif attr.type in (Attribut.TEXTE, Attribut.BOOLEEN):
        if attr.type == Attribut.BOOLEEN:
            txt = str(bool(raw_value)).lower()
        else:
            txt = str(raw_value).strip()
            if txt == "":
                return

        SpecVariante.objects.update_or_create(
            variante=variante,
            attribut=attr,
            defaults={
                "valeur_text": txt,
                "valeur_choice": None,
                "valeur_int": None,
                "valeur_dec": None,
            },
        )

    else:
        iv, dv = _coerce_numeric(raw_value)
        if iv is None and dv is None:
            return

        SpecVariante.objects.update_or_create(
            variante=variante,
            attribut=attr,
            defaults={
                "valeur_int": iv if attr.type == Attribut.ENTIER else None,
                "valeur_dec": dv if attr.type == Attribut.DECIMAL else None,
                "valeur_text": None,
                "valeur_choice": None,
            },
        )

def _validate_required_attributes(categorie: Categories | None, product_attrs: list[dict], variant_attrs: list[dict]):
    """
    Vérifie que tous les attributs marqués 'obligatoire=True' pour la catégorie
    sont bien présents soit côté produit, soit côté variante.
    """
    if not categorie:
        return None  # pas de catégorie -> on ne valide pas ici
    try:
        req = list(
            CategorieAttribut.objects
            .filter(categorie=categorie, obligatoire=True, attribut__actif=True)
            .select_related("attribut")
            .values_list("attribut__code", flat=True)
        )
    except Exception:
        return None

    if not req:
        return None

    present_codes = { (a.get("code") or "").strip().lower() for a in (product_attrs or []) } | \
                    { (a.get("code") or "").strip().lower() for a in (variant_attrs or []) }

    missing = [c for c in req if c not in present_codes]
    if missing:
        return f"Attribut(s) obligatoire(s) manquant(s): {', '.join(missing)}"
    return None



# ---------- Création produit + variante + images ----------
@method_decorator(csrf_exempt, name="dispatch")
class AddProductWithVariantView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx
    
    def post(self, request, *args, **kwargs):
        

        # ✅ Utiliser directement les données déjà parsées par DRF
        # (NE PLUS LIRE request.body)
        if isinstance(request.data, dict):
            payload = request.data.copy()
        else:
            # au cas où ce soit un QueryDict
            payload = dict(request.data)


        # ===== CATEGORIE / SOUS-CATEGORIE =====
        raw_sub = payload.get("sous_categorie")
        raw_cat = payload.get("categorie")

        categorie = None

        # 1) d'abord la sous-catégorie si envoyée
        if raw_sub:
            sub_id = _as_int(raw_sub)
            if sub_id:
                categorie = Categories.objects.filter(id=sub_id).first()
            else:
                categorie = Categories.objects.filter(slug=str(raw_sub).strip()).first()

        # 2) sinon on tombe en fallback sur categorie
        elif raw_cat:
            cat_id = _as_int(raw_cat)
            if cat_id:
                categorie = Categories.objects.filter(id=cat_id).first()
            else:
                categorie = Categories.objects.filter(slug=str(raw_cat).strip()).first()


        # ===== VALIDATIONS SIMPLES =====
        nom = (payload.get("nom") or "").strip()
        if not nom:
            return JsonResponse({"field": "nom", "error": "Le nom du produit est requis."}, status=400)
        # description courte (OBLIGATOIRE)
        description_courte = (payload.get("description_courte") or "").strip()
        if not description_courte:
            return JsonResponse(
                {"field": "description_courte", "error": "La description courte est requise."},
                status=400
            )

        # etat (neuf | reconditionné | occasion)
        etat_raw = (payload.get("etat") or "").strip().lower()
        if etat_raw in ("reconditionne", "reconditionné", "reconditionne'", "reconditionnee"):
            etat_value = "reconditionné"
        elif etat_raw in ("neuf",):
            etat_value = "neuf"
        elif etat_raw in ("occasion",):
            etat_value = "occasion"
        else:
            etat_value = "neuf"

        visible = payload.get("visible", 1)
        if visible not in (0, 1, None):
            return JsonResponse(
                {"field": "visible", "error": "Visible doit être 1 (oui) ou 0 (non)."},
                status=400
            )

        # ===== VARIANTS =====
        variants_payload = payload.get("variants") or []

        # rétro-compatibilité : si pas de "variants", on construit une seule variante
        if not variants_payload:
            variants_payload = [{
                "nom": payload.get("variante_nom") or nom,
                "sku": payload.get("sku"),
                "code_barres": payload.get("code_barres"),
                "prix": payload.get("prix"),
                "prix_promo": payload.get("prix_promo"),
                "promo_active": payload.get("promo_active"),
                "promo_debut": payload.get("promo_debut"),
                "promo_fin": payload.get("promo_fin"),
                "stock": payload.get("stock"),
                "couleur": payload.get("couleur"),
                "variante_poids_grammes": payload.get("variante_poids_grammes"),
                "variante_est_actif": payload.get("variante_est_actif", True),
                "prix_achat": payload.get("prix_achat"),
                "attributes": payload.get("variant_attributes") or [],
            }]

        # au moins une variante
        if not variants_payload:
            return JsonResponse(
                {"field": "variants", "error": "Au moins une variante est requise."},
                status=400
            )

        # chaque variante doit avoir un prix
        for idx, v in enumerate(variants_payload, start=1):
            if v.get("prix") in (None, ""):
                return JsonResponse(
                    {
                        "field": f"variants[{idx-1}].prix",
                        "error": "Le prix est requis pour chaque variante."
                    },
                    status=400
                )



        marque_raw = payload.get("marque", None)
        if not marque_raw:
            return JsonResponse({"field": "marque", "error": "La marque est requise."}, status=400)

        # ⚠️ NE *PAS* RÉÉCRASER categorie ICI (on garde celle trouvée juste au-dessus)
        # # catégorie (facultatif)
        # categorie = None
        # if payload.get("categorie"):
        #     categorie = Categories.objects.filter(id=_as_int(payload["categorie"])).first()

        # ===== COULEUR (facultatif) =====
        couleur = _resolve_couleur(payload.get("couleur"))
        if couleur:
            attr_couleur, _ = Attribut.objects.get_or_create(
                code="couleur",
                defaults={
                    "libelle": "Couleur",
                    "type": Attribut.CHOIX,
                    "ordre": 0,
                    "actif": True,
                },
            )
            ValeurAttribut.objects.get_or_create(
                attribut=attr_couleur,
                slug=(couleur.slug or slugify(couleur.nom or ""))[:140],
                defaults={"valeur": couleur.nom or ""},
            )

        # ===== IMAGES =====
        images_clean = _clean_images_payload(payload.get("images"))
        if not images_clean:
            return JsonResponse({"field": "images", "error": "Au moins une image est requise."}, status=400)

        # ===== MARQUE =====
        marque, marque_note = _resolve_marque_verbose(marque_raw)
        if not marque:
            return JsonResponse({"field": "marque", "error": "Marque introuvable/invalid."}, status=400)
        
        # ===== VÉRIFIER SI LE PRODUIT EXISTE DÉJÀ (même nom + même marque + même catégorie) =====
        duplicate_msg = (
            "Un produit avec ce nom existe déjà. "
            "Veuillez le modifier dans la liste des produits "
            "si vous avez de nouveaux éléments à ajouter."
        )

        existing_qs = Produits.objects.filter(nom__iexact=nom)

        # si on a réussi à résoudre la marque, on filtre aussi par marque
        if marque:
            existing_qs = existing_qs.filter(marque=marque)

        # si une catégorie est trouvée, on filtre aussi par catégorie
        if categorie:
            existing_qs = existing_qs.filter(categorie=categorie)

        if existing_qs.exists():
            return JsonResponse({"error": duplicate_msg}, status=400)
        

        # ===== SLUG PRODUIT =====
               # ===== SLUG PRODUIT =====
        raw_slug = (payload.get("slug") or "").strip()
        slug = slugify(raw_slug or nom) or "produit"


        # ===== CHAMPS VARIANTE SUPPLÉMENTAIRES =====
        promo_debut = _parse_dt_local(payload.get("promo_debut"))
        promo_fin   = _parse_dt_local(payload.get("promo_fin"))
        prix_achat  = payload.get("prix_achat") or None
        var_poids   = payload.get("variante_poids_grammes") or None
        var_actif   = bool(payload.get("variante_est_actif", True))

        try:
            with transaction.atomic():
                # ---------- PRODUIT ----------
                produit = Produits.objects.create(
                    nom=nom,
                    slug=slug,
                     description_courte=description_courte,
                    description_long=payload.get("description_long", "") or "",
                    garantie_mois=payload.get("garantie_mois") or None,
                    poids_grammes=payload.get("poids_grammes") or None,
                    dimensions=payload.get("dimensions", "") or "",
                    categorie=categorie,   # ✅ on garde la catégorie trouvée (id ou slug)
                    marque=marque,
                    est_actif=bool(payload.get("est_actif", False)),
                    visible=(visible if visible in (0, 1) else 1),
                    etat=etat_value,
                )

                variants_payload = payload.get("variants") or []

                # rétro-compatibilité : si pas de "variants", on construit une seule variante
                if not variants_payload:
                    variants_payload = [{
                        "nom": payload.get("variante_nom") or nom,
                        "sku": payload.get("sku"),
                        "code_barres": payload.get("code_barres"),
                        "prix": payload.get("prix"),
                        "prix_promo": payload.get("prix_promo"),
                        "promo_active": payload.get("promo_active"),
                        "promo_debut": payload.get("promo_debut"),
                        "promo_fin": payload.get("promo_fin"),
                        "stock": payload.get("stock"),
                        "couleur": payload.get("couleur"),
                        "variante_poids_grammes": payload.get("variante_poids_grammes"),
                        "variante_est_actif": payload.get("variante_est_actif", True),
                        "prix_achat": payload.get("prix_achat"),
                        "attributes": payload.get("variant_attributes") or [],
                    }]

                # ---------- IMAGES ----------
                for i, img in enumerate(images_clean, start=1):
                    ImagesProduits.objects.create(
                        produit=produit,
                        url=img["url"],
                        alt_text=img.get("alt_text", "") or "",
                        position=img.get("position", None) or i,
                        principale=bool(img.get("principale", False)),
                    )

                                # ---------- ATTRIBUTS: validation "obligatoire" ----------
                product_attrs = payload.get("product_attributes") or []

                # on agrège les attributs de TOUTES les variantes
                variant_attrs_all = []
                for v in variants_payload:
                    variant_attrs_all.extend(v.get("attributes") or [])

                miss_msg = _validate_required_attributes(categorie, product_attrs, variant_attrs_all)

                if miss_msg:
                    raise IntegrityError(miss_msg)

                # ---------- ATTRIBUTS PRODUIT ----------
                for item in product_attrs:
                    code = (item.get("code") or "").strip().lower()
                    if not code:
                        continue
                    type_hint = item.get("type")
                    libelle = item.get("libelle")
                    unite   = item.get("unite")
                    value   = item.get("value")

                    attr = _get_or_create_attr(code, type_hint, libelle, unite)
                    if not attr or not attr.actif:
                        continue
                    _write_spec_produit(produit, attr, value)

                             # ---------- VARIANTES (plusieurs) ----------
                variantes_creees = []

                for v in variants_payload:
                    v_nom    = v.get("nom") or nom
                    v_sku    = v.get("sku") or None
                    v_code   = v.get("code_barres") or ""
                    v_prix   = v.get("prix")
                    v_promo  = v.get("prix_promo") or None
                    v_pa     = v.get("prix_achat") or None
                    v_stock  = v.get("stock") or 0
                    v_poids  = v.get("variante_poids_grammes") or None
                    v_actif  = bool(v.get("variante_est_actif", True))
                    v_promo_debut = _parse_dt_local(v.get("promo_debut"))
                    v_promo_fin   = _parse_dt_local(v.get("promo_fin"))

                    v_couleur = _resolve_couleur(v.get("couleur"))

                    variante = VariantesProduits.objects.create(
                        produit=produit,
                        nom=v_nom,
                        sku=v_sku,
                        code_barres=v_code,
                        prix=v_prix,
                        prix_promo=v_promo,
                        promo_active=bool(v.get("promo_active", False)),
                        promo_debut=v_promo_debut,
                        promo_fin=v_promo_fin,
                        stock=v_stock,
                        couleur=v_couleur,
                        poids_grammes=v_poids,
                        prix_achat=v_pa,
                        est_actif=v_actif,
                    )
                    variantes_creees.append(variante)

                    # ---------- ATTRIBUTS VARIANTE (pour CETTE variante) ----------
                    for item in v.get("attributes") or []:
                        code = (item.get("code") or "").strip().lower()
                        if not code:
                            continue
                        if code == "couleur" and variante.couleur_id:
                            # pas de doublon "couleur"
                            continue

                        type_hint = item.get("type")
                        libelle   = item.get("libelle")
                        unite     = item.get("unite")
                        value     = item.get("value")

                        attr = _get_or_create_attr(code, type_hint, libelle, unite)
                        if not attr or not attr.actif:
                            continue
                        _write_spec_variante(variante, attr, value)

                    # ---------- MIROIR ATTRIBUT "couleur" ----------
                    if variante.couleur_id:
                        attr_couleur = _get_or_create_attr("couleur", Attribut.CHOIX, "Couleur")
                        va_couleur   = _upsert_valeur_choice(attr_couleur, variante.couleur.nom)
                        SpecVariante.objects.update_or_create(
                            variante=variante, attribut=attr_couleur,
                            defaults={
                                "valeur_choice": va_couleur,
                                "valeur_text": None,
                                "valeur_int": None,
                                "valeur_dec": None,
                            },
                        )


            return JsonResponse(
                {
                    "ok": True,
                    "message": "Votre produit a bien été enregistré.",
                    "produit_id": produit.id,
                    "variante_ids": [v.id for v in variantes_creees],
                    "notes": {
                        "marque_message": (
                            "Marque créée." if (marque_note == "created")
                            else "Marque existante." if (marque_note == "exists")
                            else ""
                        )
                    },
                },
                status=201,
            )

        except IntegrityError as ie:
            field, human = _integrity_to_field_error(ie)
            payload_err = {"error": "Intégrité BD", "detail": str(ie)}
            if field:
                payload_err["field"] = field
                payload_err["field_errors"] = {field: human}
            return JsonResponse(payload_err, status=400)


class ProductClickView(APIView):
    """
    POST /christland/api/catalog/products/<pk>/click/
    -> { ok: True, count: <nouvelle valeur> }
    Incrémente le compteur quand un utilisateur clique sur "Commander".
    """
    permission_classes = [AllowAny]
    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx 
    
    def post(self, request, pk: int):
        prod = get_object_or_404(Produits.objects.all(), pk=pk)
        Produits.objects.filter(pk=prod.pk).update(commande_count=F('commande_count') + 1)
        prod.refresh_from_db(fields=['commande_count'])
        return Response({"ok": True, "count": prod.commande_count}, status=200)

class MostDemandedProductsView(APIView):
    """
    GET /christland/api/catalog/products/most-demanded/?limit=2
    -> [ {id, slug, nom, image, price, count}, ... ]
    """
    permission_classes = [AllowAny]          # ← rendu public
    authentication_classes = []   
    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx 
    
    def get(self, request):
        limit = int(request.query_params.get("limit", 2))
        qs = Produits.objects.filter(est_actif=True, visible=1)\
                             .select_related("marque", "categorie")\
                             .prefetch_related("images", "variantes")\
                             .order_by("-commande_count", "-id")[:limit]

        serializer = ProduitCardSerializer(qs, many=True, context={"request": request})
        return Response(serializer.data)      
    


def _prod_img(request, produit):
    """
    Renvoie l’URL absolue de l’image principale du produit.
    """
    # Essaye d’abord via la relation ImagesProduits (principale=True)
    img = produit.images.filter(principale=True).first() or produit.images.first()
    if img:
        # Si c’est un FileField, prends son .url
        for field in ("fichier", "image", "photo", "fichier_image"):
            f = getattr(img, field, None)
            if f and hasattr(f, "url"):
                return request.build_absolute_uri(f.url) if request else f.url
        # sinon tente d’utiliser le champ texte 'url'
        val = getattr(img, "url", None)
        if val:
            if val.startswith("http"):
                return val
            return request.build_absolute_uri(f"{settings.MEDIA_URL}{val}") if request else f"{settings.MEDIA_URL}{val}"
    return None
    
class AdminGlobalSearchView(APIView):
    """
    GET /christland/api/dashboard/search/?q=...&page=1&page_size=10
    - Produits: filtre SUR 'nom' uniquement
    - Articles: filtre SUR 'titre' OU 'extrait' OU 'contenu'
    - Les autres champs sont juste renvoyés (affichage)
    """

    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx

    def get(self, request):
        q = (request.query_params.get("q") or "").strip()
        if not q:
            return Response({
                "count": 0,
                "next": None,
                "previous": None,
                "results": [],
            })

        # -------- Pagination safe --------
        try:
            page = max(1, int(request.query_params.get("page") or 1))
        except ValueError:
            page = 1
        try:
            page_size = max(1, min(50, int(request.query_params.get("page_size") or 10)))
        except ValueError:
            page_size = 10

        # -------- Produits: filtre UNIQUEMENT sur nom --------
        pqs = (
            Produits.objects
            .select_related("marque", "categorie")
            .prefetch_related("images", "variantes")
            .filter(Q(nom__icontains=q))              # 👈 uniquement nom
            .order_by("-cree_le", "-id")              # modifie_le n'existe pas -> on garde cree_le
        )

        prod_items = []
        for p in pqs[:200]:
            prod_items.append({
                "type": "product",
                "id": p.id,
                "title": p.nom or "",
                "excerpt": (p.description_courte or "")[:220],  # affichage seulement
                "image": _prod_img(request, p),
                "url": f"/Dashboard/Modifier/{p.id}",
                "created_at": getattr(p, "cree_le", None),
                "updated_at": None,
                "brand": getattr(p.marque, "nom", None),
                "category": getattr(p.categorie, "nom", None),
            })

        # -------- Articles: filtre sur titre OU extrait OU contenu --------
        axs = (
            ArticlesBlog.objects
            .filter(
                Q(titre__icontains=q) |
                Q(extrait__icontains=q) |
                Q(contenu__icontains=q)
            )
            .order_by("-modifie_le", "-cree_le", "-id")
        )

        article_items = []
        for a in axs[:200]:
            article_items.append({
                "type": "article",
                "id": a.id,
                "title": a.titre or "",
                "excerpt": (a.extrait or "")[:220],
                "image": _abs_media(request, getattr(a, "image_couverture", None)),
                "url": f"/Dashboard/Articles/{a.id}/edit",
                "created_at": getattr(a, "cree_le", None),
                "updated_at": getattr(a, "modifie_le", None),
            })

        # -------- Fusion + tri (updated, sinon created) --------
        items = prod_items + article_items

        def _key(x):
            ts = x.get("updated_at") or x.get("created_at") or datetime.min.replace(tzinfo=timezone.utc)
            return (ts, x["id"])

        items.sort(key=_key, reverse=True)

        # -------- Pagination manuelle --------
        total = len(items)
        start = (page - 1) * page_size
        end = start + page_size
        results = items[start:end]

        base = request.build_absolute_uri(request.path)
        qs = request.GET.copy()
        qs["page_size"] = str(page_size)

        def _page_url(n):
            if n < 1 or (n - 1) * page_size >= total:
                return None
            qs["page"] = str(n)
            return f"{base}?{qs.urlencode()}"

        return Response({
            "count": total,
            "next": _page_url(page + 1),
            "previous": _page_url(page - 1),
            "results": results,
        }, status=status.HTTP_200_OK)


class DashboardStatsView(APIView):
    """
    GET /christland/api/dashboard/stats/

    Réponse:
    {
      "users": 123,               # nb d'utilisateurs
      "products_stock": 456,      # somme des stocks sur VariantesProduits.stock
      "products": 78,             # (optionnel) nombre de Produits (distinct produits)
      "articles": 12,             # nb d'articles blog
      "messages": 34              # nb de messages contact
    }
    """
   
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx
    
    def get(self, request):
        users_count = Utilisateurs.objects.count()
        articles_count = ArticlesBlog.objects.count()
        messages_count = MessagesContact.objects.count()
        products_count = Produits.objects.count()

        stock_total = VariantesProduits.objects.aggregate(
            total=Coalesce(Sum("stock"), 0)
        )["total"] or 0

        data = {
            "users": users_count,
            "products_stock": int(stock_total),
            "products": products_count,   # utile si tu veux l’afficher aussi
            "articles": articles_count,
            "messages": messages_count,
        }
        return Response(data, status=status.HTTP_200_OK)        
 # --------------------------------------------------------------------
# Permissions
# --------------------------------------------------------------------
class IsAdmin(permissions.BasePermission):
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx
    
    def has_permission(self, request, view):
        u = getattr(request, "user", None)
        return bool(u and getattr(u, "role", "") == "admin")


# --------------------------------------------------------------------
# Register (admin only)
# POST /christland/api/dashboard/auth/register/
# body: { email, password, prenom?, nom? }
# --------------------------------------------------------------------
class RegisterView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [AllowAny]  # on laisse AllowAny, on gère la logique dedans
    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx
    
    @csrf_exempt
    def post(self, request):
        already_has_admin = Utilisateurs.objects.filter(role="admin", actif=True).exists()
        if already_has_admin:
            u = getattr(request, "user", None)
            if not u or getattr(u, "role", "") != "admin":
                return Response({"detail": "Permission refusée."}, status=403)
        
        email = (request.data.get("email") or "").strip().lower()
        password = request.data.get("password") or ""
        prenom = (request.data.get("prenom") or "").strip()
        nom = (request.data.get("nom") or "").strip()

        if not email or not password:
            return Response({"detail": "Email et mot de passe requis."},
                            status=status.HTTP_400_BAD_REQUEST)

        if Utilisateurs.objects.filter(email=email).exists():
            return Response({"detail": "Cet email est déjà utilisé."},
                            status=status.HTTP_400_BAD_REQUEST)

        # y a-t-il déjà au moins un admin ?
        already_has_admin = Utilisateurs.objects.filter(role="admin", actif=True).exists()

        # si un admin existe, il faut être authentifié ET admin pour créer un autre admin
        if already_has_admin:
            user = getattr(request, "user", None)
            if not user or not getattr(user, "is_authenticated", False):
                return Response({"detail": "Authentification requise."}, status=status.HTTP_401_UNAUTHORIZED)
            if getattr(user, "role", None) != "admin":
                return Response({"detail": "Permission refusée."}, status=status.HTTP_403_FORBIDDEN)

        # => crée un ADMIN (comme tu le souhaites)
        u = Utilisateurs.objects.create(
            email=email,
            mot_de_passe_hash=make_password(password),
            prenom=prenom, nom=nom,
            actif=True, role="admin",
            cree_le=timezone.now(), modifie_le=timezone.now(),
        )
        return Response({
            "user": {"id": u.id, "email": u.email, "prenom": u.prenom, "nom": u.nom, "role": u.role}
        }, status=status.HTTP_201_CREATED)


# --------------------------------------------------------------------
# Refresh token -> new access
# POST /christland/api/dashboard/auth/refresh/
# body: { refresh }
# --------------------------------------------------------------------
class RefreshView(APIView):
    permission_classes = [permissions.AllowAny]

    @csrf_exempt
    def post(self, request):
        token = (request.data.get("refresh") or "").strip()
        payload = decode_jwt_raw(token)  # ⬅️ on décode le JWT brut
        if not payload or payload.get("typ") != "refresh":
            return Response({"detail": "Refresh token invalide."}, status=status.HTTP_401_UNAUTHORIZED)

        uid = payload.get("uid")
        user = Utilisateurs.objects.filter(id=uid, actif=True).first()
        if not user:
            return Response({"detail": "Utilisateur introuvable."}, status=status.HTTP_401_UNAUTHORIZED)

        new_access = make_access_token(user)
        return Response({"access": new_access}, status=status.HTTP_200_OK)


# --------------------------------------------------------------------
# Login -> access + refresh
# POST /christland/api/dashboard/auth/login/
# body: { email, password }
# --------------------------------------------------------------------
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    @csrf_exempt
    def post(self, request):
        email = (request.data.get("email") or "").strip().lower()
        password = request.data.get("password") or ""
        if not email or not password:
            return Response({"detail": "Email et mot de passe requis."},
                            status=status.HTTP_400_BAD_REQUEST)

        user = Utilisateurs.objects.filter(email__iexact=email, actif=True).first()
        if not user or not user.mot_de_passe_hash:
            return Response({"detail": "Identifiants invalides."},
                            status=status.HTTP_401_UNAUTHORIZED)

        if not check_password(password, user.mot_de_passe_hash):
            return Response({"detail": "Identifiants invalides."},
                            status=status.HTTP_401_UNAUTHORIZED)

        access = make_access_token(user)
        refresh = make_refresh_token(user)

        return Response({
            "access": access,
            "refresh": refresh,
            "user": {
                "id": user.id,
                "email": user.email,
                "prenom": user.prenom,
                "nom": user.nom,
                "role": user.role,
            }
        }, status=status.HTTP_200_OK)


# --------------------------------------------------------------------
# Me (profil courant)
# GET /christland/api/dashboard/auth/me/
# --------------------------------------------------------------------
class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        u = request.user
        return Response({
            "id": u.id,
            "email": u.email,
            "prenom": u.prenom,
            "nom": u.nom,
            "role": u.role,
        }, status=status.HTTP_200_OK)

# ==========================
#   CATEGORIES - DASHBOARD
# ==========================

class DashboardCategoryListCreateView(generics.ListCreateAPIView):
    """
    GET  /christland/api/dashboard/categories/manage/
    POST /christland/api/dashboard/categories/manage/
    """
    queryset = Categories.objects.all().order_by("-id")
    serializer_class = CategoryDashboardSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def get(self, request, *args, **kwargs):
        q = (request.query_params.get("q") or "").strip()

        qs = Categories.objects.all().order_by("-cree_le", "-id")

        if q:
            qs = qs.filter(
                Q(nom__icontains=q) |
                Q(description__icontains=q)
            )

        paginator = SmallPagination()
        page = paginator.paginate_queryset(qs, request, view=self)

        rows = []
        for c in page:
            rows.append({
                "id": c.id,
                "nom": c.nom or "",
                "slug": c.slug or "",   # 👈 avec le fix 1)
                "description": c.description or "",
                "est_actif": bool(c.est_actif),
                "parent_id": c.parent_id,
                "parent_nom": c.parent.nom if c.parent_id else "",
            })

        return paginator.get_paginated_response(rows)


    def post(self, request):
        nom = (request.data.get("nom") or "").strip()
        description = (request.data.get("description") or "").strip()
        est_actif = bool(request.data.get("est_actif", False))

        # parent: on accepte "parent" ou "parent_id"
        parent_id = request.data.get("parent") or request.data.get("parent_id")
        parent = None
        if parent_id:
            try:
                parent = Categories.objects.get(pk=int(parent_id))
            except (Categories.DoesNotExist, ValueError, TypeError):
                return Response(
                    {"field": "parent", "error": "Catégorie parente invalide."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if not nom:
            return Response(
                {"field": "nom", "error": "Le nom de la catégorie est requis."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # slug automatique simple
        slug_val = slugify(nom)
        raw_image = request.data.get("image_url")
        image_val = normalize_image_url(raw_image)

        cat = Categories.objects.create(
            nom=nom,
            slug=slug_val,
            description=description,
            est_actif=est_actif,
            parent=parent,
            cree_le=timezone.now(),
            image_url=image_val,
        )


        return Response(
            {
                "id": cat.id,
                "nom": cat.nom,
                "description": cat.description,
                "est_actif": cat.est_actif,
                "parent_id": cat.parent_id,
                "parent_nom": cat.parent.nom if cat.parent_id else "",
            },
            status=status.HTTP_201_CREATED,
        )


class DashboardCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /christland/api/dashboard/categories/manage/<id>/
    PUT    /christland/api/dashboard/categories/manage/<id>/
    DELETE /christland/api/dashboard/categories/manage/<id>/
    """
    queryset = Categories.objects.all()
    serializer_class = CategoryDashboardSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def get_object(self):
        pk = self.kwargs.get("pk")
        return get_object_or_404(Categories, pk=pk)
    
    def patch(self, request, pk: int):
        # on réutilise la même logique que PUT
        return self.put(request, pk)
    

    def get(self, request, pk: int):
        c = self.get_object()
        return Response(
            {
                "id": c.id,
                "nom": c.nom or "",
                "description": c.description or "",
                "slug": c.slug or "",
                "est_actif": bool(c.est_actif),
                "parent_id": c.parent_id,
                "parent_nom": c.parent.nom if c.parent_id else "",
            }
        )


    def put(self, request, pk: int):
        c = self.get_object()
        nom = (request.data.get("nom") or "").strip()
        description = (request.data.get("description") or "").strip()
        est_actif = bool(request.data.get("est_actif", False))

        parent_id = request.data.get("parent") or request.data.get("parent_id")
        parent = None
        if parent_id:
            try:
                parent = Categories.objects.get(pk=int(parent_id))
            except (Categories.DoesNotExist, ValueError, TypeError):
                return Response(
                    {"field": "parent", "error": "Catégorie parente invalide."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # sécurité : empêcher qu'une catégorie soit son propre parent
            if parent.id == c.id:
                return Response(
                    {"field": "parent", "error": "Une catégorie ne peut pas être son propre parent."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if not nom:
            return Response(
                {"field": "nom", "error": "Le nom de la catégorie est requis."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        c.nom = nom
        
        c.description = description
        c.est_actif = est_actif
        c.parent = parent
        raw_image = request.data.get("image_url", None)
        if raw_image is not None:
            new_image = normalize_image_url(raw_image)
            if new_image:
                c.image_url = new_image

        # on recalcule le slug si vide
        if not c.slug:
            c.slug = slugify(nom)

        c.save()

        return Response(
            {
                "id": c.id,
                "nom": c.nom,
                "slug": c.slug or "",
                "description": c.description,
                "est_actif": c.est_actif,
                "parent_id": c.parent_id,
                "parent_nom": c.parent.nom if c.parent_id else "",
            },
            status=status.HTTP_200_OK,
        )


    def delete(self, request, pk: int):
        c = self.get_object()

        # Empêcher la suppression si des sous-catégories existent
        if Categories.objects.filter(parent=c).exists():
            return Response(
                {"error": "Impossible de supprimer une catégorie qui possède des sous-catégories."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        c.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    
class DashboardCategoriesSelectView(APIView):
    """
    GET /christland/api/dashboard/categories/select/
    -> [
         { "id": 1, "nom": "Informatique", "slug": "informatique", "parent_id": null },
         { "id": 2, "nom": "Ordinateurs portables", "slug": "ordinateurs-portables", "parent_id": 1 },
         ...
       ]
    ⚠️ AUCUNE TRADUCTION : on renvoie exactement les champs FR de la base.
    """
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        q = (request.query_params.get("q") or "").strip()

        qs = Categories.objects.all().order_by("nom")
        if q:
            qs = qs.filter(
                Q(nom__icontains=q) |
                Q(description__icontains=q)
            )

        data = [
            {
                "id": c.id,
                "nom": c.nom or "",
                "slug": c.slug or "",
                "parent_id": c.parent_id,
            }
            for c in qs
        ]
        return Response(data)
class DashboardCategoriesTreeView(APIView):
    """
    GET /christland/api/dashboard/categories/tree/
    -> [
         {
           "id": 1,
           "nom": "Informatique",
           "slug": "informatique",
           "parent_id": null,
           "children": [
             { "id": 2, "nom": "Ordinateurs portables", "slug": "ordinateurs-portables", "parent_id": 1 },
             ...
           ]
         },
         ...
       ]
    ⚠️ Toujours en FR brut, pas de traduction.
    """
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        qs = Categories.objects.all().order_by("nom")

        # 1) on prépare un dict {id: item_dict}
        by_id: dict[int, dict] = {}
        for c in qs:
            by_id[c.id] = {
                "id": c.id,
                "nom": c.nom or "",
                "slug": c.slug or "",
                "parent_id": c.parent_id,
                "children": [],
            }

        # 2) on attache chaque catégorie à son parent si parent_id existe
        roots: list[dict] = []
        for c in qs:
            item = by_id[c.id]
            if c.parent_id:
                parent_item = by_id.get(c.parent_id)
                if parent_item:
                    parent_item["children"].append(item)
                else:
                    # parent manquant (au cas où) -> on le traite comme racine
                    roots.append(item)
            else:
                roots.append(item)

        return Response(roots)
