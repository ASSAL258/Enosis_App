from app.repositories import DepartementRepository


class DepartementService:
    @staticmethod
    def list_departements():
        return DepartementRepository.list_departements()

    @staticmethod
    def create_departement(validated_data: dict):
        return DepartementRepository.create_departement(
            name=validated_data["name"],
            code=validated_data["code"],
        )
