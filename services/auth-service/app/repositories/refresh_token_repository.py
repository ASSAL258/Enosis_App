from datetime import datetime, timedelta, timezone
from uuid import uuid4

from app.models import RefreshToken


class RefreshTokenRepository:
    @staticmethod
    def create_for_user(*, user_id: int, ttl_days: int = 7) -> RefreshToken:
        expires_at = datetime.now(timezone.utc) + timedelta(days=ttl_days)
        return RefreshToken.objects.create(
            user_id=user_id,
            token=str(uuid4()),
            expires_at=expires_at,
        )
