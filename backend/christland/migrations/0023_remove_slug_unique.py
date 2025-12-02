from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        # 🔴 Mets ici EXACTEMENT le nom de ta migration 0022 (sans .py)
        ("christland", "0022_alter_variantesproduits_sku"),
    ]

    operations = [
        migrations.RunSQL(
            sql="ALTER TABLE produits DROP CONSTRAINT IF EXISTS uq_produits_slug;",
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]
