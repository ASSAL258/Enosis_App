
import uuid

from django.db import models


class Conge(models.Model):
    class TypeAbsence(models.TextChoices):
        NORMALE = "normale", "Normale"
        MALADIE = "maladie", "Maladie"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id = models.UUIDField(db_index=True)
    type_dabsense = models.CharField(max_length=50, choices=TypeAbsence.choices)
    start_date = models.DateField()
    end_date = models.DateField()
    motif = models.CharField(max_length=255)
    feedback_rh_id = models.UUIDField(null=True, blank=True, db_index=True)
    feedback_manager_id = models.UUIDField(null=True, blank=True, db_index=True)
    solde_id = models.UUIDField(null=True, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
 

