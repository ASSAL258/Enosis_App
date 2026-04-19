from django.db import migrations, models
import uuid


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Solde",
            fields=[
                ("id", models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, serialize=False)),
                ("conge_id", models.UUIDField(db_index=True)),
                ("solde_initial", models.DecimalField(max_digits=10, decimal_places=2)),
                ("solde_accorde", models.DecimalField(max_digits=10, decimal_places=2, default=0)),
                ("solde_restant", models.DecimalField(max_digits=10, decimal_places=2)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]
