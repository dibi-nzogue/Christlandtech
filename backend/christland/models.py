from django.db import models

# =========================
# Comptes / Référentiels
# =========================

class Utilisateur(models.Model):
    id = models.BigAutoField(primary_key=True, db_column="utilisateur_id")
    email = models.EmailField(max_length=255, unique=True, db_column="email_ut")
    phone = models.CharField(max_length=30, blank=True, db_column="telephone_ut")
    password_hash = models.CharField(max_length=255, db_column="mot_de_passe_hash")
    first_name = models.CharField(max_length=150, blank=True, db_column="nom_ut")
    last_name = models.CharField(max_length=150, blank=True, db_column="prenom_ut")
    created_at = models.DateTimeField(auto_now_add=True, db_column="cree_le_ut")

    class Meta:
        db_table = "utilisateurs"

    def __str__(self):
        return self.email


# =========================
# Catalogue
# =========================

class Marque(models.Model):
    id = models.BigAutoField(primary_key=True, db_column="marque_id")
    name = models.CharField(max_length=200, db_column="nom_mar")
    slug = models.SlugField(max_length=220, unique=True, db_column="slug_mar")
    logo_url = models.URLField(blank=True, db_column="logo_url_mar")
    website = models.URLField(blank=True, db_column="site_web_url_mar")
    country = models.CharField(max_length=120, blank=True, db_column="pays_origine_mar")

    class Meta:
        db_table = "marques"

    def __str__(self):
        return self.name


class Categorie(models.Model):
    id = models.BigAutoField(primary_key=True, db_column="categorie_id")
    name = models.CharField(max_length=200, db_column="nom_ca")
    slug = models.SlugField(max_length=220, unique=True, db_column="slug_ca")
    description = models.TextField(blank=True, db_column="description_ca")
    image_url = models.URLField(blank=True, db_column="image_url_ca")
    parent = models.ForeignKey("self", null=True, blank=True, on_delete=models.SET_NULL,
                               related_name="children", db_column="parent_id")

    class Meta:
        db_table = "categories"

    def __str__(self):
        return self.name


class Produit(models.Model):
    id = models.BigAutoField(primary_key=True, db_column="produit_id")
    name = models.CharField(max_length=250, db_column="nom_pr")
    slug = models.SlugField(max_length=260, unique=True, db_column="slug_pr")
    short_desc = models.CharField(max_length=500, blank=True, db_column="description_courte_pr")
    description = models.TextField(blank=True, db_column="description_pr")
    marque = models.ForeignKey(Marque, null=True, blank=True, on_delete=models.SET_NULL, related_name="products")
    categorie = models.ForeignKey(Categorie, null=True, blank=True, on_delete=models.SET_NULL, related_name="products")
    is_active = models.BooleanField(default=True, db_column="actif_pr")
    created_at = models.DateTimeField(auto_now_add=True, db_column="cree_le_pr")

    class Meta:
        db_table = "produits"

    def __str__(self):
        return self.name


class Couleur(models.Model):
    id = models.BigAutoField(primary_key=True, db_column="couleur_id")
    name = models.CharField(max_length=100, db_column="nom_cou")
    hex_code = models.CharField(max_length=7, db_column="code_hex_cou")  # #RRGGBB
    slug = models.SlugField(max_length=120, unique=True, db_column="slug_cou")
    is_active = models.BooleanField(default=True, db_column="est_active_cou")
    created_at = models.DateTimeField(auto_now_add=True, db_column="cree_le_cou")

    class Meta:
        db_table = "couleurs"

    def __str__(self):
        return self.name


