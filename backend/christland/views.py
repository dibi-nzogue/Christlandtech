from collections import defaultdict
from decimal import Decimal
from typing import Iterable
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
from .models import (
    Categories, Produits, VariantesProduits, ImagesProduits,
    Marques, Couleurs, CategorieAttribut,
    Attribut, ValeurAttribut, SpecProduit, SpecVariante, ArticlesBlog, MessagesContact, Produits, VariantesProduits, Categories, Marques, 
    Couleurs, ArticlesBlog,Utilisateurs,

)
from django.db.models import Sum
from django.utils.text import slugify
from django.db.models import Subquery, OuterRef
from .serializers import ProduitCardSerializer, ProduitsSerializer, ArticleDashboardSerializer, ArticleEditSerializer, ArticleCreateSerializer
from datetime import datetime
from rest_framework.pagination import PageNumberPagination
from django.core.mail import send_mail
from rest_framework.permissions import AllowAny
import json
from django.views.decorators.csrf import csrf_exempt
from django.utils.text import slugify
from django.db import transaction
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views import View
from django.core.files.storage import default_storage
import os
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils.text import slugify
import os, uuid
from django.db import IntegrityError, transaction
from django.db.models import F
from rest_framework.permissions import AllowAny

# -----------------------------
# Helpers
# -----------------------------

class SmallPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


def _descendants_ids(cat: Categories) -> list[int]:
    todo = [cat]
    ids = []
    while todo:
        c = todo.pop()
        ids.append(c.id)
        todo.extend(list(c.enfants.all()))
    return ids


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

class CategoryProductList(ListAPIView):
    """
    GET /api/catalog/products/?category=tous|<slug_cat>&subcategory=<slug_sub>&page=&page_size=&sort=&q=
    Facettes en query:
      brand=canon,nikon
      color=black,white
      price_min=10000&price_max=300000
      attr_*=...
      sort=price_asc|price_desc|new
      q=<texte>   # 👈 recherche par nom (icontains)
    """
    serializer_class = ProduitCardSerializer
    pagination_class = SmallPagination

    def get_queryset(self):
        cat_slug = (self.request.query_params.get("category") or "tous").strip().lower()
        sub_slug = (self.request.query_params.get("subcategory") or "").strip().lower()

        # Périmètre catégorie
        if sub_slug:
            sub = get_object_or_404(Categories, slug=sub_slug, est_actif=True)
            cat_ids = [sub.id]
        elif cat_slug and cat_slug != "tous":
            cat = get_object_or_404(Categories, slug=cat_slug, est_actif=True)
            cat_ids = _descendants_ids(cat)
        else:
            cat_ids = list(Categories.objects.filter(est_actif=True).values_list("id", flat=True))

        img_accessor = _image_accessor_name()
        qs = (
            Produits.objects.filter(est_actif=True, visible=1, categorie_id__in=cat_ids)
            .select_related("categorie", "marque")
            .prefetch_related(img_accessor, "variantes", "variantes__couleur")
            .distinct()
        )

        # 👇 Recherche sur le nom
        q = (self.request.query_params.get("q") or "").strip()
        if q:
            qs = qs.filter(nom__icontains=q)

        # Facettes existantes
        qs = _apply_faceted_filters(qs, self.request.query_params, cat_ids)

        # Tri (avec annotations prix)
        qs = qs.annotate(
            _min_price=Coalesce(Min("variantes__prix_promo"), Min("variantes__prix")),
            _max_price=Coalesce(Max("variantes__prix_promo"), Max("variantes__prix")),
        )

        sort = self.request.query_params.get("sort")
        if sort == "price_asc":
            qs = qs.order_by("_min_price", "id")
        elif sort == "price_desc":
            qs = qs.order_by("-_max_price", "-id")
        elif sort == "new":
            qs = qs.order_by("-cree_le", "-id")
        else:
            qs = qs.order_by("-id")

        return qs
# -----------------------------
# 2) Facettes/filters (query params)
# -----------------------------

