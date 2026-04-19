from app.repositories.attestation_repository import AttestationRepository
from app.models.attestation import Attestation


class AttestationService:
    def __init__(self):
        self.attestation_repository = AttestationRepository()

    def apply_feedback_created_event(self, *, feedback_id, user_role: str, attestation_id):
        attestation = self.attestation_repository.get_by_id(attestation_id=attestation_id)
        if attestation is None:
            return None

        role = user_role.strip().lower()
        if role == "manager":
            return self.attestation_repository.set_feedback_manager(attestation, feedback_id=feedback_id)
        if role in {"rh", "hr"}:
            return self.attestation_repository.set_feedback_rh(attestation, feedback_id=feedback_id)

        raise ValueError(f"Unsupported role: {user_role}")

    def create_attestation(self, data):
        attestation = Attestation(
            type_demande=data["type_demande"],
            societe=data["societe"],
            motif=data["motif"],
        )
        attestation_saved = self.attestation_repository.create_attestation(attestation)
        return attestation_saved

    def get_attestation(self, attestation_id):
        return self.attestation_repository.get_by_id(attestation_id=attestation_id)

    def update_attestation(self, attestation, data):
        for key, value in data.items():
            if value is not None:
                setattr(attestation, key, value)
        return self.attestation_repository.update_attestation(attestation)

    def delete_attestation(self, attestation_id):
        return self.attestation_repository.delete_attestation(attestation_id=attestation_id)

    def list_attestations(self, user_id=None):
        if user_id:
            return self.attestation_repository.get_by_user_id(user_id=user_id)
        return self.attestation_repository.list_all()