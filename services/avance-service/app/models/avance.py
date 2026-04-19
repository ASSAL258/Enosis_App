import uuid

from django.db import models


class Avance(models.Model):
    class DureeDeRemboursement(models.IntegerChoices):
        ONE_MONTH = 1, "1 mois"
        TWO_MONTHS = 2, "2 mois"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id = models.UUIDField(db_index=True)
    feedback_rh_id = models.UUIDField(null=True, blank=True, db_index=True)
    motif = models.CharField(max_length=255)
    montante = models.DecimalField(max_digits=10, decimal_places=2)
    duree_de_remboursement = models.IntegerField(choices=DureeDeRemboursement.choices)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Avance {self.id} for User {self.user_id}"

    class Meta:
        verbose_name = "Avance"
        verbose_name_plural = "Avances"
        indexes = [
            models.Index(fields=["user_id"]),
            models.Index(fields=["feedback_rh_id"]),
        ]