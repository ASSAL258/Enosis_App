from app.repositories import RoleRepository


class RoleService:
    @staticmethod
    def list_roles():
        return RoleRepository.list_roles()

    @staticmethod
    def create_role(validated_data: dict):
        return RoleRepository.create_role(
            name=validated_data["name"],
            code=validated_data["code"],
            description=validated_data.get("description", ""),
        )
