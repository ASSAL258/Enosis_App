from app.models import Solde


class SoldeRepository:
    def get_all(self):
        return list(Solde.objects.all().order_by("-created_at"))

    def get_by_id(self, solde_id):
        return Solde.objects.filter(id=solde_id).first()

    def create_solde(self, solde):
        solde.save()
        return solde

    def update_solde(self, solde, data):
        for field in ["conge_id", "solde_initial", "solde_accorde", "solde_restant"]:
            if field in data:
                setattr(solde, field, data[field])
        solde.save()
        return solde

    def delete_solde(self, solde):
        solde.delete()
