from app.models import Role


class RoleRepository:
    @staticmethod
    def list_roles() -> list[Role]:
        return list(Role.objects.all().order_by("name"))

    @staticmethod
    def create_role(*, name: str, code: str, description: str = "") -> Role:
        return Role.objects.create(name=name, code=code, description=description)
