from django.db import models


# ===== Référentiels ===========================================================

from django.db import models

class Categories(models.Model):
    nom = models.CharField(max_length=255, blank=True)
    slug = models.CharField(max_length=255, blank=True)
    description = models.CharField(max_length=255, blank=True)
    image_url = models.CharField(max_length=255, blank=True)
    est_actif = models.BooleanField(default=False)
    position = models.IntegerField(null=True, blank=True)
    cree_le = models.DateTimeField(null=True, blank=True)

    # ✅ Auto-référence (catégorie parente)
    parent = models.ForeignKey(
        'self',
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='enfants'
    )

    class Meta:
        db_table = 'categories'
        indexes = [models.Index(fields=['parent'])]  # optionnel mais recommandé



class Marques(models.Model):
    nom = models.CharField(max_length=255, blank=True)
    slug = models.CharField(max_length=255, blank=True)
    logo_url = models.CharField(max_length=255, blank=True)
    site_web_url = models.CharField(max_length=255, blank=True)
    description = models.CharField(max_length=255, blank=True)
    pays_origine = models.CharField(max_length=255, blank=True)
    cree_le = models.DateTimeField(null=True, blank=True)
    est_active = models.BooleanField(null=True, blank=True, default=None)
    modifie_le = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'marques'

    def __str__(self):
        return self.nom or f'Marque#{self.id}'


class Couleurs(models.Model):
    nom = models.CharField(max_length=255, blank=True)
    code_hex = models.CharField(max_length=255, blank=True)
    slug = models.CharField(max_length=255, blank=True)
    est_active = models.BooleanField(default=False)
    cree_le = models.DateTimeField(null=True, blank=True)
    modifie_le = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'couleurs'

    def __str__(self):
        return self.nom or f'Couleur#{self.id}'


# ===== Utilisateurs / Favoris =================================================

class Utilisateurs(models.Model):
    email = models.CharField(max_length=255, blank=True)
    telephone = models.CharField(max_length=255, blank=True)
    mot_de_passe_hash = models.CharField(max_length=255, blank=True)
    prenom = models.CharField(max_length=255, blank=True)
    nom = models.CharField(max_length=255, blank=True)
    actif = models.BooleanField(default=False)
    role = models.CharField(max_length=100, blank=True)  # <= ajouté comme demandé
    cree_le = models.DateTimeField(null=True, blank=True)
    modifie_le = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'utilisateurs'

    def __str__(self):
        base = f'{self.prenom} {self.nom}'.strip()
        return base or self.email or f'User#{self.id}'


class FavorisClasseur(models.Model):
    nom = models.CharField(max_length=255, blank=True)
    cree_le = models.DateTimeField(null=True, blank=True)
    class Meta:
        db_table = 'favoris_classeur'

    def __str__(self):
        return self.nom or f'Classeur#{self.id}'


class Favoris(models.Model):
    utilisateur = models.ForeignKey(Utilisateurs, on_delete=models.CASCADE, related_name='favoris', null=True, blank=True)
    element = models.ForeignKey(FavorisClasseur, on_delete=models.CASCADE, related_name='favoris', null=True, blank=True)
    nom = models.CharField(max_length=255, blank=True)
    class Meta:
        db_table = 'favoris'


# ===== Catalogue ==============================================================

class Produits(models.Model):
    nom = models.CharField(max_length=255, blank=True)
    slug = models.CharField(max_length=255, blank=True)
    description_courte = models.CharField(max_length=255, blank=True)
    description_long = models.CharField(max_length=255, blank=True)
    garantie_mois = models.IntegerField(null=True, blank=True)
    poids_grammes = models.DecimalField(max_digits=18, decimal_places=2, null=True, blank=True)
    est_actif = models.BooleanField(default=False)
    visible = models.IntegerField(null=True, blank=True)
    prix_reference_avant = models.IntegerField(null=True, blank=True)
    cree_le = models.DateTimeField(null=True, blank=True)
    dimensions = models.CharField(max_length=255, blank=True)
    

    # clés de rattachement usuelles (si présentes dans ton schéma relationnel)
    categorie = models.ForeignKey(Categories, on_delete=models.SET_NULL, null=True, blank=True, related_name='produits')
    marque = models.ForeignKey(Marques, on_delete=models.SET_NULL, null=True, blank=True, related_name='produits')

    class Meta:
        db_table = 'produits'

    def __str__(self):
        return self.nom or f'Produit#{self.id}'


