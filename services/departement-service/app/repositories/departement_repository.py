from app.models import Departement


class DepartementRepository:
    @staticmethod
    def list_departements() -> list:
        return list(Departement.objects.all().order_by("name"))

    @staticmethod
    def get_departement(departement_id: str) -> Departement:
        return Departement.objects.get(id=departement_id)

    @staticmethod
    def create_departement(name: str, description: str = None) -> Departement:
        return Departement.objects.create(name=name, description=description)

    @staticmethod
    def update_departement(departement_id: str, **kwargs) -> Departement:
        departement = Departement.objects.get(id=departement_id)
        for key, value in kwargs.items():
            setattr(departement, key, value)
        departement.save()
        return departement

    @staticmethod
    def delete_departement(departement_id: str) -> None:
        Departement.objects.get(id=departement_id).delete()
