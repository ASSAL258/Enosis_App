from app.exceptions import PretNotFoundException, PretOperationException
from app.models import Pret
from app.repositories import PretRepository


class PretService:
    def __init__(self):
        self.pret_repository = PretRepository()

    def get_all_prets(self):
        return self.pret_repository.get_all()

    def get_pret_by_id(self, pret_id):
        pret = self.pret_repository.get_by_id(pret_id)
        if pret is None:
            raise PretNotFoundException("Pret not found")
        return pret

    def get_all_prets_by_user_id(self, user_id):
        return self.pret_repository.get_all_by_user_id(user_id)

    def create_pret(self, data):
        try:
            pret = Pret(
                user_id=data["user_id"],
                motif=data["motif"],
                fonction=data["fonction"],
                status=data.get("status", "pending"),
                duree=data["duree"],
                montant_demande=data["montant_demande"],
            )
            return self.pret_repository.create_pret(pret)
        except Exception as exc:
            raise PretOperationException("Failed to create pret") from exc

    def update_pret(self, pret_id, data):
        pret = self.get_pret_by_id(pret_id)
        try:
            return self.pret_repository.update_pret(pret, data)
        except Exception as exc:
            raise PretOperationException("Failed to update pret") from exc

    def delete_pret(self, pret_id):
        pret = self.get_pret_by_id(pret_id)
        try:
            self.pret_repository.delete_pret(pret)
        except Exception as exc:
            raise PretOperationException("Failed to delete pret") from exc

    def apply_feedback_created_event(self, pret_id, feedback_id, user_role):
        pret = self.get_pret_by_id(pret_id)
        role = user_role.strip().lower()
        if role == "manager":
            return self.pret_repository.set_feedback_manager_id(pret, feedback_id)
        if role in {"rh", "hr"}:
            return self.pret_repository.set_feedback_rh_id(pret, feedback_id)
        return pret