class VariantesProduits(models.Model):
    produit = models.ForeignKey(Produits, on_delete=models.CASCADE, related_name='variantes', null=True, blank=True)
    sku = models.CharField(max_length=255, blank=True)
    code_barres = models.CharField(max_length=255, blank=True)
    nom = models.CharField(max_length=255, blank=True)
    prix = models.DecimalField(max_digits=18, decimal_places=2, null=True, blank=True) 
    prix_promo = models.DecimalField(max_digits=18, decimal_places=2, null=True, blank=True)
    stock = models.IntegerField(null=True, blank=True)
    couleur = models.ForeignKey(Couleurs, on_delete=models.SET_NULL, null=True, blank=True, related_name='variantes')
    poids_grammes = models.DecimalField(max_digits=18, decimal_places=2, null=True, blank=True)
    cree_le = models.DateTimeField(null=True, blank=True)
    prix_achat = models.DecimalField(max_digits=18, decimal_places=2, null=True, blank=True)
    est_actif = models.BooleanField(default=False)
    class Meta:
        db_table = 'variantes_produits'

    def __str__(self):
        base = self.nom or self.sku
        return base or f'Variante#{self.id}'


class ImagesProduits(models.Model):
    produit = models.ForeignKey(Produits, on_delete=models.CASCADE, related_name='images', null=True, blank=True)
    url = models.CharField(max_length=255, blank=True)
    alt_text = models.CharField(max_length=255, blank=True)
    position = models.IntegerField(null=True, blank=True)
    principale = models.BooleanField(default=False)
    class Meta:
        db_table = 'images_produits'
        ordering = ['position']


class AvisProduits(models.Model):
    utilisateur = models.ForeignKey(Utilisateurs, on_delete=models.SET_NULL, null=True, blank=True, related_name='avis')
    produit = models.ForeignKey(Produits, on_delete=models.CASCADE, null=True, blank=True, related_name='avis')
    note = models.IntegerField(null=True, blank=True)
    commentaire = models.CharField(max_length=255, blank=True)
    statut  = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'avis_produits'


# ===== Panier / Commande ======================================================

class Paniers(models.Model):
    montant = models.DecimalField(max_digits=18, decimal_places=2, null=True, blank=True)
    session_id = models.CharField(max_length=255, blank=True)
    cree_le = models.DateTimeField(null=True, blank=True)
    utilisateur = models.ForeignKey(Utilisateurs, on_delete=models.SET_NULL, null=True, blank=True, related_name='paniers')

    class Meta:
        db_table = 'paniers'


class LignesPanier(models.Model):
    panier = models.ForeignKey(Paniers, on_delete=models.CASCADE, related_name='lignes', null=True, blank=True)
    variante = models.ForeignKey(VariantesProduits, on_delete=models.PROTECT, related_name='lignes_panier', null=True, blank=True)
    quantite = models.IntegerField(null=True, blank=True)
    cree_le = models.DateTimeField(null=True, blank=True)
    prix_unitaire = models.DecimalField(max_digits=18, decimal_places=2, null=True, blank=True)
    class Meta:
        db_table = 'lignes_panier'


class Commandes(models.Model):
    numero = models.CharField(max_length=255, blank=True)
    utilisateur = models.ForeignKey(Utilisateurs, on_delete=models.PROTECT, null=True, blank=True, related_name='commandes')
    statut = models.CharField(max_length=255, blank=True)
    statut_paiement = models.CharField(max_length=255, blank=True)
    statut_livraison = models.CharField(max_length=255, blank=True)
    sous_total  =  models.DecimalField(max_digits=18, decimal_places=2, null=True, blank=True)
    total_remise  =  models.DecimalField(max_digits=18, decimal_places=2, null=True, blank=True)
    total_livraison   =  models.DecimalField(max_digits=18, decimal_places=2, null=True, blank=True)
    total_taxes   =  models.DecimalField(max_digits=18, decimal_places=2, null=True, blank=True)
    total_general    =  models.DecimalField(max_digits=18, decimal_places=2, null=True, blank=True)
    cree_le = models.DateTimeField(null=True, blank=True)
    montant = models.DecimalField(max_digits=18, decimal_places=2, null=True, blank=True)
    modifie_le = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'commandes'

    def __str__(self):
        return self.numero or f'CMD#{self.id}'


