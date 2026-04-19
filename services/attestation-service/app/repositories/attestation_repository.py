from models.attestation import Attestation


class AttestationRepository:
    def get_by_id(self, *, attestation_id):
        return Attestation.objects.filter(id=attestation_id).first()

    def set_feedback_manager(self, attestation: Attestation, *, feedback_id):
        attestation.feedback_manager_id = feedback_id
        attestation.save(update_fields=["feedback_manager_id"])
        return attestation

    def set_feedback_rh(self, attestation: Attestation, *, feedback_id):
        attestation.feedback_rh_id = feedback_id
        attestation.save(update_fields=["feedback_rh_id"])
        return attestation
    def create_attestation(self, attestation: Attestation):
        attestation.save()
        return attestation
