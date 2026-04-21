from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("app", "0002_course_attachment_url_and_status"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="course",
            name="code",
        ),
        migrations.RemoveField(
            model_name="course",
            name="attachment_url",
        ),
        migrations.AddField(
            model_name="course",
            name="dimensions",
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name="course",
            name="weight",
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True),
        ),
    ]