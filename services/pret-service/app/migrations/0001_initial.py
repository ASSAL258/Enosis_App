from django.db import migrations, models
import uuid


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Pret",
            fields=[
                ("id", models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, serialize=False)),
                ("user_id", models.UUIDField(db_index=True)),
                ("motif", models.CharField(max_length=255)),
                ("fonction", models.CharField(max_length=255)),
                ("status", models.CharField(max_length=20, choices=[("pending", "Pending"), ("approved", "Approved"), ("rejected", "Rejected")], default="pending")),
                ("duree", models.IntegerField(help_text="Durée du prêt en mois")),
                ("montant_demande", models.DecimalField(max_digits=10, decimal_places=2, default=0)),
                ("feedback_manager_id", models.UUIDField(null=True, blank=True, db_index=True)),
                ("feedback_rh_id", models.UUIDField(null=True, blank=True, db_index=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
        ),
    ]