class VarianteProduit(models.Model):
    id = models.BigAutoField(primary_key=True, db_column="variante_id")
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE, related_name="variants")
    sku = models.CharField(max_length=80, unique=True, db_column="sku_va")
    barcode = models.CharField(max_length=64, blank=True, db_column="code_barres_va")
    name = models.CharField(max_length=200, blank=True, db_column="nom_va")
    couleur = models.ForeignKey(Couleur, null=True, blank=True, on_delete=models.SET_NULL, related_name="variants")
    price = models.DecimalField(max_digits=12, decimal_places=2, db_column="prix_ttc_va")
    weight_g = models.PositiveIntegerField(default=0, db_column="poids_grammes_va")
    is_active = models.BooleanField(default=True, db_column="actif_va")

    class Meta:
        db_table = "variantes_produits"

    def __str__(self):
        return f"{self.produit.name} - {self.sku}"


class ImageProduit(models.Model):
    id = models.BigAutoField(primary_key=True, db_column="image_id")
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE, related_name="images")
    variante = models.ForeignKey(VarianteProduit, null=True, blank=True, on_delete=models.CASCADE, related_name="images")
    url = models.URLField(db_column="url_im_im")
    alt = models.CharField(max_length=255, blank=True, db_column="alt_text_im")
    position = models.IntegerField(default=0, db_column="position_im")

    class Meta:
        db_table = "images_produits"
        ordering = ["position"]


class AvisProduit(models.Model):
    id = models.BigAutoField(primary_key=True, db_column="avis_id")
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE, related_name="reviews")
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE, related_name="reviews")
    rating = models.DecimalField(max_digits=3, decimal_places=1, db_column="note_re")
    comment = models.TextField(blank=True, db_column="commentaire_re")
    status = models.CharField(max_length=30, default="PENDING", db_column="status_re")
    created_at = models.DateTimeField(auto_now_add=True, db_column="cree_le_re")

    class Meta:
        db_table = "avis_produits"
        unique_together = [("produit", "utilisateur")]


# =========================
# Panier & Commande
# =========================

class Panier(models.Model):
    id = models.BigAutoField(primary_key=True, db_column="panier_id")
    utilisateur = models.ForeignKey(Utilisateur, null=True, blank=True, on_delete=models.SET_NULL, related_name="carts")
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0, db_column="montant_p")
    created_at = models.DateTimeField(auto_now_add=True, db_column="cree_le_p")
    session_id = models.CharField(max_length=100, blank=True, db_column="session_id_p")

    class Meta:
        db_table = "paniers"


class LignePanier(models.Model):
    id = models.BigAutoField(primary_key=True, db_column="ligne_panier_id")
    panier = models.ForeignKey(Panier, on_delete=models.CASCADE, related_name="items")
    variante = models.ForeignKey(VarianteProduit, on_delete=models.PROTECT, related_name="cart_items", db_column="variante_id_pa")
    qty = models.PositiveIntegerField(db_column="quantite_pa")
    unit_price = models.DecimalField(max_digits=12, decimal_places=2, db_column="prix_unitaire_pa")
    created_at = models.DateTimeField(auto_now_add=True, db_column="cree_le_pa")

    class Meta:
        db_table = "lignes_panier"


class Adresse(models.Model):
    id = models.BigAutoField(primary_key=True, db_column="adresse_id")
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE, related_name="addresses")
    label = models.CharField(max_length=200, db_column="libelle_ad", blank=True, null=True)
    full_name = models.CharField(max_length=200, db_column="nom_complet_ad", blank=True, null=True)
    line1 = models.CharField(max_length=200, db_column="ligne1_ad", blank=True, null=True)
    line2 = models.CharField(max_length=200, db_column="ligne2_ad", blank=True, null=True)
    city = models.CharField(max_length=120, db_column="ville_ad", blank=True, null=True)          # <= rendre nullable
    region = models.CharField(max_length=120, db_column="region_ad", blank=True, null=True)
    postal_code = models.CharField(max_length=20, db_column="code_postal_ad", blank=True, null=True)
    country = models.CharField(max_length=120, db_column="pays_ad", blank=True, null=True)        # <= rendre nullable
    phone = models.CharField(max_length=30, db_column="telephone_ad", blank=True, null=True)
    class Meta:
        db_table = "adresses"



