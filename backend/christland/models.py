from django.db import models


# ---------- Utilisateurs / Référentiels ----------

class Favori(models.Model):
    favoris_id = models.BigAutoField(primary_key=True)
    nom = models.CharField(max_length=254, null=True, blank=True)
    cree_le = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "favoris"


class Marque(models.Model):
    marque_id = models.BigAutoField(primary_key=True)
    nom = models.CharField(max_length=254, null=True, blank=True)
    slug = models.CharField(max_length=254, null=True, blank=True)
    logo_url = models.CharField(max_length=254, null=True, blank=True)
    site_web_url = models.CharField(max_length=254, null=True, blank=True)
    pays_origine = models.CharField(max_length=254, null=True, blank=True)
    description = models.CharField(max_length=254, null=True, blank=True)
    est_active = models.BooleanField(null=True, blank=True)
    cree_le = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "marques"


class Couleur(models.Model):
    couleur_id = models.BigAutoField(primary_key=True)
    nom = models.CharField(max_length=254, null=True, blank=True)
    code_hex = models.CharField(max_length=254, null=True, blank=True)
    slug = models.CharField(max_length=254, null=True, blank=True)
    est_active = models.BooleanField(null=True, blank=True)
    cree_le = models.DateTimeField(null=True, blank=True)
    modifie_le = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "couleurs"


class Entrepot(models.Model):
    entrepot_id = models.BigAutoField(primary_key=True)
    nom = models.CharField(max_length=254, null=True, blank=True)
    adresse_json = models.JSONField(null=True, blank=True)
    gps_lat_gps_lon = models.DecimalField(max_digits=12, decimal_places=6, null=True, blank=True)
    est_actif = models.BooleanField(null=True, blank=True)
    cree_le = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "entrepots"


class Representant(models.Model):
    representant_id = models.BigAutoField(primary_key=True)
    nom = models.CharField(max_length=254, null=True, blank=True)
    email = models.CharField(max_length=254, null=True, blank=True)
    telephone = models.CharField(max_length=254, null=True, blank=True)
    actif = models.BooleanField(null=True, blank=True)
    cree_le = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "representants"


class Livreur(models.Model):
    livreur_id = models.BigAutoField(primary_key=True)
    nom = models.CharField(max_length=254, null=True, blank=True)
    email = models.CharField(max_length=254, null=True, blank=True)
    telephone = models.CharField(max_length=254, null=True, blank=True)
    type = models.CharField(max_length=254, null=True, blank=True)
    vehicule_type = models.CharField(max_length=254, null=True, blank=True)
    immatriculation = models.CharField(max_length=254, null=True, blank=True)
    zone = models.CharField(max_length=254, null=True, blank=True)
    actif = models.BooleanField(null=True, blank=True)
    cree_le = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "livreurs"


class Utilisateur(models.Model):
    utilisateur_id = models.BigAutoField(primary_key=True)
    # Relations (optionnelles dans ton MCD mais peu “logiques” côté utilisateur)
    favoris = models.ForeignKey(Favori, on_delete=models.RESTRICT, null=True, blank=True)
    produit = models.ForeignKey("Produit", on_delete=models.RESTRICT, null=True, blank=True)

    email = models.CharField(max_length=254, null=True, blank=True)
    telephone = models.CharField(max_length=254, null=True, blank=True)
    mot_de_passe_hash = models.CharField(max_length=254, null=True, blank=True)
    prenom = models.CharField(max_length=254, null=True, blank=True)
    nom = models.CharField(max_length=254, null=True, blank=True)
    role = models.CharField(max_length=254, null=True, blank=True)
    est_actif = models.BooleanField(null=True, blank=True)
    derniere_connexion = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "utilisateurs"


