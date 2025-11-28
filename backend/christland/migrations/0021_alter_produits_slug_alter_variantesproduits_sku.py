from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("christland", "0020_alter_produits_slug_alter_variantesproduits_sku"),
    ]

    # ⚠️ Migration volontairement VIDE
    # On considère que le schéma réel de la base est déjà aligné
    # avec les modèles (slug non unique, sku non unique).
    operations = [
    ]
