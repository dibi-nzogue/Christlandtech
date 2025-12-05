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
    variante_poids_grammes = serializers.SerializerMethodField()
    variante_est_actif = serializers.SerializerMethodField()

    
    class Meta:
        model = VariantesProduits
        fields = (
            "id",
            "sku",
            "code_barres",           # <- utilisé dans ProductEditForm
            "nom",
            "prix",
            "prix_promo",
            "prix_affiche",
            "promo_active",          # <- utilisé dans ProductEditForm
            "promo_debut",           # <- idem
            "promo_fin",             # <- idem
            "promo_now",
            "stock",
            "prix_achat",            # <- utilisé dans ProductEditForm
            "poids_grammes",
            "variante_poids_grammes",# alias pour le front
            "est_actif",
            "variante_est_actif",    # alias pour le front
            "couleur",
        )


    def get_variante_poids_grammes(self, obj):
            return obj.poids_grammes

    def get_variante_est_actif(self, obj):
        return obj.est_actif

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
    image_url = serializers.SerializerMethodField()  # 👈 nouveau

    class Meta:
        model = Categories
        fields = ("id", "nom", "slug", "parent_slug", "image_url")

    def get_image_url(self, obj):
        request = self.context.get("request")
        # obj.image_url contient "images/achat/..." ou "media/..."
        return _abs_media(request, getattr(obj, "image_url", None))


class CategoryDashboardSerializer(serializers.ModelSerializer):
    # on veut traduire nom + description
    # i18n_fields = ["nom", "description"]

    # 👇 on ajoute ces 2 champs calculés
    parent_id = serializers.IntegerField(source="parent.id", read_only=True)
    parent_nom = serializers.CharField(source="parent.nom", read_only=True)
    children = serializers.SerializerMethodField()  # 
    class Meta:
        model = Categories
        fields = (
            "id",
            "nom",
            "slug",
            "description",
            "est_actif",
            "image_url",
            "position",
            "parent",      # FK brute
            "parent_id",   # id du parent (pour le front)
            "parent_nom",  # nom du parent (optionnel mais pratique)
             "children",
        )
    def get_children(self, obj):
            return [
                {"id": child.id, "nom": child.nom, "slug": child.slug}
                for child in obj.children.all()
            ]


class CatalogCategorySerializer(I18nTranslateMixin, serializers.ModelSerializer):
    """
    Serializer utilisé par /api/catalog/categories/ (useCategories côté front).
    On expose bien parent_id pour que React puisse retrouver les sous-catégories.
    """
    i18n_fields = ["nom", "description"]

    parent_id = serializers.IntegerField(source="parent.id", read_only=True)

    class Meta:
        model = Categories
        fields = (
            "id",
            "nom",
            "slug",
            "description",
            "est_actif",
            "image_url",
            "position",
            "parent",      # pk du parent
            "parent_id",   # pk du parent (utile pour le filtrage front)
        )





