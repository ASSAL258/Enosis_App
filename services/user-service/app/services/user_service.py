from django.contrib.auth.hashers import make_password

from app.repositories import UserRepository


class UserService:
    @staticmethod
    def list_users():
        return UserRepository.list_users()

    @staticmethod
    def create_user(validated_data: dict):
        user_data = dict(validated_data)
        user_data["password"] = make_password(validated_data["password"])
        return UserRepository.create_user(**user_data)