class Commande(models.Model):
    id = models.BigAutoField(primary_key=True, db_column="commande_id")
    utilisateur = models.ForeignKey(Utilisateur, null=True, blank=True, on_delete=models.SET_NULL, related_name="orders")
    number = models.CharField(max_length=30, unique=True, db_column="numero_com")
    status = models.CharField(max_length=30, default="EN_COURS", db_column="statut_com")
    payment_status = models.CharField(max_length=30, default="EN_ATTENTE", db_column="statut_paiement_com")
    total = models.DecimalField(max_digits=12, decimal_places=2, db_column="total_ttc")
    created_at = models.DateTimeField(auto_now_add=True, db_column="cree_le_com")

    class Meta:
        db_table = "commandes"


class LigneCommande(models.Model):
    id = models.BigAutoField(primary_key=True, db_column="ligne_commande_id")
    commande = models.ForeignKey(Commande, on_delete=models.CASCADE, related_name="items")
    produit = models.ForeignKey(Produit, on_delete=models.PROTECT, related_name="order_items")
    variante = models.ForeignKey(VarianteProduit, on_delete=models.PROTECT, related_name="order_items")
    name_snapshot = models.CharField(max_length=250, db_column="nom_snapshot_lc")
    unit_price = models.DecimalField(max_digits=12, decimal_places=2, db_column="prix_unitaire_lic")
    qty = models.PositiveIntegerField(db_column="quantite_lic")

    class Meta:
        db_table = "lignes_commande"


class Paiement(models.Model):
    id = models.BigAutoField(primary_key=True, db_column="paiement_id_pai")
    commande = models.ForeignKey(Commande, on_delete=models.CASCADE, related_name="payments")
    provider = models.CharField(max_length=60, db_column="fournisseur_pai")
    external_id = models.CharField(max_length=120, db_column="transaction_externe_id_pai")
    amount = models.DecimalField(max_digits=12, decimal_places=2, db_column="montant_pai")
    status = models.CharField(max_length=30, default="EN_ATTENTE", db_column="statut_pai")
    created_at = models.DateTimeField(auto_now_add=True, db_column="cree_le_pai")

    class Meta:
        db_table = "paiements"


class AdresseCommande(models.Model):
    id = models.BigAutoField(primary_key=True, db_column="adresse_id")
    commande = models.ForeignKey(Commande, on_delete=models.CASCADE, related_name="addresses")
    type = models.CharField(max_length=20, db_column="type_ac")  # FACTURATION / LIVRAISON
    full_name = models.CharField(max_length=200, db_column="nom_complet_ac")
    phone = models.CharField(max_length=30, db_column="telephone_ac")
    data = models.JSONField(db_column="adresse_json_ac")

    class Meta:
        db_table = "adresses_commande"


class Remboursement(models.Model):
    id = models.BigAutoField(primary_key=True, db_column="remboursement_id")
    paiement = models.ForeignKey(Paiement, on_delete=models.CASCADE, related_name="refunds")
    amount = models.DecimalField(max_digits=12, decimal_places=2, db_column="montant_rem")
    reason = models.TextField(blank=True, db_column="motif_rem")
    status = models.CharField(max_length=30, default="EN_ATTENTE", db_column="statut_rem")
    created_at = models.DateTimeField(auto_now_add=True, db_column="cree_le_rem")

    class Meta:
        db_table = "remboursements"


# =========================
# Stocks / Entrepôts / Expéditions
# =========================

class Entrepot(models.Model):
    id = models.BigAutoField(primary_key=True, db_column="entrepot_id")
    name = models.CharField(max_length=200, db_column="nom_en")
    address = models.JSONField(db_column="adresse_json_en")
    lat = models.DecimalField(max_digits=10, decimal_places=7, db_column="gps_lat")
    lon = models.DecimalField(max_digits=10, decimal_places=7, db_column="gps_lon")

    class Meta:
        db_table = "entrepots"

    def __str__(self):
        return self.name


