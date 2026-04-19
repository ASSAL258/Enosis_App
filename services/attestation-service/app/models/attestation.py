import uuid
from django.db import models

class Attestation(models.Model):
    # Primary Key for the Attestation record
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

    # type_demande
    type_demande = models.IntegerField(
    choices=[
        (1, 'Attestation de Travail'),
        (2, 'Attestation de Salaire'),
        (3, 'Attestation domiciliation de salaire')
    ]
)

    # societe
    societe = models.IntegerField(
       choices=[
            (1, 'AMA Papillon'),
            (2, 'AMA Detergent'),
            (3, 'Sulfonation'),
            (4, 'FMCG Maroc')
       ]
    )  
   #date of creation
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"Attestation {self.id} for User {self.user_id}"

    class Meta:
        verbose_name = "Attestation"
        verbose_name_plural = "Attestations"
        # Indexing user_id is crucial for performance in microservices
        indexes = [
            models.Index(fields=['user_id']),
            models.Index(fields=['feedback_rh_id']),
            #models.Index(fields=['feedback_manager_id']),

        ]