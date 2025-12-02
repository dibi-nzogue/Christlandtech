from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("christland", "0024_drop_slug_unique_constraint"),
    ]

    operations = [
        migrations.RunSQL(
            sql="DROP INDEX IF EXISTS uq_produits_slug;",
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]