class ProductEditSerializer(serializers.ModelSerializer):
    # on veut traduire les champs texte
    # i18n_fields = ["nom", "description_courte", "description_long"]

    # relations imbriquées
    categorie = CategorieMiniSerializer(read_only=True)
    sous_categorie = CategorieMiniSerializer(read_only=True)
    marque = MarqueMiniSerializer(read_only=True)
    variantes = VarianteSerializer(many=True, read_only=True)
    images = ImageProduitSerializer(many=True, read_only=True)

    class Meta:
        model = Produits
        fields = (
            "id",
            "nom",
            "slug",
            "description_courte",
            "description_long",
            "categorie",
            "sous_categorie",
            "marque",
            "est_actif",
            "visible",
            "garantie_mois",
            "poids_grammes",
            "dimensions",
            "etat",
            "variantes",
            "images",
        )

    def to_representation(self, instance):
        """
        Corrige les anciens produits :
        - si sous_categorie est vide
        - et que categorie a un parent
        => on considère que categorie = parent, et la vraie catégorie feuille = sous_categorie.
        """
        data = super().to_representation(instance)

        cat = getattr(instance, "categorie", None)
        subcat = getattr(instance, "sous_categorie", None)

        # cas typique : ancien produit où tu n'avais que 'categorie' pointant sur la sous-catégorie
        if subcat is None and cat is not None and getattr(cat, "parent_id", None):
            parent = cat.parent  # catégorie parente

            data["categorie"] = (
                CategorieMiniSerializer(parent, context=self.context).data
                if parent
                else None
            )
            data["sous_categorie"] = CategorieMiniSerializer(
                cat, context=self.context
            ).data

        return data



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
        # Nouveaux champs pour le front (prix + promo)
    prix_from = serializers.SerializerMethodField()
    old_price_from = serializers.SerializerMethodField()
    promo_now = serializers.SerializerMethodField()
    promo_fin = serializers.SerializerMethodField()
 
    class Meta:
        model = Produits
        fields = (
            "id", "nom", "slug", "description_courte",
            "marque", "categorie", "images", "variantes",
            "price",          # prix min actuel (avec promo appliquée)
            "prix_from",      # alias pour le front
            "old_price_from", # ancien prix min si promo
            "promo_now",      # True/False
            "promo_fin",      # date de fin de promo (si dispo)
            "image", "specs", "state",
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
    def get_prix_from(self, obj):
        """
        Même valeur que price, mais avec le nouveau nom attendu par le front.
        """
        prix = _product_min_price(obj)
        return str(prix) if prix is not None else None

    def get_old_price_from(self, obj):
        now = timezone.now()
        old_prices = []
        for v in obj.variantes.all():
            if (
                v.promo_active
                and v.prix_promo is not None
                and v.prix is not None
                and (not v.promo_debut or v.promo_debut <= now)
                and (not v.promo_fin or now <= v.promo_fin)
            ):
                old_prices.append(v.prix)
        return min(old_prices) if old_prices else None

    # 👉 Remettre cette méthode AU BON NIVEAU (pas imbriquée !)
    def get_promo_now(self, obj):
        now = timezone.now()
        for v in obj.variantes.all():
            if (
                v.promo_active
                and v.prix_promo is not None
                and (not v.promo_debut or v.promo_debut <= now)
                and (not v.promo_fin or now <= v.promo_fin)
            ):
                return True
        return False


       

    def get_prix_from(self, obj):
        now = timezone.now()
        prix_list = []
        for v in obj.variantes.all():
            # si promo valide → on prend le prix_promo
            if (
                v.promo_active
                and v.prix_promo is not None
                and (not v.promo_debut or v.promo_debut <= now)
                and (not v.promo_fin or now <= v.promo_fin)
            ):
                prix_list.append(v.prix_promo)
            elif v.prix is not None:
                prix_list.append(v.prix)
        return min(prix_list) if prix_list else None

    def get_old_price_from(self, obj):
        now = timezone.now()
        old_prices = []
        for v in obj.variantes.all():
            if (
                v.promo_active
                and v.prix_promo is not None
                and v.prix is not None
                and (not v.promo_debut or v.promo_debut <= now)
                and (not v.promo_fin or now <= v.promo_fin)
            ):
                old_prices.append(v.prix)
        return min(old_prices) if old_prices else None
    def get_promo_fin(self, obj):
        """
        Date de fin de promo (on prend la plus tardive des variantes en promo).
        Utilisée pour "Offre valable jusqu'au ...".
        """
        now = timezone.now()
        dates = []

        for v in obj.variantes.all():
            if not v.promo_active or v.prix_promo is None:
                continue
            if v.promo_debut and v.promo_debut > now:
                continue
            if v.promo_fin:
                dates.append(v.promo_fin)

        if not dates:
            return None
        # DRF sérialisera le datetime en ISO8601 → new Date(...) côté front
        return max(dates)


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
    variantes = VarianteSerializer(many=True, read_only=True)  # 👈 AJOUT ICI
    images = ImageProduitSerializer(many=True, read_only=True)
    class Meta:
        model = Produits
        fields = '__all__'  # on garde tout
        # Si tu préfères être explicite:
        # fields = [..., 'variants_stock']
    def get_variants_stock(self, instance):
            return list(instance.variantes.order_by("id").values_list("stock", flat=True))

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # (ton code existant)
        vset = getattr(instance, "variantes", None)
        first_var = vset.order_by("id").first() if vset is not None else None
        data["prix_from"] = (
            str(first_var.prix) if (first_var and first_var.prix is not None) else None
        )
        return data
    
class ArticleDashboardSerializer(serializers.ModelSerializer):
    # + traduire les champs de texte du blog
    # i18n_fields = ["titre", "slug", "extrait", "contenu"]
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
    if not p:
        return None

    # 🔹 1) Enlever les anciens host locaux
    LOCAL_PREFIXES = (
        "http://127.0.0.1:8000",
        "http://localhost:8000",
        "http://0.0.0.0:8000",
    )
    for pref in LOCAL_PREFIXES:
        if p.startswith(pref):
            p = p[len(pref):] or ""
            break

    # 🔹 2) Si c’est déjà une URL absolue http(s)/data → on laisse
    if p.lower().startswith(("http://", "https://", "data:")):
        return p

    # 🔹 3) Chemin relatif → on colle derrière MEDIA_URL
    if request is not None:
        base = request.build_absolute_uri(settings.MEDIA_URL)
    else:
        base = settings.MEDIA_URL

    return f"{base.rstrip('/')}/{p.lstrip('/')}"



class ArticleEditSerializer( serializers.ModelSerializer):
    # + traduire aussi en mode “edit” (lecture)
    # i18n_fields = ["titre","slug", "extrait", "contenu"]
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
    # + pour la réponse (to_representation) après création
    # i18n_fields = ["titre", "slug", "extrait", "contenu"]
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
