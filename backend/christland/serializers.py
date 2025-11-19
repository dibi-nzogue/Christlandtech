from django.utils.text import slugify
from rest_framework import serializers
from django.conf import settings
from .models import (
    Categories, Marques, Couleurs,
    Produits, VariantesProduits, ImagesProduits,ArticlesBlog,
    Attribut, ValeurAttribut, SpecProduit, SpecVariante
)
from django.utils import timezone

from .serializers_i18n import I18nTranslateMixin


# helpers i18n simples pour les champs "choices" comme etat

def get_request_lang(request) -> str:
    """
    Récupère la langue à partir de ?lang= ou des headers.
    Retourne 'fr', 'en', etc.
    """
    if not request:
        return "fr"
    lang = (
        request.query_params.get("lang")
        or request.headers.get("X-Lang")
        or request.headers.get("Accept-Language", "fr")
    )
    return (lang or "fr").split(",")[0].split("-")[0].lower()


def _etat_label(etat_code: str | None, request=None, lang: str | None = None) -> str | None:
    """
    Traduit le code d'état ('neuf', 'occasion', 'reconditionne') 
    en label selon la langue (fr/en).
    """
    if not etat_code:
        return None

    if lang is None:
        lang = get_request_lang(request)

    mappings = {
        "fr": {
            "neuf": "Neuf",
            "occasion": "Occasion",
            "reconditionne": "Reconditionné",
        },
        "en": {
            "neuf": "New",
            "occasion": "Used",
            "reconditionne": "Refurbished",
        },
    }

    labels = mappings.get(lang, mappings["fr"])
    return labels.get(etat_code, etat_code.capitalize())


def _product_min_price(obj):
    """Retourne le prix actuel le plus bas parmi toutes les variantes"""
    prices = []
    for v in obj.variantes.all():
        prix = v.prix_actuel()
        if prix is not None:
            prices.append(prix)
    return min(prices) if prices else None


class CouleurMiniSerializer(I18nTranslateMixin, serializers.ModelSerializer):
    i18n_fields = ["nom"]
    class Meta:
        model = Couleurs
        fields = ("nom", "slug", "code_hex")
        


class ImageProduitSerializer(I18nTranslateMixin, serializers.ModelSerializer):
    # + traduire l'alt_text (s’il existe)
    i18n_fields = ["alt_text"]
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



class VarianteSerializer(I18nTranslateMixin, serializers.ModelSerializer):
    # + traduire le nom de la variante et la couleur imbriquée
    i18n_fields = ["nom"]
    i18n_nested = { "couleur": ["nom"] }
    
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


class MarqueMiniSerializer(I18nTranslateMixin, serializers.ModelSerializer):
    # + traduire le nom de la marque
    i18n_fields = ["nom"]
    class Meta:
        model = Marques
        fields = ("nom", "slug", "logo_url")


class CategorieMiniSerializer(I18nTranslateMixin, serializers.ModelSerializer):
    # + traduire le nom de catégorie
    i18n_fields = ["nom"]
    parent_slug = serializers.CharField(source="parent.slug", read_only=True)

    class Meta:
        model = Categories
        fields = ("nom", "slug", "parent_slug")




class ProduitCardSerializer(I18nTranslateMixin, serializers.ModelSerializer):
    i18n_fields = ["nom", "description_courte"]
  
    # Champs imbriqués
    images = ImageProduitSerializer(many=True, read_only=True)
    variantes = VarianteSerializer(many=True, read_only=True)
    marque = MarqueMiniSerializer(read_only=True)
    categorie = CategorieMiniSerializer(read_only=True)

    # Champs calculés
    price = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    specs = serializers.SerializerMethodField()
    state = serializers.SerializerMethodField()

    class Meta:
        model = Produits
        fields = (
            "id", "nom", "slug", "description_courte",
            "marque", "categorie", "images", "variantes",
            "price", "image", "specs", "state",
        )

    def get_price(self, obj):
        prix = _product_min_price(obj)
        return str(prix) if prix is not None else None

    def get_image(self, obj):
        img = obj.images.filter(principale=True).first() or obj.images.order_by("position", "id").first()
        request = self.context.get("request")
        if img and img.url:
            url = str(img.url).strip()
            if not url.lower().startswith(("http://", "https://", "data:")):
                url = request.build_absolute_uri(url) if request else url
            return url
        return None

    def get_specs(self, obj):
        def extract(sp):
            if sp.valeur_choice:
                return sp.valeur_choice.valeur
            if sp.valeur_text:
                return sp.valeur_text
            if sp.valeur_int is not None:
                return str(sp.valeur_int)
            if sp.valeur_dec is not None:
                return str(sp.valeur_dec)
            return ""

        # Specs produit
        if obj.specs.exists():
            values = [extract(sp) for sp in obj.specs.all()[:5] if extract(sp)]
            if values:
                return " | ".join(values)

        # Specs première variante
        var = obj.variantes.first()
        if var and var.specs.exists():
            values = [extract(sp) for sp in var.specs.all()[:5] if extract(sp)]
            if values:
                return " | ".join(values)

        return ""

    def get_state(self, obj):
        request = self.context.get("request")
        return _etat_label(obj.etat, request=request)


class ProduitsSerializer(I18nTranslateMixin, serializers.ModelSerializer):
    # + traduire les champs textuels principaux
    i18n_fields = ["nom", "description_courte"]
    # + traductions imbriquées
    i18n_nested = {
        "categorie": ["nom"],
        "marque": ["nom"],
        "images": ["alt_text"],
    }
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

class ArticleDashboardSerializer(I18nTranslateMixin, serializers.ModelSerializer):
    # + traduire les champs de texte du blog
    i18n_fields = ["titre", "slug", "extrait", "contenu"]
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

class ArticleEditSerializer(I18nTranslateMixin, serializers.ModelSerializer):
    # + traduire aussi en mode “edit” (lecture)
    i18n_fields = ["titre","slug", "extrait", "contenu"]
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
    
class ArticleCreateSerializer(I18nTranslateMixin, serializers.ModelSerializer):
    # + pour la réponse (to_representation) après création
    i18n_fields = ["titre", "slug", "extrait", "contenu"]
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