class Stock(models.Model):
    id = models.BigAutoField(primary_key=True, db_column="stock_id")
    entrepot = models.ForeignKey(Entrepot, on_delete=models.CASCADE, related_name="stocks")
    variante = models.ForeignKey(VarianteProduit, on_delete=models.CASCADE, related_name="stocks")
    qty_available = models.IntegerField(default=0, db_column="quantite_disponible_st")
    qty_reserved = models.IntegerField(default=0, db_column="quantite_reservee_st")

    class Meta:
        db_table = "stocks"
        unique_together = [("entrepot", "variante")]


class MouvementStock(models.Model):
    TYPES = (("ENTREE", "ENTREE"), ("DEBIT", "DEBIT"))
    id = models.BigAutoField(primary_key=True, db_column="mouvement_id")
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE, related_name="moves")
    kind = models.CharField(max_length=10, choices=TYPES, db_column="type_mou")
    qty = models.IntegerField(db_column="quantite_mou")
    reason = models.CharField(max_length=200, blank=True, db_column="raison_mou")
    created_at = models.DateTimeField(auto_now_add=True, db_column="cree_le_mou")

    class Meta:
        db_table = "mouvements_stock"


class Expedition(models.Model):
    id = models.BigAutoField(primary_key=True, db_column="expedition_id")
    commande = models.ForeignKey(Commande, on_delete=models.CASCADE, related_name="shipments")
    mode = models.CharField(max_length=50, db_column="mode_ex")
    tracking = models.CharField(max_length=120, blank=True, db_column="tracking_ex")
    signature_url = models.URLField(blank=True, db_column="signature_url_ex")
    proof_photo_url = models.URLField(blank=True, db_column="preuve_photo_url_ex")

    class Meta:
        db_table = "expeditions"


# =========================
# Promotions / Marketing
# =========================

class Coupon(models.Model):
    id = models.BigAutoField(primary_key=True, db_column="coupon_id")
    code = models.CharField(max_length=40, unique=True, db_column="code_cou")
    kind = models.CharField(max_length=20, db_column="type_cou")  # POURCENTAGE / MONTANT
    value = models.DecimalField(max_digits=10, decimal_places=2, db_column="valeur_cou")
    first_order_only = models.BooleanField(default=False, db_column="premier_achat_uniquement_cou")
    is_active = models.BooleanField(default=True, db_column="actif_cou")

    class Meta:
        db_table = "coupons"


class CouponUtilisation(models.Model):
    id = models.BigAutoField(primary_key=True, db_column="utilisation_id")
    coupon = models.ForeignKey(Coupon, on_delete=models.PROTECT, related_name="usages")
    commande = models.ForeignKey(Commande, on_delete=models.CASCADE, related_name="coupon_usages")
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE, related_name="coupon_usages")
    used_at = models.DateTimeField(auto_now_add=True, db_column="utilise_le_cu")
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, db_column="montant_remise_cu")
    state = models.CharField(max_length=20, default="APPLIQUE", db_column="etat")
    first_order = models.BooleanField(default=False, db_column="premier_achat")
    commission_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0, db_column="commission_montant")

    class Meta:
        db_table = "coupons_utilisations"
        unique_together = [("coupon", "commande")]


class BandeauMarketing(models.Model):
    id = models.BigAutoField(primary_key=True, db_column="bandeau_id")
    title = models.CharField(max_length=200, db_column="titre_ban")
    image_url = models.URLField(db_column="image_url_ban")
    link_url = models.URLField(blank=True, db_column="lien_url_ban")
    position = models.CharField(max_length=50, db_column="position_ban")  # HOME_TOP, etc.
    is_active = models.BooleanField(default=True, db_column="est_actif_ban")

    class Meta:
        db_table = "bandeaux_marketing"


