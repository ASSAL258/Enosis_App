from app.repositories import UserRepository


class UserService:
    @staticmethod
    def list_users():
        return UserRepository.list_users()

    @staticmethod
    def create_user(validated_data: dict):
        return UserRepository.create_user(
            email=validated_data["email"],
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
        )