class Attribut(models.Model):
    TEXTE, ENTIER, DECIMAL, BOOLEEN, CHOIX = "text","int","dec","bool","choice"
    TYPES = [(TEXTE,"Texte"),(ENTIER,"Entier"),(DECIMAL,"Décimal"),(BOOLEEN,"Booléen"),(CHOIX,"Choix")]
    code = models.SlugField(max_length=80, unique=True)
    libelle = models.CharField(max_length=120)
    type = models.CharField(choices=TYPES, max_length=10, default=TEXTE)
    unite = models.CharField(max_length=20, blank=True)
    ordre = models.IntegerField(default=0)
    actif = models.BooleanField(default=True)
    class Meta: db_table="attributs"; ordering=["ordre","libelle"]

class ValeurAttribut(models.Model):
    attribut = models.ForeignKey(Attribut, on_delete=models.CASCADE, related_name="valeurs")
    valeur = models.CharField(max_length=120)
    slug = models.SlugField(max_length=140)
    class Meta: db_table="attributs_valeurs"; unique_together=[("attribut","slug")]; ordering=["valeur"]

class CategorieAttribut(models.Model):
    categorie = models.ForeignKey(Categories, on_delete=models.CASCADE, related_name="attributs")
    attribut = models.ForeignKey(Attribut, on_delete=models.CASCADE, related_name="categories")
    obligatoire = models.BooleanField(default=False)
    ordre = models.IntegerField(default=0)
    class Meta: db_table="categories_attributs"; unique_together=[("categorie","attribut")]; ordering=["ordre"]

class SpecProduit(models.Model):
    produit = models.ForeignKey(Produits, on_delete=models.CASCADE, related_name="specs")
    attribut = models.ForeignKey(Attribut, on_delete=models.CASCADE, related_name="specs_produit")
    valeur_text = models.CharField(max_length=255, blank=True)
    valeur_int = models.IntegerField(null=True, blank=True)
    valeur_dec = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    valeur_choice = models.ForeignKey(ValeurAttribut, null=True, blank=True, on_delete=models.SET_NULL)
    class Meta:
        db_table="specs_produits"
        unique_together=[("produit","attribut")]
        indexes=[models.Index(fields=["attribut","valeur_int"]),
                 models.Index(fields=["attribut","valeur_dec"]),
                 models.Index(fields=["attribut","valeur_choice"])]

class SpecVariante(models.Model):
    variante = models.ForeignKey(VariantesProduits, on_delete=models.CASCADE, related_name="specs")
    attribut = models.ForeignKey(Attribut, on_delete=models.CASCADE, related_name="specs_variante")
    valeur_text = models.CharField(max_length=255, blank=True)
    valeur_int = models.IntegerField(null=True, blank=True)
    valeur_dec = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    valeur_choice = models.ForeignKey(ValeurAttribut, null=True, blank=True, on_delete=models.SET_NULL)
    class Meta:
        db_table="specs_variantes"
        unique_together=[("variante","attribut")]
        indexes=[models.Index(fields=["attribut","valeur_int"]),
                 models.Index(fields=["attribut","valeur_dec"]),
                 models.Index(fields=["attribut","valeur_choice"])]


class LignesCommande(models.Model):
    commande = models.ForeignKey(Commandes, on_delete=models.CASCADE, related_name='lignes', null=True, blank=True)
    variante = models.ForeignKey(VariantesProduits, on_delete=models.PROTECT, related_name='lignes_commande', null=True, blank=True)
    quantite = models.IntegerField(null=True, blank=True)
    prix_unitaire_lic = models.DecimalField(max_digits=18, decimal_places=2, null=True, blank=True)
    total_ligne = models.DecimalField(max_digits=18, decimal_places=2, null=True, blank=True)
    nom_snapshot_lic = models.CharField(max_length=255, blank=True)

    class Meta:
        db_table = 'lignes_commande'