class CategoryFilters(APIView):
    """
    GET /api/catalog/filters/?category=tous|<slug_cat>&subcategory=<slug_sub>
    -> renvoie les filtres disponibles (options) selon le périmètre.
    """
    def get(self, request):
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
            # "tous" => périmètre global
            cat = None
            cat_ids = list(Categories.objects.filter(est_actif=True).values_list("id", flat=True))

        base = Produits.objects.filter(est_actif=True, visible=1, categorie_id__in=cat_ids)

        # Marques
        marques = (
            Marques.objects.filter(produits__in=base)
            .distinct()
            .values("nom", "slug", "logo_url")
            .order_by("nom")
        )

        # Couleurs
        couleurs = (
            Couleurs.objects.filter(variantes__produit__in=base)
            .distinct()
            .values("nom", "slug", "code_hex")
            .order_by("nom")
        )

        # Prix min/max
        prix_aggr = VariantesProduits.objects.filter(produit__in=base).aggregate(
            min=Min("prix_promo"), min_fallback=Min("prix"),
            max=Max("prix_promo"), max_fallback=Max("prix"),
        )
        price_min = prix_aggr["min"] or prix_aggr["min_fallback"]
        price_max = prix_aggr["max"] or prix_aggr["max_fallback"]

        # États (neuf/occasion/reconditionné) dans le périmètre
        states_qs = (
            base.exclude(etat__isnull=True)
                .exclude(etat__exact="")
                .values_list("etat", flat=True)
                .distinct()
        )
        states = [{"value": v, "label": dict(Produits.ETATS).get(v, v.title())} for v in states_qs]

        # Fallback Couleurs : si aucune couleur trouvée dans la catégorie courante,
        # on montre les couleurs globales actives (optionnel mais demandé pour toujours afficher le filtre)
        couleurs = list(couleurs)
        if not couleurs:
            couleurs = list(
                Couleurs.objects.filter(est_active=True)
                .values("nom", "slug", "code_hex")
                .order_by("nom")
            )

        # Attributs pour la catégorie (tel que tu le fais déjà)
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
            # options si CHOIX
            if a.type == Attribut.CHOIX:
                qs_vals = ValeurAttribut.objects.filter(attribut=a)\
                        .values("valeur", "slug").order_by("valeur")
                meta["options"] = list(qs_vals)
            attrs_meta.append(meta)

        # Détecte présence côté produit / variante dans le périmètre choisi
        # (base = produits actifs/visibles déjà calculé plus haut)
        prod_attr_codes = set(
            SpecProduit.objects.filter(produit__in=base)
            .values_list("attribut__code", flat=True)
            .distinct()
        )
        var_attr_codes = set(
            SpecVariante.objects.filter(variante__produit__in=base)
            .values_list("attribut__code", flat=True)
            .distinct()
        )

        # Séparation heuristique : couleur toujours côté variante si présente
        def is_variant_attr(code: str) -> bool:
            c = (code or "").lower()
            if c == "couleur":
                return True
            if c in var_attr_codes and c not in prod_attr_codes:
                return True
            return False

        attributes_product = []
        attributes_variant = []
        for meta in attrs_meta:
            (attributes_variant if is_variant_attr(meta["code"]) else attributes_product).append(meta)

        payload = {
            "category": ({"nom": cat.nom, "slug": cat.slug} if cat else None),
            "brands": list(marques),
            "colors": list(couleurs),
            "price": {"min": price_min, "max": price_max},
            "states": states,
            # ⬇️ deux listes distinctes
            "attributes_product": attributes_product,
            "attributes_variant": attributes_variant,
        }
        return Response(payload)
                
class CategoryListView(APIView):
    """
    GET /christland/api/catalog/categories/?level=1
    - level=1 : catégories racines (parent is null)
    - sinon : toutes les catégories actives
    """
    def get(self, request):
        level = (request.query_params.get("level") or "1").strip()
        qs = Categories.objects.filter(est_actif=True)
        if str(level) == "1":
            qs = qs.filter(parent__isnull=True)

        def abs_media(path: str | None) -> str | None:
            if not path:
                return None
            p = str(path).strip()
            if p.lower().startswith(("http://", "https://", "data:")):
                return p
            base = request.build_absolute_uri(settings.MEDIA_URL)
            return f"{base.rstrip('/')}/{p.lstrip('/')}"

        data = [
            {
                "id": c.id,
                "nom": c.nom,
                "slug": c.slug,
                "parent": c.parent_id,
                "image_url": abs_media(getattr(c, "image_url", None)),  # <= URL absolue
                "position": getattr(c, "position", None),
            }
            for c in qs.order_by("nom")
        ]
        return Response(data)
    
    
