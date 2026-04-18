import uuid
from django.db import models

class Avance(models.Model):
    # Primary Key for the Avance record
    id = models.UUIDField(
        primary_key=True, 
        default=uuid.uuid4, 
        editable=False
    )
    
    # user_id : uuid 
    # Stored as a field rather than a ForeignKey to support microservices
    user_id = models.UUIDField(
        db_index=True, 
        help_text="The UUID of the user from the Auth/Identity microservice"
    )
    feedback_rh_id = models.UUIDField(
        null=True,
        blank=True,
        db_index=True, 
        help_text="The UUID of the feedback from the Feedback microservice"
    )
    # feedback_manager_id = models.UUIDField(
    #     null=True,
    #     blank=True,
    #     db_index=True, 
    #     help_text="The UUID of the feedback from the Feedback microservice"
    # )
   
    
    # motif : str
    motif = models.CharField(max_length=255)
    
    # date 

    
    # montante : float (using Decimal for financial precision)
    montante = models.DecimalField(max_digits=10, decimal_places=2)
    
    # durée_de_remboursement
    duree_de_remboursement = models.Choices(
       IntegerChoices(
            (1, "1 mois"), 
            (2, "2 mois")
       )
    )
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"Avance {self.id} for User {self.user_id}"

    class Meta:
        verbose_name = "Avance"
        verbose_name_plural = "Avances"
        # Indexing user_id is crucial for performance in microservices
        indexes = [
            models.Index(fields=['user_id']),
            models.Index(fields=['feedback_rh_id']),
            models.Index(fields=['feedback_manager_id']),

        ]