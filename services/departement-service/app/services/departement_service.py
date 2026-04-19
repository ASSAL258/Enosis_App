from app.repositories import DepartementRepository


class DepartementService:
    @staticmethod
    def list_departements():
        return DepartementRepository.list_departements()

    @staticmethod
    def get_departement(departement_id: str):
        return DepartementRepository.get_departement(departement_id)

    @staticmethod
    def create_departement(validated_data: dict):
        return DepartementRepository.create_departement(**validated_data)

    @staticmethod
    def update_departement(departement_id: str, validated_data: dict):
        return DepartementRepository.update_departement(departement_id, **validated_data)

    @staticmethod
    def delete_departement(departement_id: str):
        DepartementRepository.delete_departement(departement_id)
