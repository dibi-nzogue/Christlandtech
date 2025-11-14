from django.db import migrations, models
# Si tu es sur PostgreSQL et souhaites activer l’index trigram, dé-commente les 2 lignes ci-dessous
# from django.contrib.postgres.indexes import GinIndex

class Migration(migrations.Migration):

    dependencies = [
        ("christland", "0016_traduction"),  # ← bonne app + dernière migration visible dans ta capture
    ]

    operations = [
        # Accélère les recherches par nom
        migrations.AlterField(
            model_name="produits",
            name="nom",
            field=models.CharField(max_length=255, db_index=True),
        ),

        # Filtres fréquents: actifs/visibles par catégorie
        migrations.AddIndex(
            model_name="produits",
            index=models.Index(fields=["est_actif", "visible", "categorie"], name="prod_active_cat"),
        ),

        # Tri/filtre par prix
        migrations.AddIndex(
            model_name="variantesproduits",
            index=models.Index(fields=["produit", "prix"], name="var_prix_idx"),
        ),
        migrations.AddIndex(
            model_name="variantesproduits",
            index=models.Index(fields=["produit", "prix_promo"], name="var_promo_idx"),
        ),

        # Récupération rapide de l’image principale
        migrations.AddIndex(
            model_name="imagesproduits",
            index=models.Index(fields=["produit", "principale", "position"], name="img_main_idx"),
        ),

        # Filtres par slug
        migrations.AddIndex(
            model_name="marques",
            index=models.Index(fields=["slug"], name="brand_slug_idx"),
        ),
        migrations.AddIndex(
            model_name="couleurs",
            index=models.Index(fields=["slug"], name="color_slug_idx"),
        ),

        # --- Optionnel (PostgreSQL uniquement, nécessite l’extension pg_trgm) ---
        # migrations.AddIndex(
        #     model_name="produits",
        #     index=GinIndex(fields=["nom"], name="prod_nom_gin", opclasses=["gin_trgm_ops"]),
        # ),
    ]
