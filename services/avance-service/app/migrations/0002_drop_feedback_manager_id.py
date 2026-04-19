from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("app", "0001_initial"),
    ]

    operations = [
        migrations.RunSQL(
            sql="ALTER TABLE app_avance DROP COLUMN IF EXISTS feedback_manager_id;",
            reverse_sql=(
                "ALTER TABLE app_avance "
                "ADD COLUMN feedback_manager_id uuid NULL;"
            ),
        ),
    ]
