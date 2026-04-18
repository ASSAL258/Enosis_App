from app.models import Departement


class DepartementRepository:
    @staticmethod
    def list_departements() -> list[Departement]:
        return list(Departement.objects.all().order_by("name"))

    @staticmethod
    def create_departement(*, name: str, code: str) -> Departement:
        return Departement.objects.create(name=name, code=code)
