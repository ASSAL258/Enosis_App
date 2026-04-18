from uuid import uuid4

from app.repositories import RefreshTokenRepository


class AuthService:
    @staticmethod
    def login(*, user_id: int) -> dict:
        refresh = RefreshTokenRepository.create_for_user(user_id=user_id)
        return {
            "access_token": str(uuid4()),
            "refresh_token": refresh.token,
        }
