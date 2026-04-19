from django.db import migrations, models
import uuid


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Conge",
            fields=[
                ("id", models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, serialize=False)),
                ("user_id", models.UUIDField(db_index=True)),
                ("type_dabsense", models.CharField(max_length=50, choices=[("normale", "Normale"), ("maladie", "Maladie")])),
                ("start_date", models.DateField()),
                ("end_date", models.DateField()),
                ("motif", models.CharField(max_length=255)),
                ("feedback_rh_id", models.UUIDField(null=True, blank=True, db_index=True)),
                ("feedback_manager_id", models.UUIDField(null=True, blank=True, db_index=True)),
                ("solde_id", models.UUIDField(null=True, blank=True, db_index=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
        ),
    ]
