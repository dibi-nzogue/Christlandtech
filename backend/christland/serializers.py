from django.utils.text import slugify
from rest_framework import serializers
from django.conf import settings
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

    class Meta:
        model = ImagesProduits
        fields = ("url", "alt_text", "position", "principale")  # slug inutile ici

    def get_url(self, obj):
        request = self.context.get("request")

        # 1) Si tu as un vrai FileField (image/fichier/photo/...) on l'utilise
        for field in ("fichier", "image", "photo", "fichier_image"):
            f = getattr(obj, field, None)
            if f and hasattr(f, "url"):
                return request.build_absolute_uri(f.url) if request else f.url

        # 2) Sinon on utilise le texte 'url' venant de la BD (chemin relatif)
        val = getattr(obj, "url", None)
        if not val:
            return None

        val = str(val).strip()
        # déjà absolu ?
        if val.startswith("http://") or val.startswith("https://"):
            return val

        # déjà sous /media/ ?
        if val.startswith("/media/"):
            return request.build_absolute_uri(val) if request else val

        # chemin relatif -> prefixe MEDIA_URL
        path = f"{settings.MEDIA_URL.rstrip('/')}/{val.lstrip('/')}"
        return request.build_absolute_uri(path) if request else path



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
