from django.contrib.auth.hashers import make_password

from app.repositories import UserRepository


class UserService:
    @staticmethod
    def list_users(*, email: str | None = None):
        return UserRepository.list_users(email=email)

    @staticmethod
    def get_user_by_id(user_id: str):
        return UserRepository.get_user_by_id(user_id)

    @staticmethod
    def create_user(validated_data: dict):
        user_data = dict(validated_data)
        user_data["password"] = make_password(validated_data["password"])
        return UserRepository.create_user(**user_data)
