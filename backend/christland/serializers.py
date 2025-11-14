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
# helper générique pour traduire un champ d'instance selon la langue de la requête
from christland.services.i18n_translate import translate_field_for_instance

def _req_lang_from_context(context) -> str:
    req = context.get("request") if context else None
    if req:
        q = (req.query_params.get("lang") or "").strip().lower()
        if q:
            return q.split(",")[0].split("-")[0]
        raw = (req.headers.get("Accept-Language") or "fr").lower()
        primary = raw.split(",")[0].strip()
        return primary.split("-")[0] if primary else "fr"
    return "fr"

def _tr_from_context(ctx, instance, field_name: str, value: str):
    """
    Version robuste : essaie à la fois model_name (lower) ET NomDeClasse.
    Évite l'appel si langue 'fr' ou value vide.
    """
    if not isinstance(value, str) or not value:
        return value

    lang = _req_lang_from_context(ctx)
    if lang in ("fr", "", None):
        return value

    meta = getattr(instance, "_meta", None)
    if not meta:
        return value

    app_label = getattr(meta, "app_label", "christland")
    model_keys = [
        getattr(meta, "model_name", instance.__class__.__name__).lower(),  # ex: "produits"
        instance.__class__.__name__,                                       # ex: "Produits"
    ]
    obj_id = getattr(instance, "pk", None)
    if obj_id is None:
        return value

    # Essaie d'abord la clé "standard" (lower), puis la clé "NomDeClasse"
    for mk in model_keys:
        t = translate_field_for_instance(app_label, mk, str(obj_id), field_name, value, lang)
        if t != value:
            return t
    return value



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
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        ctx = self.context
        data["nom"] = _tr_from_context(ctx, instance, "nom", data.get("nom"))

        # Couleur.nom (imbriqué)
        if data.get("couleur") and instance.couleur_id:
            data["couleur"]["nom"] = _tr_from_context(
                ctx, instance.couleur, "nom", data["couleur"].get("nom")
            )
        return data
    
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
    i18n_fields = ["nom","slug"]
    parent_slug = serializers.CharField(source="parent.slug", read_only=True)

    class Meta:
        model = Categories
        fields = ("nom", "slug", "parent_slug")



class ProduitCardSerializer(serializers.ModelSerializer):
    # Données embarquées
    images = ImageProduitSerializer(many=True, read_only=True)
    variantes = VarianteSerializer(many=True, read_only=True)
    marque = MarqueMiniSerializer(read_only=True)
    categorie = CategorieMiniSerializer(read_only=True)

    # Champs calculés
    prix_from = serializers.SerializerMethodField()
    old_price_from = serializers.SerializerMethodField()
    promo_now = serializers.SerializerMethodField()
    promo_fin = serializers.SerializerMethodField()

    # Champs stock
    quantite = serializers.IntegerField(read_only=True)   # si présent sur Produits
    stock_total = serializers.SerializerMethodField()     # somme des stocks des variantes

    class Meta:
        model = Produits
        fields = (
            "id", "nom", "slug",
            "description_courte",
            "categorie", "marque",
            "images", "variantes",
            "prix_from", "old_price_from", "promo_now", "promo_fin",
            "quantite", "stock_total",
        )

    # --------------------------
    # Traductions centralisées
    # --------------------------
    def to_representation(self, instance):
        """
        Point unique pour appliquer les traductions i18n,
        afin que CategoryProductList (qui renvoie un queryset) bénéficie de la même logique
        que tes autres vues qui appellent tr_product_card.
        """
        data = super().to_representation(instance)
        ctx = self.context

        # Produit.nom
        # Produit.nom
        data["nom"] = _tr_from_context(ctx, instance, "nom", data.get("nom"))
        if data["nom"] == instance.nom:
            # 🩹 fallback : on force le lookup avec modèle explicite
            lang = _req_lang_from_context(ctx)
            data["nom"] = translate_field_for_instance(
                "christland",    # app_label
                "produits",      # modèle lowercase exact de ta table
                str(instance.id),
                "nom",
                data["nom"],
                lang,
            )


        # Produit.description_courte
        if "description_courte" in data:
            data["description_courte"] = _tr_from_context(
                ctx, instance, "description_courte", data.get("description_courte")
            )

        # Catégorie.nom
        if data.get("categorie") and instance.categorie_id:
            data["categorie"]["nom"] = _tr_from_context(
                ctx, instance.categorie, "nom", data["categorie"].get("nom")
            )

        # Marque.nom
        if data.get("marque") and instance.marque_id:
            data["marque"]["nom"] = _tr_from_context(
                ctx, instance.marque, "nom", data["marque"].get("nom")
            )

        # Variantes[].nom (on traduit via id de la variante)
        lang = _req_lang_from_context(ctx)
        for v in (data.get("variantes") or []):
            vid = v.get("id")
            if not vid:
                continue
            v["nom"] = translate_field_for_instance(
                instance._meta.app_label,           # "christland"
                "variantesproduits",                # modèle en bdd (lowercase)
                str(vid),
                "nom",
                v.get("nom") or "",
                lang,
            )

        # Images[].alt_text (si ImageProduitSerializer expose "id")
        for im in (data.get("images") or []):
            iid = im.get("id")
            if not iid:
                # si pas d'id exposé, on laisse tel quel
                continue
            im["alt_text"] = translate_field_for_instance(
                instance._meta.app_label,
                "imagesproduits",
                str(iid),
                "alt_text",
                im.get("alt_text") or "",
                lang,
            )

        return data

    # --------------------------
    # Méthodes de calcul
    # --------------------------
    def get_stock_total(self, obj):
        # Somme des stocks de toutes les variantes (None -> 0)
        return sum((v.stock or 0) for v in obj.variantes.all())

    def get_prix_from(self, obj):
        prices = []
        for v in obj.variantes.all():
            pa = v.prix_actuel()
            if pa is not None:
                prices.append(pa)
        return min(prices) if prices else None

    def get_old_price_from(self, obj):
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
        now = timezone.now()
        for v in obj.variantes.all():
            if v.promo_active and v.prix_promo is not None:
                if (not v.promo_debut or v.promo_debut <= now) and (not v.promo_fin or now <= v.promo_fin):
                    return True
        return False

    def get_promo_fin(self, obj):
        now = timezone.now()
        fins = []
        for v in obj.variantes.all():
            if v.promo_active and v.prix_promo is not None:
                if (not v.promo_debut or v.promo_debut <= now) and (not v.promo_fin or now <= v.promo_fin):
                    if v.promo_fin:
                        fins.append(v.promo_fin)
        return min(fins).isoformat() if fins else None
   
   


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
