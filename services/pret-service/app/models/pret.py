
import uuid

from django.db import models


class PretStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    APPROVED = "approved", "Approved"
    REJECTED = "rejected", "Rejected"


class Pret(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id = models.UUIDField(db_index=True)
    motif = models.CharField(max_length=255)
    fonction = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=PretStatus.choices, default=PretStatus.PENDING)
    duree = models.IntegerField(help_text="Durée du prêt en mois")
    montant_demande = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    feedback_manager_id = models.UUIDField(null=True, blank=True, db_index=True)
    feedback_rh_id = models.UUIDField(null=True, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)