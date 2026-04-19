from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("app", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="conge",
            name="attachment_url",
            field=models.UUIDField(blank=True, null=True, db_index=True),
        ),
    ]
