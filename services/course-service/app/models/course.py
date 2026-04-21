
import uuid

from django.db import models


class Status(models.TextChoices):
    TERMINE = "termine", "Terminé"
    EN_COURS = "en_cours", "En cours"
    AFFECTEE = "affectee", "Affectée"
    PAS_AFFECTEE = "pas_affectee", "Pas affectée"


class CourseType(models.TextChoices):
    ADMINISTRATIVE = "administrative", "Administrative"
    MATERIAL = "material", "Matériel"


class Course(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=20, choices=CourseType.choices, default=CourseType.ADMINISTRATIVE)
    phone_number = models.CharField(max_length=30, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    attachment_id = models.UUIDField(blank=True, null=True)
    user_id = models.UUIDField(db_index=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PAS_AFFECTEE)
    delivered_time_id = models.UUIDField(blank=True, null=True, db_index=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    destination = models.CharField(max_length=100, blank=True, null=True)
    dimensions = models.CharField(max_length=100, blank=True, null=True)
    weight = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    courier_id = models.UUIDField(blank=True, null=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name or str(self.id)