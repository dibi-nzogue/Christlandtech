from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("christland", "0023_remove_slug_unique"),
    ]

    operations = [
        migrations.RunSQL(
            sql="ALTER TABLE produits DROP CONSTRAINT IF EXISTS uq_produits_slug;",
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]
