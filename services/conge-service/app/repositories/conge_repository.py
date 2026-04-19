from app.models import Conge


class CongeRepository:
    def get_all(self):
        return list(Conge.objects.all().order_by("-created_at"))

    def get_by_id(self, conge_id):
        return Conge.objects.filter(id=conge_id).first()

    def get_all_by_user_id(self, user_id):
        return list(Conge.objects.filter(user_id=user_id).order_by("-created_at"))

    def create_conge(self, conge):
        conge.save()
        return conge

    def update_conge(self, conge, data):
        for field in ["type_dabsense", "start_date", "end_date", "motif", "user_id"]:
            if field in data:
                setattr(conge, field, data[field])
        conge.save()
        return conge

    def delete_conge(self, conge):
        conge.delete()

    def set_feedback_rh_id(self, conge, feedback_id):
        conge.feedback_rh_id = feedback_id
        conge.save(update_fields=["feedback_rh_id", "updated_at"])
        return conge

    def set_feedback_manager_id(self, conge, feedback_id):
        conge.feedback_manager_id = feedback_id
        conge.save(update_fields=["feedback_manager_id", "updated_at"])
        return conge

    def set_solde_id(self, conge, solde_id):
        conge.solde_id = solde_id
        conge.save(update_fields=["solde_id", "updated_at"])
        return conge
