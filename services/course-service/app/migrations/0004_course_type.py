from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("app", "0003_remove_course_code_remove_course_attachment_url_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="course",
            name="type",
            field=models.CharField(
                choices=[
                    ("administrative", "Administrative"),
                    ("material", "Matériel"),
                ],
                default="administrative",
                max_length=20,
            ),
        ),
    ]