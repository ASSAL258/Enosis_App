from app.exceptions import CongeNotFoundException, CongeOperationException
from app.models import Conge
from app.repositories import CongeRepository


class CongeService:
    def __init__(self):
        self.conge_repository = CongeRepository()

    def get_all_conges(self):
        return self.conge_repository.get_all()

    def get_conge_by_id(self, conge_id):
        conge = self.conge_repository.get_by_id(conge_id)
        if conge is None:
            raise CongeNotFoundException("Conge not found")
        return conge

    def get_all_conges_by_user_id(self, user_id):
        return self.conge_repository.get_all_by_user_id(user_id)

    def create_conge(self, data):
        try:
            conge = Conge(
                user_id=data["user_id"],
                type_dabsense=data["type_dabsense"],
                start_date=data["start_date"],
                end_date=data["end_date"],
                motif=data["motif"],
                attachment_url=data.get("attachment_url"),
            )
            return self.conge_repository.create_conge(conge)
        except Exception as exc:
            raise CongeOperationException("Failed to create conge") from exc

    def update_conge(self, conge_id, data):
        conge = self.get_conge_by_id(conge_id)
        try:
            return self.conge_repository.update_conge(conge, data)
        except Exception as exc:
            raise CongeOperationException("Failed to update conge") from exc

    def delete_conge(self, conge_id):
        conge = self.get_conge_by_id(conge_id)
        try:
            self.conge_repository.delete_conge(conge)
        except Exception as exc:
            raise CongeOperationException("Failed to delete conge") from exc

    def apply_feedback_created_event(self, conge_id, feedback_id, user_role):
        conge = self.get_conge_by_id(conge_id)
        role = user_role.strip().lower()
        if role == "manager":
            return self.conge_repository.set_feedback_manager_id(conge, feedback_id)
        if role in {"rh", "hr"}:
            return self.conge_repository.set_feedback_rh_id(conge, feedback_id)
        return conge

    def apply_solde_created_event(self, conge_id, solde_id):
        conge = self.get_conge_by_id(conge_id)
        return self.conge_repository.set_solde_id(conge, solde_id)