class ProductMiniView(APIView):
    """
    GET /christland/api/catalog/product/<pk_or_slug>/mini/
    -> { id, slug, nom, ref, image }
    - ref : premier SKU de variante si dispo, sinon slug produit
    - image : image principale (ou première) du produit
    """
    def get(self, request, pk_or_slug: str):
        qs = (Produits.objects
              .filter(est_actif=True, visible=1)
              .select_related("categorie", "marque")
              .prefetch_related("images", "variantes"))

        if pk_or_slug.isdigit():
            prod = get_object_or_404(qs, id=int(pk_or_slug))
        else:
            prod = get_object_or_404(qs, slug=pk_or_slug)

        # image principale si marquée, sinon première par position
        img = prod.images.filter(principale=True).first() or prod.images.order_by("position", "id").first()
        img_url = img.url if img else ""
        if img_url and not img_url.lower().startswith(("http://", "https://", "data:")):
            img_url = request.build_absolute_uri(img_url)

        # ref : SKU d'une variante si présent, sinon slug produit
        sku = (prod.variantes
               .exclude(sku__isnull=True).exclude(sku__exact="")
               .values_list("sku", flat=True)
               .first()) or ""

        payload = {
            "id": prod.id,
            "slug": prod.slug,
            "nom": prod.nom,
            "ref": sku or prod.slug,
            "image": img_url,
        }
        return Response(payload)    
    

# --------- Helpers ----------
def _abs_media(request, path: str | None) -> str | None:
    """
    Ton champ image_couverture est un CharField.
    - S'il contient déjà une URL absolue (http/https/data:), on la renvoie telle quelle.
    - Sinon, on préfixe avec MEDIA_URL pour produire une URL absolue.
    """
    if not path:
        return None
    p = str(path).strip()
    if p.lower().startswith(("http://", "https://", "data:")):
        return p
    base = request.build_absolute_uri(settings.MEDIA_URL)
    return f"{base.rstrip('/')}/{p.lstrip('/')}"

def _serialize_article(a: ArticlesBlog, request):
    return {
        "id": a.id,
        "slug": a.slug or "",
        "title": a.titre or "",
        "excerpt": a.extrait or "",
        "content": a.contenu or "",
        "image": _abs_media(request, getattr(a, "image_couverture", None)),
        # Tu peux exposer autres champs si besoin :
        # "published_at": a.publie_le,
        # "created_at": a.cree_le,
    }

class BlogHeroView(APIView):
    """
    GET /christland/api/blog/hero/
    -> renvoie { title, slug } pour alimenter l’intro de la page
    Règle : on prend le plus ancien (id ASC). Si tu préfères
    "dernier publié", remplace order_by("id") par order_by("-publie_le", "-id")
    """
    def get(self, request):
        qs: QuerySet[ArticlesBlog] = ArticlesBlog.objects.all().order_by("id")
        a = qs.first()
        if not a:
            return Response({"title": "", "slug": ""})
        return Response({"title": a.titre or "", "slug": a.slug or ""})

class BlogPostsView(APIView):
    """
    GET /christland/api/blog/posts/
    -> { "top": [...tous sauf les 2 derniers...], "bottom": [...2 derniers...] }
    L’ordre est chronologique (id ASC) pour que "les 2 derniers" restent en bas.
    """
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
            qs = qs.filter(nom__icontains=q)   # ✅ uniquement le nom
        return qs


class ProduitsDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Produits.objects.all()
    serializer_class = ProduitsSerializer



# --- helpers pour image absolue et specs/prix ---

from typing import Optional

# utils URL
from urllib.parse import urljoin
from django.conf import settings

