from app.models import User


class UserRepository:
    @staticmethod
    def list_users(*, email: str | None = None) -> list[User]:
        queryset = User.objects.all().order_by("-created_at")
        if email:
            queryset = queryset.filter(email=email)
        return list(queryset)

    @staticmethod
    def get_user_by_id(user_id: str) -> User | None:
        return User.objects.filter(id=user_id).first()

    @staticmethod
    def create_user(**kwargs) -> User:
        return User.objects.create(**kwargs)
