from django.db import migrations, models
import uuid


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Avance",
            fields=[
                ("id", models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, serialize=False)),
                ("user_id", models.UUIDField(db_index=True)),
                ("feedback_rh_id", models.UUIDField(null=True, blank=True, db_index=True)),
                ("motif", models.CharField(max_length=255)),
                ("montante", models.DecimalField(max_digits=10, decimal_places=2)),
                (
                    "duree_de_remboursement",
                    models.IntegerField(choices=[(1, "1 mois"), (2, "2 mois")]),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "verbose_name": "Avance",
                "verbose_name_plural": "Avances",
            },
        ),
        migrations.AddIndex(
            model_name="avance",
            index=models.Index(fields=["user_id"], name="app_avance_user_id_4f0f84_idx"),
        ),
        migrations.AddIndex(
            model_name="avance",
            index=models.Index(fields=["feedback_rh_id"], name="app_avance_feedbac_f3504f_idx"),
        ),
    ]
