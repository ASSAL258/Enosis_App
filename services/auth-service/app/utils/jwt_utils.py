import jwt
import os
from datetime import datetime, timedelta
from typing import Dict, Any


class JWTUtils:
    SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 60
    REFRESH_TOKEN_EXPIRE_DAYS = 7

    @classmethod
    def create_access_token(cls, user_data: Dict[str, Any]) -> str:
        """
        Create JWT access token with user information and role
        """
        payload = {
            "user_id": str(user_data.get("id")),
            "email": user_data.get("email"),
            "matricule": user_data.get("matricule"),
            "first_name": user_data.get("first_name"),
            "last_name": user_data.get("last_name"),
            "role_id": str(user_data.get("role_id")) if user_data.get("role_id") else None,
            "departement_id": str(user_data.get("departement_id")) if user_data.get("departement_id") else None,
            "exp": datetime.utcnow() + timedelta(minutes=cls.ACCESS_TOKEN_EXPIRE_MINUTES),
            "iat": datetime.utcnow(),
            "type": "access"
        }
        return jwt.encode(payload, cls.SECRET_KEY, algorithm=cls.ALGORITHM)

    @classmethod
    def create_refresh_token(cls, user_id: str) -> str:
        """
        Create JWT refresh token
        """
        payload = {
            "user_id": str(user_id),
            "exp": datetime.utcnow() + timedelta(days=cls.REFRESH_TOKEN_EXPIRE_DAYS),
            "iat": datetime.utcnow(),
            "type": "refresh"
        }
        return jwt.encode(payload, cls.SECRET_KEY, algorithm=cls.ALGORITHM)

    @classmethod
    def decode_token(cls, token: str) -> Dict[str, Any]:
        """
        Decode JWT token
        """
        try:
            payload = jwt.decode(token, cls.SECRET_KEY, algorithms=[cls.ALGORITHM])
            return payload
        except jwt.ExpiredSignatureError:
            raise ValueError("Token has expired")
        except jwt.InvalidTokenError:
            raise ValueError("Invalid token")

    @classmethod
    def verify_token(cls, token: str) -> bool:
        """
        Verify if token is valid
        """
        try:
            jwt.decode(token, cls.SECRET_KEY, algorithms=[cls.ALGORITHM])
            return True
        except jwt.InvalidTokenError:
            return False
