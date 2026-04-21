from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("app", "0004_course_type"),
    ]

    operations = [
        migrations.AddField(
            model_name="course",
            name="phone_number",
            field=models.CharField(blank=True, max_length=30, null=True),
        ),
    ]