class Adresses(models.Model):
    libelle = models.CharField(max_length=255, blank=True)
    nom_complet = models.CharField(max_length=255, blank=True)
    ligne1 = models.CharField(max_length=255, blank=True)
    ligne2 = models.CharField(max_length=255, blank=True)
    ville = models.CharField(max_length=255, blank=True)
    region = models.CharField(max_length=255, blank=True)
    code_postal = models.CharField(max_length=255, blank=True)
    pays = models.CharField(max_length=255, blank=True)
    telephone = models.CharField(max_length=255, blank=True)
    cree_le = models.DateTimeField(null=True, blank=True)
    utilisateur = models.ForeignKey(Utilisateurs, on_delete=models.SET_NULL, null=True, blank=True, related_name='adresses')

    class Meta:
        db_table = 'adresses'


class AdressesCommande(models.Model):
    commande = models.ForeignKey(Commandes, on_delete=models.CASCADE, related_name='adresses', null=True, blank=True)
    type = models.CharField(max_length=255, blank=True)  # SHIPPING / BILLING
    nom_complet = models.CharField(max_length=255, blank=True)
    telephone = models.CharField(max_length=255, blank=True)
    email = models.CharField(max_length=255, blank=True)
    ligne1 = models.CharField(max_length=255, blank=True)
    ligne2 = models.CharField(max_length=255, blank=True)
    ville = models.CharField(max_length=255, blank=True)
    region = models.CharField(max_length=255, blank=True)
    code_postal = models.CharField(max_length=255, blank=True)
    pays = models.CharField(max_length=255, blank=True)
    notes = models.CharField(max_length=255, blank=True)
    class Meta:
        db_table = 'adresses_commande'


class Paiements(models.Model):
    commande = models.ForeignKey(Commandes, on_delete=models.CASCADE, related_name='paiements', null=True, blank=True)
    fournisseur = models.CharField(max_length=255, blank=True)
    transaction_externe_id = models.CharField(max_length=255, blank=True)
    montant = models.DecimalField(max_digits=18, decimal_places=2, null=True, blank=True)
    statut = models.CharField(max_length=255, blank=True)
    pays = models.CharField(max_length=255, blank=True) 
    class Meta:
        db_table = 'paiements'


class Remboursements(models.Model):
    paiement = models.ForeignKey(Paiements, on_delete=models.SET_NULL, null=True, blank=True, related_name='remboursements')
    montant = models.DecimalField(max_digits=18, decimal_places=2, null=True, blank=True)
    motif = models.CharField(max_length=255, blank=True)
    statut = models.CharField(max_length=255, blank=True)

    class Meta:
        db_table = 'remboursements'


# ===== Livraison / Stock ======================================================

class Livreurs(models.Model):
    nom = models.CharField(max_length=255, blank=True)
    email = models.CharField(max_length=255, blank=True)
    telephone = models.CharField(max_length=255, blank=True)
    type = models.CharField(max_length=255, blank=True)
    vehicule = models.CharField(max_length=255, blank=True)
    zone = models.CharField(max_length=255, blank=True)
    disponibilite = models.CharField(max_length=255, blank=True)
    immatriculation = models.CharField(max_length=255, blank=True)
    cree_le = models.DateTimeField(null=True, blank=True)
    modifie_le = models.DateTimeField(null=True, blank=True)
    actif = models.BooleanField(default=False)

    class Meta:
        db_table = 'livreurs'


class Expeditions(models.Model):
    commande = models.ForeignKey(Commandes, on_delete=models.CASCADE, related_name='expeditions', null=True, blank=True)
    mode = models.CharField(max_length=255, blank=True)
    numero_suivi = models.CharField(max_length=255, blank=True)
    preuve_signature_url = models.CharField(max_length=255, blank=True)
    preuve_photo_url = models.CharField(max_length=255, blank=True)
    livreur = models.ForeignKey(Livreurs, on_delete=models.SET_NULL, null=True, blank=True, related_name='expeditions')
    statut = models.CharField(max_length=255, blank=True)
    Expedier_le = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'expeditions'