class Adresse(models.Model):
    adresse_id = models.BigAutoField(primary_key=True)
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.RESTRICT, null=True, blank=True)
    libelle = models.CharField(max_length=254, null=True, blank=True)
    nom_complet = models.CharField(max_length=254, null=True, blank=True)
    ligne1 = models.CharField(max_length=254, null=True, blank=True)
    ligne2 = models.CharField(max_length=254, null=True, blank=True)
    ville = models.CharField(max_length=254, null=True, blank=True)
    region = models.CharField(max_length=254, null=True, blank=True)
    code_postal = models.CharField(max_length=254, null=True, blank=True)
    pays = models.CharField(max_length=254, null=True, blank=True)
    defaut_facturation = models.BooleanField(null=True, blank=True)
    defaut_livraison = models.BooleanField(null=True, blank=True)

    class Meta:
        db_table = "adresses"


# ---------- Blog ----------

class ArticleBlog(models.Model):
    article_id = models.BigAutoField(primary_key=True)
    titre = models.CharField(max_length=254, null=True, blank=True)
    slug = models.CharField(max_length=254, null=True, blank=True)
    extrait = models.CharField(max_length=254, null=True, blank=True)
    contenu = models.CharField(max_length=254, null=True, blank=True)
    image_couverture = models.CharField(max_length=254, null=True, blank=True)
    statut = models.CharField(max_length=254, null=True, blank=True)
    publie_le = models.DateTimeField(null=True, blank=True)
    cree_le = models.DateTimeField(null=True, blank=True)
    modifie_le = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "articles_blog"


class CommentaireBlog(models.Model):
    commentaire_id = models.IntegerField(primary_key=True)
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.RESTRICT, null=True, blank=True)
    article = models.ForeignKey(ArticleBlog, on_delete=models.RESTRICT)
    contenu = models.CharField(max_length=254, null=True, blank=True)
    statut = models.CharField(max_length=254, null=True, blank=True)
    cree_le = models.DateTimeField(null=True, blank=True)
    approuve_le = models.DateTimeField(null=True, blank=True)
    est_valide = models.BooleanField(null=True, blank=True)

    class Meta:
        db_table = "commentaires_blog"


# ---------- Catalogue ----------

class BandeauMarketing(models.Model):
    bandeau_id = models.BigIntegerField(primary_key=True)
    produit = models.ForeignKey(
        "Produit",            # entre guillemets = pas besoin d’ordre d’import
        on_delete=models.RESTRICT,
        null=True, blank=True
    )
    coupon = models.ForeignKey(
        "Coupon",
        on_delete=models.RESTRICT,
        null=True, blank=True
    )
    # FK produit & coupon plus bas (après déclaration des classes)
    titre = models.CharField(max_length=254, null=True, blank=True)
    image_url = models.CharField(max_length=254, null=True, blank=True)
    lien_url = models.CharField(max_length=254, null=True, blank=True)
    position = models.CharField(max_length=254, null=True, blank=True)
    est_actif = models.BooleanField(null=True, blank=True)
    debut_le = models.DateTimeField(null=True, blank=True)
    fin_le = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "bandeaux_marketing"


class Categorie(models.Model):
    categorie_id = models.BigAutoField(primary_key=True)
    parent = models.ForeignKey("self", on_delete=models.RESTRICT, null=True, blank=True, db_column="cat_categorie_id")
    bandeau = models.ForeignKey(BandeauMarketing, on_delete=models.RESTRICT, null=True, blank=True)
    nom = models.CharField(max_length=254, null=True, blank=True)
    slug = models.CharField(max_length=254, null=True, blank=True)
    description = models.CharField(max_length=254, null=True, blank=True)
    image_url = models.CharField(max_length=254, null=True, blank=True)
    est_actif = models.BooleanField(null=True, blank=True)
    position = models.IntegerField(null=True, blank=True)
    cree_le = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "categories"


