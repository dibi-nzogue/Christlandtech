from collections import defaultdict
from decimal import Decimal
from typing import Iterable
from django.db.models import Count
from rest_framework import status
from django.db.models import Q, Min, Max
from django.db.models.functions import Coalesce  # ✅ pour annoter min/max prix
from django.shortcuts import get_object_or_404
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination

from .models import (
    Categories, Produits, VariantesProduits, ImagesProduits,
    Marques, Couleurs,
    Attribut, ValeurAttribut, SpecProduit, SpecVariante
)
from .serializers import ProduitCardSerializer


# -----------------------------
# Helpers
# -----------------------------

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

        # NOTE : on suppose que Produits a des reverse relations 'specs' et Variantes 'specs'.
        # Si vos related_names sont différents, adaptez ici. Le bug signalé venait de ValeurAttribut (corrigé plus bas).
        q_attr = Q(specs__attribut=attr) | Q(variantes__specs__attribut=attr)

        if attr.type == Attribut.CHOIX:
            qs = qs.filter(
                q_attr &
                (Q(specs__valeur_choice__slug__in=values) | Q(variantes__specs__valeur_choice__slug__in=values))
            )
        elif attr.type == Attribut.TEXTE:
            qs = qs.filter(
                q_attr &
                (Q(specs__valeur_text__iregex="|".join(values)) | Q(variantes__specs__valeur_text__iregex="|".join(values)))
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
    GET /api/catalog/products/?category=tous|<slug_cat>&subcategory=<slug_sub>&page=&page_size=&sort=
    Facettes en query:
      brand=canon,nikon
      color=black,white
      price_min=10000&price_max=300000
      attr_taille_ecran=6.1,6.4
      attr_processeur=Snapdragon
      attr_memoire_vive=16
      attr_capacite_ssd=512
      sort=price_asc|price_desc|new
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
            # "tous" => pas de restriction catégorie
            cat_ids = list(Categories.objects.filter(est_actif=True).values_list("id", flat=True))

        img_accessor = _image_accessor_name()
        qs = (
            Produits.objects.filter(est_actif=True, visible=1, categorie_id__in=cat_ids)
            .select_related("categorie", "marque")
            .prefetch_related(img_accessor, "variantes", "variantes__couleur")  # <-- ajoute "variantes"
            .distinct()
        )

        # Facettes
        qs = _apply_faceted_filters(qs, self.request.query_params, cat_ids)

        # Tri
        sort = self.request.query_params.get("sort")
        # Annoter un prix min/max calculé proprement
        qs = qs.annotate(
            _min_price=Coalesce(Min("variantes__prix_promo"), Min("variantes__prix")),
            _max_price=Coalesce(Max("variantes__prix_promo"), Max("variantes__prix")),
        )

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

        # Attributs
        attrs_list = []
        # CategorieAttribut peut ne pas exister dans certains schémas,
        # on sécurise l'import.
        try:
            from .models import CategorieAttribut
            ca_qs = CategorieAttribut.objects.filter(categorie_id__in=cat_ids).select_related("attribut").order_by("ordre")
        except Exception:
            ca_qs = []

        seen_attr_ids = set()  # éviter doublons si plusieurs catégories
        for ca in ca_qs:
            attr = ca.attribut
            if attr.id in seen_attr_ids:
                continue
            seen_attr_ids.add(attr.id)

            if attr.type == Attribut.CHOIX:
                # ✅ CORRECTION: utiliser les bons related names 'specproduit' et 'specvariante'
                qs_vals = (
                    ValeurAttribut.objects.filter(
                        Q(specproduit__produit__in=base, specproduit__attribut=attr) |
                        Q(specvariante__variante__produit__in=base, specvariante__attribut=attr)
                    )
                    .distinct()
                    .values("valeur", "slug")
                    .order_by("valeur")
                )
                vals = list(qs_vals)
            else:
                sp_qs = SpecProduit.objects.filter(produit__in=base, attribut=attr)
                sv_qs = SpecVariante.objects.filter(variante__produit__in=base, attribut=attr)
                if attr.type in (Attribut.ENTIER, Attribut.DECIMAL):
                    nums = list(
                        sp_qs.exclude(valeur_int=None).values_list("valeur_int", flat=True).distinct()
                    ) + list(
                        sp_qs.exclude(valeur_dec=None).values_list("valeur_dec", flat=True).distinct()
                    ) + list(
                        sv_qs.exclude(valeur_int=None).values_list("valeur_int", flat=True).distinct()
                    ) + list(
                        sv_qs.exclude(valeur_dec=None).values_list("valeur_dec", flat=True).distinct()
                    )
                    vals = sorted({str(n) for n in nums if n is not None}, key=lambda x: Decimal(x))
                else:
                    texts = list(sp_qs.exclude(valeur_text="").values_list("valeur_text", flat=True).distinct()) + \
                            list(sv_qs.exclude(valeur_text="").values_list("valeur_text", flat=True).distinct())
                    vals = sorted(set(texts))

            attrs_list.append({
                "code": attr.code,
                "libelle": attr.libelle,
                "type": attr.type,
                "options": vals,  # CHOIX => [{"valeur","slug"}], sinon liste de strings/nums
            })

        payload = {
            "category": ({"nom": cat.nom, "slug": cat.slug} if cat else None),
            "brands": list(marques),
            "colors": list(couleurs),
            "price": {"min": price_min, "max": price_max},
            "attributes": attrs_list,
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

        data = [
            {
                "id": c.id,
                "nom": c.nom,
                "slug": c.slug,
                "parent": c.parent_id,
                "image_url": getattr(c, "image_url", None),
                "position": getattr(c, "position", None),
            }
            for c in qs.order_by("nom")
        ]
        return Response(data)