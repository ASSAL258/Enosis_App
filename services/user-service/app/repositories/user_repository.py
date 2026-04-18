from app.models import User


class UserRepository:
    @staticmethod
    def list_users() -> list[User]:
        return list(User.objects.all().order_by("-created_at"))

    @staticmethod
    def create_user(*, email: str, first_name: str, last_name: str) -> User:
        return User.objects.create(email=email, first_name=first_name, last_name=last_name)