class Produit(models.Model):
    produit_id = models.BigAutoField(primary_key=True)
    categorie = models.ForeignKey(Categorie, on_delete=models.RESTRICT)
    marque = models.ForeignKey(Marque, on_delete=models.RESTRICT)
    nom = models.CharField(max_length=254, null=True, blank=True)
    slug = models.CharField(max_length=254, null=True, blank=True)
    description_courte = models.CharField(max_length=254, null=True, blank=True)
    description_long = models.CharField(max_length=254, null=True, blank=True)
    garantie_mois = models.IntegerField(null=True, blank=True)
    poids_grammes = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    est_actif = models.BooleanField(null=True, blank=True)
    visible = models.IntegerField(null=True, blank=True)
    pr_avant = models.IntegerField(null=True, blank=True)
    cree_le = models.DateTimeField(null=True, blank=True)
    dimensions = models.CharField(max_length=254, null=True, blank=True)

    class Meta:
        db_table = "produits"


class Stock(models.Model):
    stock_id = models.BigAutoField(primary_key=True)
    entrepot = models.ForeignKey(Entrepot, on_delete=models.RESTRICT)
    quantite_disponible = models.IntegerField(null=True, blank=True)
    quantite_reservee = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = "stocks"


class VarianteProduit(models.Model):
    variante_id = models.BigAutoField(primary_key=True)
    stock = models.ForeignKey(Stock, on_delete=models.RESTRICT)
    produit = models.ForeignKey(Produit, on_delete=models.RESTRICT)
    couleur = models.ForeignKey(Couleur, on_delete=models.RESTRICT, null=True, blank=True)
    sku = models.CharField(max_length=254, null=True, blank=True)
    code_barres = models.CharField(max_length=254, null=True, blank=True)
    nom = models.CharField(max_length=254, null=True, blank=True)
    prix = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    prix_compare = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    prix_achat = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(null=True, blank=True)
    modifie_le = models.DateTimeField(null=True, blank=True)
    is_active_debut_ma = models.BooleanField(null=True, blank=True)
    stock_quantite = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = "variantes_produits"


class ImageProduit(models.Model):
    image_id = models.IntegerField(primary_key=True)
    produit = models.ForeignKey(Produit, on_delete=models.RESTRICT)
    url = models.CharField(max_length=254, null=True, blank=True)
    alt_text = models.CharField(max_length=254, null=True, blank=True)
    position = models.IntegerField(null=True, blank=True)
    principale = models.CharField(max_length=254, null=True, blank=True)

    class Meta:
        db_table = "images_produits"


# ---------- Panier / Commande / Paiement ----------

class Panier(models.Model):
    panier_id = models.BigAutoField(primary_key=True)
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.RESTRICT, null=True, blank=True)
    montant = models.CharField(max_length=254, null=True, blank=True)
    cree_le = models.DateTimeField(null=True, blank=True)
    session_id = models.BigIntegerField(null=True, blank=True)

    class Meta:
        db_table = "paniers"


class LignePanier(models.Model):
    variante_id_pa = models.BigAutoField(primary_key=True)
    variante = models.ForeignKey(VarianteProduit, on_delete=models.RESTRICT)
    panier = models.ForeignKey(Panier, on_delete=models.RESTRICT)
    quantite = models.IntegerField(null=True, blank=True)
    prix_unitaire = models.IntegerField(null=True, blank=True)
    cree_le = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "lignes_panier"


class Commande(models.Model):
    commande_id = models.BigAutoField(primary_key=True)
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.RESTRICT)
    adresse = models.ForeignKey(Adresse, on_delete=models.RESTRICT)
    numero = models.IntegerField(null=True, blank=True)
    statut = models.CharField(max_length=254, null=True, blank=True)
    statut_paiement = models.CharField(max_length=254, null=True, blank=True)
    statut_livraison = models.CharField(max_length=254, null=True, blank=True)
    sous_total = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    total_livraison = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    total_taxes = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    total_general = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    total_remise = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    montant = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    modifie_le = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "commandes"


class LigneCommande(models.Model):
    ligne_commande_id = models.BigAutoField(primary_key=True)
    commande = models.ForeignKey(Commande, on_delete=models.RESTRICT)
    variante = models.ForeignKey(VarianteProduit, on_delete=models.RESTRICT)
    nom_snapshot = models.CharField(max_length=254, null=True, blank=True)
    prix_unitaire = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    quantite = models.IntegerField(null=True, blank=True)
    total_ligne = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    class Meta:
        db_table = "lignes_commande"


