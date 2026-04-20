from app.repositories.attestation_repository import AttestationRepository
from app.models.attestation import Attestation


class AttestationService:
    """Service layer for Attestation business logic"""

    def __init__(self):
        self.repository = AttestationRepository()

    def create_attestation(self, data):
        """Create a new attestation"""
        return self.repository.create_attestation(
            user_id=data.get('user_id'),
            type_demande=data.get('type_demande'),
            societe=data.get('societe'),
            motif=data.get('motif'),
            feedback_rh_id=data.get('feedback_rh_id')
        )

    def get_attestation(self, attestation_id):
        """Get attestation by ID"""
        return self.repository.get_by_id(attestation_id)

    def get_user_attestations(self, user_id):
        """Get all attestations for a user"""
        return self.repository.get_by_user_id(user_id)

    def update_attestation(self, attestation_id, data):
        """Update an attestation"""
        attestation = self.repository.get_by_id(attestation_id)
        if not attestation:
            return None
        return self.repository.update_attestation(attestation, **data)

    def delete_attestation(self, attestation_id):
        """Delete an attestation"""
        return self.repository.delete_attestation(attestation_id)

    def list_attestations(self):
        """Get all attestations"""
        return self.repository.list_all()

    def update_status(self, attestation_id, new_status):
        """Update attestation status"""
        attestation = self.repository.get_by_id(attestation_id)
        if not attestation:
            return None
        if new_status not in dict(attestation.STATUS_CHOICES):
            return None
        return self.repository.update_status(attestation, new_status)

    def consume_feedback_rh(self, attestation_id, feedback_data):
        """
        Consumer method to handle feedback_rh messages from publisher
        Update attestation based on feedback from RH
        """
        attestation = self.repository.get_by_id(attestation_id)
        if not attestation:
            return None

        # Update feedback_rh_id if provided
        if feedback_data.get('feedback_rh_id'):
            attestation = self.repository.set_feedback_rh(
                attestation, 
                feedback_data['feedback_rh_id']
            )

        # Update status if provided
        if feedback_data.get('status'):
            attestation = self.repository.update_status(
                attestation,
                feedback_data['status']
            )

        # Update motif if provided
        if feedback_data.get('motif'):
            attestation = self.repository.update_attestation(
                attestation,
                motif=feedback_data['motif']
            )

        return attestation
