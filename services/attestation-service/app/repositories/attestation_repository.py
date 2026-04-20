from app.models.attestation import Attestation


class AttestationRepository:
    """Repository for Attestation model operations"""

    @staticmethod
    def get_by_id(attestation_id):
        """Get attestation by ID"""
        try:
            return Attestation.objects.get(id=attestation_id)
        except Attestation.DoesNotExist:
            return None

    @staticmethod
    def get_by_user_id(user_id):
        """Get all attestations for a specific user"""
        return Attestation.objects.filter(user_id=user_id).order_by('-created_at')

    @staticmethod
    def create_attestation(user_id, type_demande, societe, motif, feedback_rh_id=None):
        """Create a new attestation"""
        attestation = Attestation(
            user_id=user_id,
            type_demande=type_demande,
            societe=societe,
            motif=motif,
            feedback_rh_id=feedback_rh_id
        )
        attestation.save()
        return attestation

    @staticmethod
    def update_attestation(attestation, **kwargs):
        """Update attestation fields"""
        allowed_fields = ['motif', 'type_demande', 'societe', 'status', 'feedback_rh_id']
        for field, value in kwargs.items():
            if field in allowed_fields and value is not None:
                setattr(attestation, field, value)
        attestation.save()
        return attestation

    @staticmethod
    def delete_attestation(attestation_id):
        """Delete an attestation"""
        try:
            attestation = Attestation.objects.get(id=attestation_id)
            attestation.delete()
            return True
        except Attestation.DoesNotExist:
            return False

    @staticmethod
    def list_all():
        """Get all attestations"""
        return Attestation.objects.all().order_by('-created_at')

    @staticmethod
    def set_feedback_rh(attestation, feedback_id):
        """Update feedback_rh_id"""
        attestation.feedback_rh_id = feedback_id
        attestation.save(update_fields=['feedback_rh_id'])
        return attestation

    @staticmethod
    def update_status(attestation, new_status):
        """Update attestation status"""
        attestation.status = new_status
        attestation.save(update_fields=['status'])
        return attestation