class Remboursement(models.Model):
    remboursement_id = models.BigAutoField(primary_key=True)
    montant = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    motif = models.CharField(max_length=254, null=True, blank=True)
    statut = models.CharField(max_length=254, null=True, blank=True)

    class Meta:
        db_table = "remboursements"


class Paiement(models.Model):
    paiement_id = models.BigAutoField(primary_key=True, db_column="paiement_id_pai")
    commande = models.ForeignKey(Commande, on_delete=models.RESTRICT)
    remboursement = models.ForeignKey(Remboursement, on_delete=models.RESTRICT, null=True, blank=True)
    fournisseur = models.CharField(max_length=254, null=True, blank=True)
    transaction_externe_id = models.BigIntegerField(null=True, blank=True)
    montant = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    statut = models.CharField(max_length=254, null=True, blank=True)
    paye_le = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "paiements"


# ---------- Adresses commande / Expéditions ----------

class AdresseCommande(models.Model):
    adresse_cm_id = models.BigAutoField(primary_key=True)
    commande = models.ForeignKey(Commande, on_delete=models.RESTRICT)
    type = models.CharField(max_length=254, null=True, blank=True)
    nom_complet = models.CharField(max_length=254, null=True, blank=True)
    telephone = models.CharField(max_length=254, null=True, blank=True)
    email = models.CharField(max_length=254, null=True, blank=True)
    ligne1 = models.CharField(max_length=254, null=True, blank=True)
    ligne2 = models.CharField(max_length=254, null=True, blank=True)
    ville = models.CharField(max_length=254, null=True, blank=True)
    region = models.CharField(max_length=254, null=True, blank=True)
    code_postal = models.CharField(max_length=254, null=True, blank=True)
    pays = models.CharField(max_length=254, null=True, blank=True)
    notes = models.CharField(max_length=254, null=True, blank=True)

    class Meta:
        db_table = "adresses_commande"


class Expedition(models.Model):
    expedition_id = models.BigAutoField(primary_key=True)
    commande = models.ForeignKey(Commande, on_delete=models.RESTRICT)
    livreur = models.ForeignKey(Livreur, on_delete=models.RESTRICT)
    mode = models.CharField(max_length=254, null=True, blank=True)
    preuve_signature_url = models.CharField(max_length=254, null=True, blank=True)
    preuve_photo_url = models.CharField(max_length=254, null=True, blank=True)
    numero_suivi = models.IntegerField(null=True, blank=True)
    statut = models.CharField(max_length=254, null=True, blank=True)
    expedie_le = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "expeditions"


# ---------- Coupons ----------

class Coupon(models.Model):
    coupon_id = models.IntegerField(primary_key=True)
    representant = models.ForeignKey(Representant, on_delete=models.RESTRICT)
    code = models.CharField(max_length=254, null=True, blank=True)
    type = models.CharField(max_length=254, null=True, blank=True)
    premier_achat_uniquement = models.BooleanField(null=True, blank=True)
    canal = models.CharField(max_length=254, null=True, blank=True)
    valeur = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    utilisations_max = models.IntegerField(null=True, blank=True)
    cumulable = models.BooleanField(null=True, blank=True)
    debut_le = models.DateTimeField(null=True, blank=True)
    fin_le = models.DateTimeField(null=True, blank=True)
    montant_min_commande = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    est_actif = models.BooleanField(null=True, blank=True)

    class Meta:
        db_table = "coupons"


class CouponUtilisation(models.Model):
    utilisation_id = models.BigAutoField(primary_key=True)
    coupon = models.ForeignKey(Coupon, on_delete=models.RESTRICT)
    representant = models.ForeignKey(Representant, on_delete=models.RESTRICT)
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.RESTRICT, null=True, blank=True)
    utilise_le = models.DateTimeField(null=True, blank=True)
    montant_remise = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    etat = models.CharField(max_length=254, null=True, blank=True)
    premier_achat = models.BooleanField(null=True, blank=True)
    commission_montant = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    commission_statut = models.CharField(max_length=254, null=True, blank=True)

    class Meta:
        db_table = "coupons_utilisations"


