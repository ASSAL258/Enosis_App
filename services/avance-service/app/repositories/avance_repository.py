from app.models import Avance


class AvanceRepository:
    def get_by_id(self, *, avance_id):
        return Avance.objects.filter(id=avance_id).first()

    def set_feedback_rh(self, avance: Avance, *, feedback_id):
        avance.feedback_rh_id = feedback_id
        avance.save(update_fields=["feedback_rh_id"])
        return avance

    def create_avance(self, avance: Avance):
        avance.save()
        return avance