# =========================
# Favoris
# =========================

class Favoris(models.Model):
    id = models.BigAutoField(primary_key=True, db_column="favoris_id")
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE, related_name="wishlists")
    name = models.CharField(max_length=200, db_column="nom_fa")
    created_at = models.DateTimeField(auto_now_add=True, db_column="cree_le_fa")

    class Meta:
        db_table = "favoris"

    def __str__(self):
        return f"{self.name} ({self.utilisateur.email})"


class FavorisClasseur(models.Model):
    id = models.BigAutoField(primary_key=True, db_column="element_id")
    favoris = models.ForeignKey(Favoris, on_delete=models.CASCADE, related_name="items")
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE, related_name="favorited_by", null=True, blank=True)
    variante = models.ForeignKey(VarianteProduit, on_delete=models.CASCADE, related_name="favorited_by", null=True, blank=True)
    added_at = models.DateTimeField(auto_now_add=True, db_column="ajoute_le_fc")

    class Meta:
        db_table = "favoris_classeur"
        indexes = [
            models.Index(fields=["favoris", "produit"]),
            models.Index(fields=["favoris", "variante"]),
        ]


# =========================
# CMS / Contact / Divers
# =========================

class MessageContact(models.Model):
    id = models.BigAutoField(primary_key=True, db_column="message_id")
    name = models.CharField(max_length=200, db_column="nom_me")
    email = models.EmailField(max_length=255, db_column="email_me")
    phone = models.CharField(max_length=30, blank=True, db_column="telephone_me")
    subject = models.CharField(max_length=255, blank=True, db_column="sujet_me")
    content = models.TextField(db_column="contenu_me")
    created_at = models.DateTimeField(auto_now_add=True, db_column="cree_le_me")

    class Meta:
        db_table = "messages_contact"


class ArticleBlog(models.Model):
    id = models.BigAutoField(primary_key=True, db_column="article_id")
    title = models.CharField(max_length=250, db_column="titre_ar")
    slug = models.SlugField(max_length=260, unique=True, db_column="slug_ar")
    excerpt = models.CharField(max_length=400, blank=True, db_column="extrait_ar")
    content = models.TextField(db_column="contenu_ar")
    cover_url = models.URLField(blank=True, db_column="image_couverture_ar")
    created_at = models.DateTimeField(auto_now_add=True, db_column="cree_le_ar")

    class Meta:
        db_table = "articles_blog"


class CommentaireBlog(models.Model):
    id = models.BigAutoField(primary_key=True, db_column="commentaire_id")
    article = models.ForeignKey(ArticleBlog, on_delete=models.CASCADE, related_name="comments")
    utilisateur = models.ForeignKey(Utilisateur, null=True, blank=True, on_delete=models.SET_NULL, related_name="blog_comments")
    content = models.TextField(db_column="contenu_com")
    status = models.CharField(max_length=20, default="PENDING", db_column="statut_com")
    created_at = models.DateTimeField(auto_now_add=True, db_column="cree_le_com")
    approved_at = models.DateTimeField(null=True, blank=True, db_column="approuve_le_com")
    is_valid = models.BooleanField(default=False, db_column="est_valide_com")

    class Meta:
        db_table = "commentaires_blog"


class EvenementAnalytics(models.Model):
    id = models.BigAutoField(primary_key=True, db_column="evenement_id")
    event_type = models.CharField(max_length=60, db_column="type_evenement")
    occurred_at = models.DateTimeField(auto_now_add=True, db_column="date_evenement")
    page_url = models.URLField(db_column="page_url")
    utm_source = models.CharField(max_length=120, blank=True, db_column="utm_source")
    utm_campaign = models.CharField(max_length=120, blank=True, db_column="utm_campaign")

    class Meta:
        db_table = "evenements_analytics"
