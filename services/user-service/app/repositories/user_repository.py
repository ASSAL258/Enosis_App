from app.models import User


class UserRepository:
    @staticmethod
    def list_users() -> list[User]:
        return list(User.objects.all().order_by("-created_at"))

    @staticmethod
    def create_user(**kwargs) -> User:
        return User.objects.create(**kwargs)