class Entrepots(models.Model):
    nom = models.CharField(max_length=255, blank=True)
    adresse_json = models.CharField(max_length=255, blank=True)
    gps_lat_gps_lon = models.CharField(max_length=255, blank=True)
    est_actif = models.BooleanField(default=False)
    cree_le = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'entrepots'


class MouvementsStock(models.Model):
    variante = models.ForeignKey(VariantesProduits, on_delete=models.PROTECT, related_name='mouvements', null=True, blank=True)
    entrepot = models.ForeignKey(Entrepots, on_delete=models.PROTECT, related_name='mouvements', null=True, blank=True)
    type = models.CharField(max_length=255, blank=True)  # DEBIT / CREDIT
    quantite = models.IntegerField(null=True, blank=True)
    raison = models.DateTimeField(null=True, blank=True)
    gps_lat_gps_lon = models.CharField(max_length=255, blank=True)

    class Meta:
        db_table = 'mouvements_stock'


class Stocks(models.Model):
    # Associations du diagramme (FK)
    variante = models.ForeignKey('VariantesProduits', on_delete=models.PROTECT, related_name='stocks')
    entrepot = models.ForeignKey('Entrepots', on_delete=models.PROTECT, related_name='stocks')

    # Attributs du diagramme
    quantite_disponible = models.IntegerField()
    quantite_reservee = models.IntegerField(default=0)

    class Meta:
        db_table = 'stocks'
        unique_together = [('variante', 'entrepot')]


# ===== Coupons / Marketing ====================================================

class Coupons(models.Model):
    code = models.CharField(max_length=255, blank=True)
    type = models.CharField(max_length=255, blank=True)
    premier_achat_uniquement = models.BooleanField(default=False)
    canal = models.CharField(max_length=255, blank=True)
    valeur = models.DecimalField(max_digits=18, decimal_places=2, null=True, blank=True)
    montant_minimal = models.DecimalField(max_digits=18, decimal_places=2, null=True, blank=True)
    actif = models.BooleanField(default=False)
    debut = models.DateTimeField(null=True, blank=True)
    fin = models.DateTimeField(null=True, blank=True)
    cree_le = models.DateTimeField(null=True, blank=True)
    cumulable  = models.BooleanField(default=False)
    modifie_le = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'coupons'




class Representants(models.Model):
    nom = models.CharField(max_length=255, blank=True)
    email = models.CharField(max_length=255, blank=True)
    telephone = models.CharField(max_length=255, blank=True)
    actif = models.BooleanField(default=False)
    cree_le = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'representants'


class CouponsUtilisations(models.Model):
    coupon = models.ForeignKey(Coupons, on_delete=models.CASCADE, related_name='utilisations', null=True, blank=True)
    commande = models.ForeignKey(Commandes, on_delete=models.SET_NULL, null=True, blank=True, related_name='coupons_utilises')
    utilisateur = models.ForeignKey(Utilisateurs, on_delete=models.SET_NULL, null=True, blank=True, related_name='coupons_utilises')
    representant = models.ForeignKey(Representants, on_delete=models.SET_NULL, null=True, blank=True, related_name='coupons_utilises')
    utilise_le = models.DateTimeField(null=True, blank=True)
    commission_montant  = models.DecimalField(max_digits=18, decimal_places=2, null=True, blank=True)
    montant_remise = models.DecimalField(max_digits=18, decimal_places=2, null=True, blank=True)
    commission_statut  = models.DecimalField(max_digits=18, decimal_places=2, null=True, blank=True)

    class Meta:
        db_table = 'coupons_utilisations'


