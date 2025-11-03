from django.utils.text import slugify
from rest_framework import serializers
from django.conf import settings
from .models import (
    Categories, Marques, Couleurs,
    Produits, VariantesProduits, ImagesProduits,ArticlesBlog,
    Attribut, ValeurAttribut, SpecProduit, SpecVariante
)
from django.utils import timezone

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
    promo_now = serializers.SerializerMethodField()

    class Meta:
        model = VariantesProduits
        fields = (
            "id", "sku", "nom", "prix", "prix_promo", "prix_affiche",
            "promo_now",  # <-- ajouté
            "stock", "poids_grammes", "couleur"
        )

    def get_prix_affiche(self, obj):
        # ✅ respecte promo_active + fenêtre de dates, déjà géré par ton modèle
        return obj.prix_actuel()

    def get_promo_now(self, obj):
        from django.utils import timezone
        now = timezone.now()
        if not obj.promo_active or obj.prix_promo is None:
            return False
        if obj.promo_debut and obj.promo_debut > now:
            return False
        if obj.promo_fin and now > obj.promo_fin:
            return False
        return True


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

    prix_from = serializers.SerializerMethodField()
    old_price_from = serializers.SerializerMethodField()
    promo_now = serializers.SerializerMethodField()
    promo_fin = serializers.SerializerMethodField()

    # 👇 ajout des quantités
    quantite = serializers.IntegerField(read_only=True)  # champ du modèle Produits
    stock_total = serializers.SerializerMethodField()    # somme des stocks des variantes

    class Meta:
        model = Produits
        fields = (
            "id", "nom", "slug",
            "description_courte",
            "categorie", "marque",
            "images", "variantes",
            "prix_from", "old_price_from", "promo_now", "promo_fin",
            # 👇 nouveaux champs exposés
            "quantite", "stock_total",
        )

    def get_stock_total(self, obj):
        # somme des stocks de toutes les variantes (None traité comme 0)
        return sum((v.stock or 0) for v in obj.variantes.all())

    def get_prix_from(self, obj):
        prices = []
        for v in obj.variantes.all():
            pa = v.prix_actuel()
            if pa is not None:
                prices.append(pa)
        return min(prices) if prices else None

    def get_old_price_from(self, obj):
        from django.utils import timezone
        now = timezone.now()
        normals = []
        for v in obj.variantes.all():
            if not v.promo_active or v.prix_promo is None:
                continue
            if v.promo_debut and v.promo_debut > now:
                continue
            if v.promo_fin and now > v.promo_fin:
                continue
            if v.prix is not None:
                normals.append(v.prix)
        return min(normals) if normals else None

    def get_promo_now(self, obj):
        from django.utils import timezone
        now = timezone.now()
        for v in obj.variantes.all():
            if v.promo_active and v.prix_promo is not None:
                if (not v.promo_debut or v.promo_debut <= now) and (not v.promo_fin or now <= v.promo_fin):
                    return True
        return False

    def get_promo_fin(self, obj):
        from django.utils import timezone
        now = timezone.now()
        fins = []
        for v in obj.variantes.all():
            if v.promo_active and v.prix_promo is not None:
                if (not v.promo_debut or v.promo_debut <= now) and (not v.promo_fin or now <= v.promo_fin):
                    if v.promo_fin:
                        fins.append(v.promo_fin)
        return min(fins).isoformat() if fins else None


# serializers.py
from rest_framework import serializers

class ProduitsSerializer(serializers.ModelSerializer):
    variants_stock = serializers.SerializerMethodField() 
    images = ImageProduitSerializer(many=True, read_only=True)
    class Meta:
        model = Produits
        fields = '__all__'  # on garde tout
        # Si tu préfères être explicite:
        # fields = [..., 'variants_stock']

    def get_variants_stock(self, instance):
        # renvoie [12, 5, 0, ...] (None conservé si tu veux)
        return list(
            instance.variantes.order_by("id").values_list("stock", flat=True)
        )

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # (ton code existant)
        vset = getattr(instance, "variantes", None)
        first_var = vset.order_by("id").first() if vset is not None else None
        data["prix_from"] = (
            str(first_var.prix) if (first_var and first_var.prix is not None) else None
        )
        return data
    
