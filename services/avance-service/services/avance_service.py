from repositories.avance_repository import AvanceRepository


class AvanceService:
    def __init__(self):
        self.avance_repository = AvanceRepository()

    def apply_feedback_created_event(self, *, feedback_id, user_role: str, avance_id):
        avance = self.avance_repository.get_by_id(avance_id=avance_id)
        if avance is None:
            return None

        role = user_role.strip().lower()
        if role == "manager":
            return self.avance_repository.set_feedback_manager(avance, feedback_id=feedback_id)
        if role in {"rh", "hr"}:
            return self.avance_repository.set_feedback_rh(avance, feedback_id=feedback_id)

        raise ValueError(f"Unsupported role: {user_role}")
