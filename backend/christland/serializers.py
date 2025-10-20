from django.utils.text import slugify
from rest_framework import serializers

from .models import (
    Categories, Marques, Couleurs,
    Produits, VariantesProduits, ImagesProduits,
    Attribut, ValeurAttribut, SpecProduit, SpecVariante
)


class CouleurMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Couleurs
        fields = ("nom", "slug", "code_hex")


class ImageProduitSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()
    slug = serializers.SerializerMethodField()   # <-- calculé (au lieu d'un champ modèle)

    class Meta:
        model = ImagesProduits
        fields = ("url", "alt_text", "position", "principale", "slug")

    def get_url(self, obj):
        request = self.context.get("request")
        path = None
        for field in ("fichier", "image", "photo", "fichier_image"):
            f = getattr(obj, field, None)
            if f and hasattr(f, "url"):
                path = f.url
                break
        if not path:
            return None
        return request.build_absolute_uri(path) if request else path

    def get_slug(self, obj):
        # si tu ne veux PAS de slug, supprime complètement ce SerializerMethodField et le champ des fields
        base = (getattr(obj, "alt_text", None) or "").strip()
        if not base:
            # tente de dériver du nom du fichier si dispo
            for field in ("fichier", "image", "photo", "fichier_image"):
                f = getattr(obj, field, None)
                if f and getattr(f, "name", None):
                    base = f.name.rsplit("/", 1)[-1]
                    break
        return slugify(base) if base else None


class VarianteSerializer(serializers.ModelSerializer):
    couleur = CouleurMiniSerializer()
    prix_affiche = serializers.SerializerMethodField()

    class Meta:
        model = VariantesProduits
        fields = (
            "id", "sku", "nom", "prix", "prix_promo", "prix_affiche",
            "stock", "poids_grammes", "couleur"
        )

    def get_prix_affiche(self, obj):
        return obj.prix_promo or obj.prix


class MarqueMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Marques
        fields = ("nom", "slug", "logo_url")


class CategorieMiniSerializer(serializers.ModelSerializer):
    parent_slug = serializers.CharField(source="parent.slug", read_only=True)

    class Meta:
        model = Categories
        fields = ("nom", "slug", "parent_slug")


class ProduitCardSerializer(serializers.ModelSerializer):
    images = ImageProduitSerializer(many=True, read_only=True)
    variantes = VarianteSerializer(many=True, read_only=True)
    marque = MarqueMiniSerializer(read_only=True)
    categorie = CategorieMiniSerializer(read_only=True)
    # prix_from = min(prix_affiche) des variantes
    prix_from = serializers.SerializerMethodField()

    class Meta:
        model = Produits
        fields = (
            "id", "nom", "slug",
            "description_courte", "prix_reference_avant",
            "categorie", "marque",
            "images", "variantes", "prix_from",
        )

    def get_prix_from(self, obj):
        prices = []
        for v in obj.variantes.all():
            prices.append(v.prix_promo or v.prix)
        return min(prices) if prices else None
