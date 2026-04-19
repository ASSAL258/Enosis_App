from app.models import Pret


class PretRepository:
    def get_all(self):
        return list(Pret.objects.all().order_by("-created_at"))

    def get_by_id(self, pret_id):
        return Pret.objects.filter(id=pret_id).first()

    def get_all_by_user_id(self, user_id):
        return list(Pret.objects.filter(user_id=user_id).order_by("-created_at"))

    def create_pret(self, pret):
        pret.save()
        return pret

    def update_pret(self, pret, data):
        for field in ["user_id", "motif", "fonction", "status", "duree", "montant_demande"]:
            if field in data:
                setattr(pret, field, data[field])
        pret.save()
        return pret

    def delete_pret(self, pret):
        pret.delete()

    def set_feedback_manager_id(self, pret, feedback_id):
        pret.feedback_manager_id = feedback_id
        pret.save(update_fields=["feedback_manager_id", "updated_at"])
        return pret

    def set_feedback_rh_id(self, pret, feedback_id):
        pret.feedback_rh_id = feedback_id
        pret.save(update_fields=["feedback_rh_id", "updated_at"])
        return pret