def _abs_media(request, path: str | None) -> str | None:
    """
    Transforme un chemin du modèle (souvent relatif) en URL absolue.
    - Si déjà absolue (http/https/data:), on renvoie tel quel.
    - Sinon on préfixe avec MEDIA_URL puis on absolutise.
    Exemples:
      path = "uploads/p1.jpg"  -> http://host/media/uploads/p1.jpg
      path = "/media/p1.jpg"   -> http://host/media/p1.jpg
      path = "http://..."      -> (inchangé)
    """
    if not path:
        return None
    p = str(path).strip()
    if p.lower().startswith(("http://", "https://", "data:")):
        return p

    # S’assure qu’on a bien MEDIA_URL devant
    media_base = settings.MEDIA_URL or "/media/"
    # urljoin gère proprement les "/" manquants
    full_media_path = urljoin(media_base if media_base.endswith("/") else media_base + "/", p.lstrip("/"))
    return request.build_absolute_uri(full_media_path)


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
    permission_classes = [AllowAny]

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
    permission_classes = [AllowAny]
    
class DashboardArticleEditView(generics.RetrieveAPIView):
    """
    ✅ GET /christland/api/dashboard/articles/<id>/edit/
    → ne renvoie que: id, titre, slug, extrait, contenu, image, publie_le
    """
    queryset = ArticlesBlog.objects.all()
    serializer_class = ArticleEditSerializer
    permission_classes = [AllowAny]


# views.py
class BlogLatestView(APIView):
    """
    GET /christland/api/blog/latest/?limit=2
    -> [{ id, slug, title, excerpt, image }]
    """
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            limit = int(request.query_params.get("limit") or "2")
        except ValueError:
            limit = 2

        qs = ArticlesBlog.objects.all().order_by("-cree_le", "-id")[: max(1, limit)]
        def _abs_media(path):
            if not path:
                return None
            p = str(path).strip()
            if p.lower().startswith(("http://","https://","data:")):
                return p
            base = request.build_absolute_uri(settings.MEDIA_URL)
            return f"{base.rstrip('/')}/{p.lstrip('/')}"
        data = [{
            "id": a.id,
            "slug": a.slug or "",
            "title": a.titre or "",
            "excerpt": a.extrait or "",
            "image": _abs_media(getattr(a, "image_couverture", None)),
        } for a in qs]
        return Response(data, status=200)


class LatestProductsView(APIView):
    """
    GET /christland/api/catalog/products/latest/
    -> Les 10 derniers produits (cree_le desc), avec: id, slug, nom, marque, image, specs, prix, etat
    """
    def get(self, request):
        qs = (
            Produits.objects
            .filter(est_actif=True, visible=1)
            .select_related("marque", "categorie")
            .prefetch_related("images", "variantes", "specs", "variantes__specs", "specs__attribut", "variantes__specs__attribut")
            .order_by("-cree_le", "-id")[:10]
        )

        data = []
        for p in qs:
            data.append({
                "id": p.id,
                "slug": p.slug,
                "name": p.nom,
                "brand": {"slug": getattr(p.marque, "slug", None), "nom": getattr(p.marque, "nom", None)} if p.marque_id else None,
                "image": _product_main_image_url(request, p),
                "specs": _product_specs_summary(p, max_items=5),
                "price": str(_product_min_price(p)) if _product_min_price(p) is not None else None,
                "state": p.etat or None,
                # optionnels:
                # "created_at": p.cree_le,
                # "category": {"slug": p.categorie.slug, "nom": p.categorie.nom} if p.categorie_id else None,
                "category": {
                "id": p.categorie.id if p.categorie_id else None,
                "slug": p.categorie.slug if p.categorie_id else None,
                "nom": p.categorie.nom if p.categorie_id else None,
            } if p.categorie_id else None,

            })

        return Response(data)


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
                subject=f"[Contact] {sujet}",
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



