from app.models import Avance
from app.exceptions import AvanceNotFoundException, AvanceOperationException
from app.repositories import AvanceRepository


class AvanceService:
    def __init__(self):
        self.avance_repository = AvanceRepository()

    def apply_feedback_created_event(self, *, feedback_id, user_role: str, avance_id):
        avance = self.avance_repository.get_by_id(avance_id=avance_id)
        if avance is None:
            return None

        role = (user_role or "").strip().lower()
        if role == "manager":
            return avance
        if role in {"rh", "hr"}:
            return self.avance_repository.set_feedback_rh(avance, feedback_id=feedback_id)

        raise ValueError(f"Unsupported role: {user_role}")

    def create_avance(self, data):
        try:
            avance = Avance(
                motif=data["motif"],
                montante=data["montante"],
                duree_de_remboursement=data["duree_de_remboursement"],
                user_id=data["user_id"],
            )
            return self.avance_repository.create_avance(avance)
        except Exception as exc:
            raise AvanceOperationException("Failed to create avance") from exc

    def get_avance(self, *, avance_id):
        avance = self.avance_repository.get_by_id(avance_id=avance_id)
        if avance is None:
            raise AvanceNotFoundException("Avance not found")
        return avance

    def update_avance(self, avance: Avance, data):
        try:
            for field in ["motif", "montante", "duree_de_remboursement"]:
                if field in data:
                    setattr(avance, field, data[field])
            avance.save()
            return avance
        except Exception as exc:
            raise AvanceOperationException("Failed to update avance") from exc
