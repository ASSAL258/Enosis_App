from django.db import migrations, models
import uuid


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Course",
            fields=[
                ("id", models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, serialize=False)),
                ("name", models.CharField(max_length=255)),
                ("code", models.CharField(max_length=20, unique=True)),
                ("description", models.TextField(blank=True, null=True)),
                ("attachment_id", models.UUIDField(blank=True, null=True)),
                ("user_id", models.UUIDField(db_index=True)),
                ("delivered_time_id", models.UUIDField(blank=True, null=True, db_index=True)),
                ("city", models.CharField(max_length=100, blank=True, null=True)),
                ("destination", models.CharField(max_length=100, blank=True, null=True)),
                ("courier_id", models.UUIDField(blank=True, null=True, db_index=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
        ),
    ]