# --- helper: transforme des Spec* en liste compacte uniquement pour les valeurs REMPLIES
def _specs_to_filled_list(spec_qs):
    """
    spec_qs: QuerySet[SpecProduit|SpecVariante] avec prefetch 'attribut' et 'valeur_choice'
    -> [{"code": "...", "type": "...", "libelle": "...", "unite": "...", "value": "..."}]
    """
    out = []
    for s in (spec_qs or []):
        attr = getattr(s, "attribut", None)
        if not attr or not attr.actif:
            continue

        value = None
        if getattr(s, "valeur_choice", None):
            value = s.valeur_choice.valeur
        elif getattr(s, "valeur_text", None):
            value = s.valeur_text
        elif getattr(s, "valeur_int", None) is not None:
            value = s.valeur_int
        elif getattr(s, "valeur_dec", None) is not None:
            value = s.valeur_dec

        if value in (None, "", []):
            continue

        out.append({
            "code": attr.code,
            "type": attr.type,
            "libelle": getattr(attr, "libelle", attr.code),
            "unite": getattr(attr, "unite", "") or "",
            "value": value,
        })
    return out


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
    
    
    # permission_classes = [IsAuthenticated]

    # ---------- READ (rempli uniquement) ----------
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

        var = prod.variantes.all().order_by("id").first()

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
            "categorie": (
                {"id": prod.categorie.id, "slug": prod.categorie.slug, "nom": prod.categorie.nom}
                if prod.categorie_id else None
            ),
            "images": images,
            "product_attributes": _specs_to_filled_list(prod.specs.all()) if hasattr(prod, "specs") else [],
        }

        if var:
            payload["variant"] = {
                "id": var.id,
                "nom": var.nom or "",
                "sku": var.sku or "",
                "code_barres": var.code_barres or "",
                "prix": var.prix,
                "prix_promo": var.prix_promo,
                "promo_active": bool(var.promo_active),
                "promo_debut": var.promo_debut,
                "promo_fin": var.promo_fin,
                "stock": var.stock,
                "prix_achat": getattr(var, "prix_achat", None),
                "variante_poids_grammes": getattr(var, "poids_grammes", None) or getattr(var, "variante_poids_grammes", None),
                "variante_est_actif": bool(getattr(var, "est_actif", True)),
                "couleur": (
                    {"id": var.couleur.id, "slug": var.couleur.slug, "nom": var.couleur.nom}
                    if var.couleur_id else None
                ),
            }
            payload["variant_attributes"] = _specs_to_filled_list(var.specs.all()) if hasattr(var, "specs") else []
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

        # Catégorie (optionnelle)
        if "categorie" in data and data["categorie"]:
            cat = Categories.objects.filter(id=_as_int(data["categorie"])).first()
            if cat:
                prod.categorie = cat

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
            attr = _get_or_create_attr(code, it.get("type"), it.get("libelle"), it.get("unite"))
            if not attr or not attr.actif:
                continue
            _write_spec_produit(prod, attr, it.get("value"))

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
    """
    def get(self, request):
        q = (request.query_params.get("q") or "").strip()
        active_only = (request.query_params.get("active_only") or "").lower() in ("1","true","yes")

        qs = Marques.objects.all().order_by("nom")
        if active_only:
            qs = qs.filter(Q(est_active=True) | Q(est_active__isnull=True))
        if q:
            qs = qs.filter(Q(nom__icontains=q) | Q(slug__icontains=q))

        data = [
            {"id": m.id, "nom": m.nom, "slug": m.slug, "logo_url": m.logo_url}
            for m in qs
        ]
        return Response(data)


class CouleursListView(APIView):
    """
    GET /christland/api/catalog/couleurs/?q=&active_only=1
    -> [{id, nom, slug, code_hex, est_active}]
    """
    def get(self, request):
        q = (request.query_params.get("q") or "").strip()
        active_only = (request.query_params.get("active_only") or "").lower() in ("1","true","yes")

        qs = Couleurs.objects.all().order_by("nom")
        if active_only:
            qs = qs.filter(est_active=True)
        if q:
            qs = qs.filter(Q(nom__icontains=q) | Q(slug__icontains=q))

        data = [
            {"id": c.id, "nom": c.nom, "slug": c.slug, "code_hex": c.code_hex, "est_active": c.est_active}
            for c in qs
        ]
        return Response(data)



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
    if val in (None, ""):
        return None
    maybe_id = _as_int(val)
    if maybe_id:
        return Couleurs.objects.filter(id=maybe_id).first()
    name = str(val).strip()
    if not name:
        return None
    obj, _ = Couleurs.objects.get_or_create(
        nom=name,
        defaults={"slug": slugify(name)}
    )
    return obj

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
    """Essaie de caster en int puis decimal, sinon None."""
    from decimal import Decimal, InvalidOperation
    if value is None or value == "":
        return None, None
    try:
        iv = int(value)
        return iv, None
    except Exception:
        pass
    try:
        dv = Decimal(str(value))
        return None, dv
    except InvalidOperation:
        return None, None

def _write_spec_produit(produit: Produits, attr: Attribut, raw_value):
    """
    Ecrit/Met à jour SpecProduit selon le type de l'attribut.
    """
    if attr.type == Attribut.CHOIX:
        va = _upsert_valeur_choice(attr, raw_value)
        if not va: 
            return
        SpecProduit.objects.update_or_create(
            produit=produit, attribut=attr,
            defaults={"valeur_choice": va, "valeur_text": None, "valeur_int": None, "valeur_dec": None},
        )
    elif attr.type == Attribut.TEXTE or attr.type == Attribut.BOOLEEN:
        # bool -> "true"/"false" en texte lisible
        txt = str(bool(raw_value)).lower() if attr.type == Attribut.BOOLEEN else (str(raw_value or "").strip() or None)
        SpecProduit.objects.update_or_create(
            produit=produit, attribut=attr,
            defaults={"valeur_text": txt, "valeur_choice": None, "valeur_int": None, "valeur_dec": None},
        )
    else:
        iv, dv = _coerce_numeric(raw_value)
        SpecProduit.objects.update_or_create(
            produit=produit, attribut=attr,
            defaults={
                "valeur_int": iv if attr.type == Attribut.ENTIER else None,
                "valeur_dec": dv if attr.type == Attribut.DECIMAL else None,
                "valeur_text": None, "valeur_choice": None,
            },
        )

def _write_spec_variante(variante: VariantesProduits, attr: Attribut, raw_value):
    """Idem pour SpecVariante."""
    if attr.type == Attribut.CHOIX:
        va = _upsert_valeur_choice(attr, raw_value)
        if not va: 
            return
        SpecVariante.objects.update_or_create(
            variante=variante, attribut=attr,
            defaults={"valeur_choice": va, "valeur_text": None, "valeur_int": None, "valeur_dec": None},
        )
    elif attr.type == Attribut.TEXTE or attr.type == Attribut.BOOLEEN:
        txt = str(bool(raw_value)).lower() if attr.type == Attribut.BOOLEEN else (str(raw_value or "").strip() or None)
        SpecVariante.objects.update_or_create(
            variante=variante, attribut=attr,
            defaults={"valeur_text": txt, "valeur_choice": None, "valeur_int": None, "valeur_dec": None},
        )
    else:
        iv, dv = _coerce_numeric(raw_value)
        SpecVariante.objects.update_or_create(
            variante=variante, attribut=attr,
            defaults={
                "valeur_int": iv if attr.type == Attribut.ENTIER else None,
                "valeur_dec": dv if attr.type == Attribut.DECIMAL else None,
                "valeur_text": None, "valeur_choice": None,
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
# ---------- Création produit + variante + images ----------
@method_decorator(csrf_exempt, name="dispatch")
class AddProductWithVariantView(View):
    def post(self, request, *args, **kwargs):
        try:
            payload = json.loads(request.body.decode("utf-8"))
        except json.JSONDecodeError:
            return JsonResponse({"error": "JSON invalide"}, status=400)

        # validations lisibles
        nom = (payload.get("nom") or "").strip()
        if not nom:
            return JsonResponse({"field": "nom", "error": "Le nom du produit est requis."}, status=400)

        # etat (neuf | reconditionné | occasion)
        etat_raw = (payload.get("etat") or "").strip().lower()
        # tolère sans accent ni majuscules
        if etat_raw in ("reconditionne", "reconditionné", "reconditionne'", "reconditionnee"):
            etat_value = "reconditionné"
        elif etat_raw in ("neuf",):
            etat_value = "neuf"
        elif etat_raw in ("occasion",):
            etat_value = "occasion"
        else:
            # par défaut "neuf" si non fourni; sinon renvoie 400 si tu préfères
            etat_value = "neuf"
            # return JsonResponse({"field": "etat", "error": "Valeur invalide (neuf, reconditionné, occasion)."}, status=400)

        visible = payload.get("visible", 1)
        if visible not in (0, 1, None):
            return JsonResponse({"field": "visible", "error": "Visible doit être 1 (oui) ou 0 (non)."}, status=400)

        prix = payload.get("prix", None)
        if prix in (None, ""):
            return JsonResponse({"field": "prix", "error": "Le prix de la variante est requis."}, status=400)

        marque_raw = payload.get("marque", None)
        if not marque_raw:
            return JsonResponse({"field": "marque", "error": "La marque est requise."}, status=400)

        # catégorie (facultatif)
        categorie = None
        if payload.get("categorie"):
            categorie = Categories.objects.filter(id=_as_int(payload["categorie"])).first()

        # couleur (facultatif)
        couleur = _resolve_couleur(payload.get("couleur"))
        # -- miroir attribut "couleur" pour le moteur d'attributs --
        if couleur:
            # 1) s'assurer que l'attribut "couleur" existe en CHOIX
            attr_couleur, _ = Attribut.objects.get_or_create(
                code="couleur",
                defaults={
                    "libelle": "Couleur",
                    "type": Attribut.CHOIX,  # "choice"
                    "ordre": 0,
                    "actif": True,
                },
            )
            # 2) créer/associer une valeur d'attribut qui mappe la Couleurs choisie
            va_couleur, _ = ValeurAttribut.objects.get_or_create(
                attribut=attr_couleur,
                slug=(couleur.slug or slugify(couleur.nom or ""))[:140],
                defaults={"valeur": couleur.nom or ""},
            )

          
        # images (obligatoire ≥ 1)
        images_clean = _clean_images_payload(payload.get("images"))
        if not images_clean:
            return JsonResponse({"field": "images", "error": "Au moins une image est requise."}, status=400)

        # marque
        marque, marque_note = _resolve_marque_verbose(marque_raw)
        if not marque:
            return JsonResponse({"field": "marque", "error": "Marque introuvable/invalid."}, status=400)

        # slug
        slug = (payload.get("slug") or "").strip() or slugify(nom)

        # champs variante supplémentaires
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
                    description_courte=payload.get("description_courte", "") or "",
                    description_long=payload.get("description_long", "") or "",
                    garantie_mois=payload.get("garantie_mois") or None,
                    poids_grammes=payload.get("poids_grammes") or None,
                    dimensions=payload.get("dimensions", "") or "",
                    categorie=categorie,
                    marque=marque,
                    est_actif=bool(payload.get("est_actif", False)),
                    visible=(visible if visible in (0, 1) else 1),
                    etat=etat_value,
                )

                # ---------- VARIANTE ----------
                variante = VariantesProduits.objects.create(
                    produit=produit,
                    nom=payload.get("variante_nom") or nom,
                    sku=payload.get("sku") or "",
                    code_barres=payload.get("code_barres") or "",
                    prix=payload.get("prix"),
                    prix_promo=payload.get("prix_promo") or None,
                    promo_active=bool(payload.get("promo_active", False)),
                    promo_debut=promo_debut,
                    promo_fin=promo_fin,
                    stock=payload.get("stock") or 0,
                    couleur=couleur,
                    poids_grammes=var_poids,
                    prix_achat=prix_achat,
                    est_actif=var_actif,
                )

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
                variant_attrs = payload.get("variant_attributes") or []
                miss_msg = _validate_required_attributes(categorie, product_attrs, variant_attrs)
                if miss_msg:
                    raise IntegrityError(miss_msg)

                # ---------- ATTRIBUTS PRODUIT ----------
                for item in product_attrs:
                    code = (item.get("code") or "").strip().lower()
                    if not code: 
                        continue
                    type_hint = item.get("type")  # "text/int/dec/bool/choice"
                    libelle = item.get("libelle")
                    unite   = item.get("unite")
                    value   = item.get("value")

                    attr = _get_or_create_attr(code, type_hint, libelle, unite)
                    if not attr or not attr.actif:
                        continue
                    _write_spec_produit(produit, attr, value)

                # ---------- ATTRIBUTS VARIANTE ----------
                for item in variant_attrs:
                    code = (item.get("code") or "").strip().lower()
                    if not code:
                        continue
                    # on évite de recréer "couleur" si on l’a déjà mappée via FK (voir miroir ci-dessous)
                    if code == "couleur" and variante.couleur_id:
                        continue

                    type_hint = item.get("type")
                    libelle = item.get("libelle")
                    unite   = item.get("unite")
                    value   = item.get("value")

                    attr = _get_or_create_attr(code, type_hint, libelle, unite)
                    if not attr or not attr.actif:
                        continue
                    _write_spec_variante(variante, attr, value)

                # ---------- MIROIR ATTRIBUT "couleur" (si FK couleur) ----------
                if variante.couleur_id:
                    attr_couleur = _get_or_create_attr("couleur", Attribut.CHOIX, "Couleur")
                    va_couleur = _upsert_valeur_choice(attr_couleur, variante.couleur.nom)
                    SpecVariante.objects.update_or_create(
                        variante=variante, attribut=attr_couleur,
                        defaults={"valeur_choice": va_couleur, "valeur_text": None, "valeur_int": None, "valeur_dec": None},
                    )
            # ... juste après toutes les créations (produit, variante, images, specs, miroir couleur)
            return JsonResponse(
                {
                    "ok": True,
                    "message": "Votre produit a bien été enregistré.",
                    "produit_id": produit.id,
                    "variante_id": variante.id,
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
            payload = {"error": "Intégrité BD", "detail": str(ie)}
            if field:
                payload["field"] = field
                payload["field_errors"] = {field: human}
            return JsonResponse(payload, status=400)
        


class ProductClickView(APIView):
    """
    POST /christland/api/catalog/products/<pk>/click/
    -> { ok: True, count: <nouvelle valeur> }
    Incrémente le compteur quand un utilisateur clique sur "Commander".
    """
    permission_classes = [AllowAny]

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
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            limit = int(request.query_params.get("limit") or "2")
        except ValueError:
            limit = 2

        qs = (
            Produits.objects
            .filter(est_actif=True, visible=1)
            .select_related("marque", "categorie")
            .prefetch_related("images", "variantes")
            .order_by("-commande_count", "-id")[: max(1, limit)]
        )

        data = []
        for p in qs:
            data.append({
                "id": p.id,
                "slug": p.slug,
                "nom": p.nom,
                "image": _product_main_image_url(request, p),  # peut être None
                "price": str(_product_min_price(p)) if _product_min_price(p) is not None else None,
                "count": p.commande_count,
            })
        return Response(data, status=200)        
    


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
    - Articles: filtre SUR 'extrait' OU 'contenu' uniquement
    - Les autres champs sont juste renvoyés (affichage)
    """
    permission_classes = [AllowAny]

    def get(self, request):
        q = (request.query_params.get("q") or "").strip()
        if not q:
            return Response({"count": 0, "next": None, "previous": None, "results": []})

        # pagination safe
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
                # champs d'affichage supplémentaires si tu veux
                "brand": getattr(p.marque, "nom", None),
                "category": getattr(p.categorie, "nom", None),
            })

        # -------- Articles: filtre UNIQUEMENT sur extrait OU contenu --------
        axs = (
            ArticlesBlog.objects
            .filter(Q(extrait__icontains=q) | Q(contenu__icontains=q))   # 👈 pas de filtre sur titre
            .order_by("-modifie_le", "-cree_le", "-id")
        )

        article_items = []
        for a in axs[:200]:
            article_items.append({
                "type": "article",
                "id": a.id,
                "title": a.titre or "",                        # affichage seulement
                "excerpt": (a.extrait or "")[:220],
                "image": _abs_media(request, getattr(a, "image_couverture", None)),
                "url": f"/Dashboard/Articles/{a.id}/edit",
                "created_at": getattr(a, "cree_le", None),
                "updated_at": getattr(a, "modifie_le", None),
            })

        # fusion + tri (updated, sinon created)
        items = prod_items + article_items

        def _key(x):
            ts = x.get("updated_at") or x.get("created_at") or timezone.datetime.min.replace(tzinfo=timezone.utc)
            return (ts, x["id"])

        items.sort(key=_key, reverse=True)

        # pagination
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
    permission_classes = [AllowAny]   # ajuste si besoin (IsAuthenticated, etc.)

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