class BandeauxMarketing(models.Model):
    titre = models.CharField(max_length=255, blank=True)               # <- simplifié (ex: titre_ban → titre)
    image_url = models.CharField(max_length=255, blank=True)           # <- image_url_ban → image_url
    lien_url = models.CharField(max_length=255, blank=True)            # <- lien_url_ban → lien_url
    position = models.IntegerField(null=True, blank=True)
    produit = models.ForeignKey(Produits, on_delete=models.SET_NULL, null=True, blank=True, related_name='bandeaux')
    categorie = models.ForeignKey(Categories, on_delete=models.SET_NULL, null=True, blank=True, related_name='bandeaux')
    coupon = models.ForeignKey(Coupons, on_delete=models.SET_NULL, null=True, blank=True, related_name='bandeaux')
    actif = models.BooleanField(default=False)
    debut = models.DateTimeField(null=True, blank=True)
    fin = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'bandeaux_marketing'
        ordering = ['position']


# ===== Blog / Contenu =========================================================

class ArticlesBlog(models.Model):
    titre = models.CharField(max_length=255, blank=True)
    slug = models.CharField(max_length=255, blank=True)
    extrait = models.CharField(max_length=255, blank=True)
    contenu = models.CharField(max_length=255, blank=True)
    image_couverture =  models.CharField(max_length=255, blank=True)
    publie_le = models.DateTimeField(null=True, blank=True)
    cree_le = models.DateTimeField(null=True, blank=True)
    modifie_le = models.DateTimeField(null=True, blank=True)
    categorie = models.ForeignKey(Categories, on_delete=models.SET_NULL, null=True, blank=True, related_name='articles')
    auteur = models.ForeignKey(Utilisateurs, on_delete=models.SET_NULL, null=True, blank=True, related_name='articles')

    class Meta:
        db_table = 'articles_blog'

    def __str__(self):
        return self.titre or f'Article#{self.id}'


class CommentairesBlog(models.Model):
    article = models.ForeignKey(ArticlesBlog, on_delete=models.CASCADE, related_name='commentaires', null=True, blank=True)
    contenu = models.CharField(max_length=255, blank=True)
    statut = models.CharField(max_length=255, blank=True)
    valide = models.BooleanField(default=False)
    cree_le = models.DateTimeField(null=True, blank=True)
    approuve_le = models.DateTimeField(null=True, blank=True)
    utilisateur = models.ForeignKey(Utilisateurs, on_delete=models.SET_NULL, null=True, blank=True, related_name='commentaires_blog')

    class Meta:
        db_table = 'commentaires_blog'


# ===== Messages / Notifications / Analytics ==================================

class MessagesContact(models.Model):
    nom = models.CharField(max_length=255, blank=True)
    email = models.CharField(max_length=255, blank=True)
    telephone = models.CharField(max_length=255, blank=True)
    canal_prefere = models.CharField(max_length=255, blank=True)
    statut = models.CharField(max_length=255, blank=True)
    sujet = models.CharField(max_length=255, blank=True)
    message = models.CharField(max_length=255, blank=True)
    utilisateur = models.ForeignKey(Utilisateurs, on_delete=models.SET_NULL, null=True, blank=True, related_name='messages_contact')
    cree_le = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'messages_contact'


class Notifications(models.Model):
    canal = models.CharField(max_length=255, blank=True)
    modele = models.CharField(max_length=255, blank=True)
    payload_json = models.CharField(max_length=255, blank=True)
    statut = models.CharField(max_length=255, blank=True)
    utilisateur = models.ForeignKey(Utilisateurs, on_delete=models.CASCADE, related_name='notifications', null=True, blank=True)
    cree_le = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'notifications'


class EvenementsAnalytics(models.Model):
    type_evenement = models.CharField(max_length=255, blank=True)
    date_evenement = models.DateTimeField(null=True, blank=True)
    page_url = models.CharField(max_length=255, blank=True)
    utm_source = models.CharField(max_length=255, blank=True)
    appareil = models.CharField(max_length=255, blank=True)
    utm_campaign = models.CharField(max_length=255, blank=True)
    pays = models.CharField(max_length=255, blank=True)
    ip_client = models.CharField(max_length=255, blank=True)
    ville = models.CharField(max_length=255, blank=True)
    utilisateur = models.ForeignKey(Utilisateurs, on_delete=models.SET_NULL, null=True, blank=True, related_name='evenements_analytics')

    class Meta:
        db_table = 'evenements_analytics'
