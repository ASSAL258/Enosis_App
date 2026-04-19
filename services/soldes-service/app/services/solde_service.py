from app.exceptions import SoldeNotFoundException, SoldeOperationException
from app.models import Solde
from app.repositories import SoldeRepository
from app.services.solde_event_publisher import SoldeEventPublisher


class SoldeService:
    def __init__(self):
        self.solde_repository = SoldeRepository()
        self.solde_event_publisher = SoldeEventPublisher()

    def get_all_soldes(self):
        return self.solde_repository.get_all()

    def get_solde_by_id(self, solde_id):
        solde = self.solde_repository.get_by_id(solde_id)
        if solde is None:
            raise SoldeNotFoundException("Solde not found")
        return solde

    def create_solde(self, data):
        try:
            solde = Solde(
                conge_id=data["conge_id"],
                solde_initial=data["solde_initial"],
                solde_accorde=data.get("solde_accorde", 0),
                solde_restant=data["solde_restant"],
            )
            solde = self.solde_repository.create_solde(solde)
            self.solde_event_publisher.publish_solde_created(solde_id=solde.id, conge_id=solde.conge_id)
            return solde
        except Exception as exc:
            raise SoldeOperationException("Failed to create solde") from exc

    def update_solde(self, solde_id, data):
        solde = self.get_solde_by_id(solde_id)
        try:
            return self.solde_repository.update_solde(solde, data)
        except Exception as exc:
            raise SoldeOperationException("Failed to update solde") from exc

    def delete_solde(self, solde_id):
        solde = self.get_solde_by_id(solde_id)
        try:
            self.solde_repository.delete_solde(solde)
        except Exception as exc:
            raise SoldeOperationException("Failed to delete solde") from exc
