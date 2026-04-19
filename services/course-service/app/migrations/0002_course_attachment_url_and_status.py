from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("app", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="course",
            name="attachment_url",
            field=models.UUIDField(blank=True, null=True, db_index=True),
        ),
        migrations.AddField(
            model_name="course",
            name="status",
            field=models.CharField(
                max_length=20,
                choices=[
                    ("termine", "Terminé"),
                    ("en_cours", "En cours"),
                    ("affectee", "Affectée"),
                    ("pas_affectee", "Pas affectée"),
                ],
                default="pas_affectee",
            ),
        ),
    ]