class Lier(models.Model):
    # association coupons_utilisations <-> commandes
    utilisation = models.ForeignKey(CouponUtilisation, on_delete=models.RESTRICT)
    commande = models.ForeignKey(Commande, on_delete=models.RESTRICT)

    class Meta:
        db_table = "lier"
        unique_together = (("utilisation", "commande"),)


# ---------- Avis / Analytics / Notifs / Messages ----------

class AvisProduit(models.Model):
    avis_id = models.BigAutoField(primary_key=True)
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.RESTRICT, null=True, blank=True)
    note = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    commentaire = models.CharField(max_length=254, null=True, blank=True)
    status = models.CharField(max_length=254, null=True, blank=True)
    created_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "avis_produits"


class EvenementAnalytics(models.Model):
    evenement_id = models.BigAutoField(primary_key=True)
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.RESTRICT)
    type_evenement = models.CharField(max_length=254, null=True, blank=True)
    date_evenement = models.DateTimeField(null=True, blank=True)
    page_url = models.CharField(max_length=254, null=True, blank=True)
    utm_source = models.CharField(max_length=254, null=True, blank=True)
    utm_campaign = models.CharField(max_length=254, null=True, blank=True)
    appareil = models.CharField(max_length=254, null=True, blank=True)
    ip = models.CharField(max_length=254, null=True, blank=True)
    pays = models.CharField(max_length=254, null=True, blank=True)
    ville = models.CharField(max_length=254, null=True, blank=True)
    metadonnees_json = models.JSONField(null=True, blank=True)

    class Meta:
        db_table = "evenements_analytics"


class Notification(models.Model):
    notification_id = models.BigAutoField(primary_key=True, db_column="notification_id_")
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.RESTRICT)
    canal = models.CharField(max_length=254, null=True, blank=True, db_column="canal_")
    modele = models.CharField(max_length=254, null=True, blank=True, db_column="modele_")
    payload_json = models.JSONField(null=True, blank=True, db_column="payload_json_")
    statut = models.CharField(max_length=254, null=True, blank=True, db_column="statut_")
    envoye_le = models.DateTimeField(null=True, blank=True, db_column="envoye_le_")

    class Meta:
        db_table = "notifications"


class MessageContact(models.Model):
    message_id = models.BigAutoField(primary_key=True)
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.RESTRICT)
    nom = models.CharField(max_length=254, null=True, blank=True)
    email = models.CharField(max_length=254, null=True, blank=True)
    telephone = models.CharField(max_length=254, null=True, blank=True)
    canal_prefere = models.CharField(max_length=254, null=True, blank=True)
    statut = models.CharField(max_length=254, null=True, blank=True)
    cree_le = models.DateTimeField(null=True, blank=True)
    sujet = models.CharField(max_length=254, null=True, blank=True)
    message = models.TextField(null=True, blank=True)

    class Meta:
        db_table = "messages_contact"


# ---------- Liens favoris / Stocks / Mouvements ----------

class FavoriClasseur(models.Model):
    element_id = models.BigAutoField(primary_key=True)
    favoris = models.ForeignKey(Favori, on_delete=models.RESTRICT, null=True, blank=True)
    produit = models.ForeignKey(Produit, on_delete=models.RESTRICT)
    ajoute_le = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "favoris_classeur"


class MouvementStock(models.Model):
    mouvement_id = models.IntegerField(primary_key=True)
    variante = models.ForeignKey(VarianteProduit, on_delete=models.RESTRICT)
    entrepot = models.ForeignKey(Entrepot, on_delete=models.RESTRICT)
    type = models.CharField(max_length=254, null=True, blank=True)
    quantite = models.IntegerField(null=True, blank=True)
    raison = models.CharField(max_length=254, null=True, blank=True)
    cree_le = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "mouvements_stock"
