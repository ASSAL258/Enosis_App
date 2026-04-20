import uuid
from django.db import models

class Attestation(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
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
    
    # status field
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    
    # date of creation
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Attestation {self.id} for User {self.user_id}"

    # CRUD Methods
    @classmethod
    def create(cls, user_id, type_demande, societe, motif, feedback_rh_id=None):
        """Create a new Attestation record"""
        attestation = cls(
            user_id=user_id,
            type_demande=type_demande,
            societe=societe,
            motif=motif,
            feedback_rh_id=feedback_rh_id
        )
        attestation.save()
        return attestation
    
    @classmethod
    def get_by_id(cls, attestation_id):
        """Retrieve an Attestation by ID"""
        try:
            return cls.objects.get(id=attestation_id)
        except cls.DoesNotExist:
            return None
    
    @classmethod
    def get_by_user_id(cls, user_id):
        """Retrieve all Attestations for a specific user"""
        return cls.objects.filter(user_id=user_id).order_by('-created_at')
    
    def update(self, **kwargs):
        """Update Attestation fields"""
        allowed_fields = ['motif', 'type_demande', 'societe', 'status', 'feedback_rh_id']
        for field, value in kwargs.items():
            if field in allowed_fields:
                setattr(self, field, value)
        self.save()
        return self
    
    def delete_attestation(self):
        """Delete the Attestation record"""
        self.delete()
    
    def update_status(self, new_status):
        """Update attestation status"""
        if new_status in dict(self.STATUS_CHOICES):
            self.status = new_status
            self.save()
            return True
        return False
    
    # Consumer method for feedback_rh publisher
    def consume_feedback_rh(self, feedback_data):
        """
        Consumer method to handle feedback_rh messages from publisher
        Update attestation based on feedback from RH
        """
        if feedback_data.get('feedback_rh_id'):
            self.feedback_rh_id = feedback_data['feedback_rh_id']
        
        if feedback_data.get('status'):
            self.update_status(feedback_data['status'])
        
        if feedback_data.get('motif'):
            self.motif = feedback_data['motif']
        
        self.save()
        return self

    class Meta:
        verbose_name = "Attestation"
        verbose_name_plural = "Attestations"
        indexes = [
            models.Index(fields=['user_id']),
            models.Index(fields=['feedback_rh_id']),
        ]
        ordering = ['-created_at']