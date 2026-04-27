import uuid
from django.db import models


class ForOther(models.Model):
    SERVICE_CHOICES = [
        ("attestation", "Attestation Service"),
        ("conge", "Conge Service"),
        ("pret", "Pret Service"),
        ("avance", "Avance Service"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    matricule = models.CharField(max_length=50, blank=True, null=True)
    target_service = models.CharField(max_length=20, choices=SERVICE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "for_others"

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.target_service})"