def _abs_media(request, path: str | None) -> str | None:
    if not path:
        return None
    p = str(path).strip()
    if p.lower().startswith(("http://", "https://", "data:")):
        return p
    base = request.build_absolute_uri(settings.MEDIA_URL)
    return f"{base.rstrip('/')}/{p.lstrip('/')}"

class ArticleDashboardSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ArticlesBlog
        fields = (
            "id", "titre", "slug", "extrait", "contenu",
            "image", "publie_le", "cree_le", "modifie_le",
        )

    def get_image(self, obj):
        """
        image_couverture est un CharField → on renvoie une URL absolue.
        """
        val = (obj.image_couverture or "").strip() if obj.image_couverture else ""
        if not val:
            return None
        if val.lower().startswith(("http://", "https://", "data:")):
            return val
        request = self.context.get("request")
        base = settings.MEDIA_URL.rstrip("/")
        url = f"{base}/{val.lstrip('/')}"
        return request.build_absolute_uri(url) if request else url
    
def _abs_media(request, path: str | None) -> str | None:
    if not path:
        return None
    p = str(path).strip()
    if p.lower().startswith(("http://", "https://", "data:")):
        return p
    base = request.build_absolute_uri(settings.MEDIA_URL)
    return f"{base.rstrip('/')}/{p.lstrip('/')}"

class ArticleEditSerializer(serializers.ModelSerializer):
    # on expose "image" en lisant image_couverture
    image = serializers.SerializerMethodField()

    class Meta:
        model = ArticlesBlog
        # ❌ pas de publie_le ici
        fields = ("id", "titre", "slug", "extrait", "contenu", "image")

    def get_image(self, obj):
        request = self.context.get("request")
        return _abs_media(request, getattr(obj, "image_couverture", None))

    def to_representation(self, obj):
        """
        Ne renvoie QUE les champs qui ont une valeur (garde toujours 'id').
        """
        data = super().to_representation(obj)
        clean = {"id": data.get("id")}
        for k in ("titre", "slug", "extrait", "contenu", "image"):
            v = data.get(k)
            if v not in (None, "", []):
                clean[k] = v
        return clean
    
class ArticleCreateSerializer(serializers.ModelSerializer):
    image = serializers.CharField(allow_blank=True, allow_null=True, required=False)

    class Meta:
        model = ArticlesBlog
        fields = ["id", "titre", "slug", "extrait", "contenu", "image"]
        read_only_fields = ["id"]  # ⬅️ important : on n’accepte jamais un id en entrée

    def create(self, validated_data):
        # ne jamais laisser un id passer
        validated_data.pop("id", None)

        img = validated_data.pop("image", None)
        titre = (validated_data.get("titre") or "").strip()

        if not validated_data.get("slug"):
            # si pas de titre -> slug "article"
            validated_data["slug"] = slugify(titre)[:140] or slugify("article")

        # Si ton modèle a auto_now_add=True, enlève publie_le=...
        obj = ArticlesBlog.objects.create(publie_le=timezone.now(), **validated_data)

        if img:
            obj.image_couverture = img
            obj.save(update_fields=["image_couverture"])
        return obj

    def to_representation(self, instance):
        request = self.context.get("request")
        data = super().to_representation(instance)

        def _abs_media(path):
            if not path:
                return None
            p = str(path).strip()
            if p.lower().startswith(("http://", "https://", "data:")):
                return p
            base = request.build_absolute_uri(settings.MEDIA_URL) if request else settings.MEDIA_URL
            return f"{base.rstrip('/')}/{p.lstrip('/')}"

        data["image"] = _abs_media(getattr(instance, "image_couverture", None))
        return data
