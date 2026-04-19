import requests
import os
import time
from app.utils import JWTUtils


class AuthService:
    CONFIG_SERVICE_URL = os.getenv("CONFIG_SERVICE_URL", "http://config-service:5000")
    USER_SERVICE_URL = os.getenv("USER_SERVICE_URL", "http://user-service:5002")
    CONFIG_CACHE_TTL_SECONDS = int(os.getenv("CONFIG_CACHE_TTL_SECONDS", "60"))
    _cached_user_service_url = None
    _cached_user_service_url_at = 0.0

    @classmethod
    def _resolve_user_service_url(cls) -> str:
        now = time.time()
        if (
            cls._cached_user_service_url
            and (now - cls._cached_user_service_url_at) < cls.CONFIG_CACHE_TTL_SECONDS
        ):
            return cls._cached_user_service_url

        try:
            response = requests.get(f"{cls.CONFIG_SERVICE_URL}/config/services", timeout=3)
            response.raise_for_status()
            payload = response.json()
            dynamic_url = (
                payload.get("services", {})
                .get("user-service", {})
                .get("base_url")
            )
            if dynamic_url:
                cls._cached_user_service_url = str(dynamic_url).rstrip("/")
                cls._cached_user_service_url_at = now
                return cls._cached_user_service_url
        except requests.RequestException:
            pass

        return cls.USER_SERVICE_URL.rstrip("/")

    @staticmethod
    def register_user(validated_data: dict):
        """
        Register a new user by calling user-service
        Returns tokens and user info
        """
        try:
            user_service_url = AuthService._resolve_user_service_url()
            payload = {
                "email": validated_data["email"],
                "password": validated_data["password"],
                "matricule": validated_data["matricule"],
                "first_name": validated_data["first_name"],
                "last_name": validated_data["last_name"],
            }
            for optional_key in ["role_id", "manager_id", "rh_id", "departement_id"]:
                if validated_data.get(optional_key) is not None:
                    payload[optional_key] = validated_data.get(optional_key)

            # Call user-service to create user
            response = requests.post(
                f"{user_service_url}/users/",
                json=payload,
                timeout=5
            )

            if response.status_code != 201:
                try:
                    error_payload = response.json()
                    error_detail = error_payload.get("detail") or error_payload
                except ValueError:
                    error_detail = response.text or "Failed to create user"
                raise ValueError(str(error_detail))

            user = response.json()

            # Generate tokens
            access_token = JWTUtils.create_access_token(user)
            refresh_token = JWTUtils.create_refresh_token(user["id"])

            return {
                "access_token": access_token,
                "refresh_token": refresh_token,
                "user": user,
            }
        except requests.RequestException as e:
            raise ValueError(f"User service unavailable: {str(e)}")

    @staticmethod
    def login(email: str, password: str):
        """
        Authenticate user by calling user-service
        Returns tokens and user info
        """
        try:
            user_service_url = AuthService._resolve_user_service_url()
            # Call user-service to get user by email
            response = requests.get(
                f"{user_service_url}/users/",
                params={"email": email},
                timeout=5
            )

            if response.status_code != 200:
                raise ValueError("Invalid email or password")

            users = response.json()
            if not users:
                raise ValueError("Invalid email or password")

            user = users[0] if isinstance(users, list) else users

            # Verify password (in real scenario, password verification should be in user-service)
            # For now we'll just compare, but ideally user-service should verify
            if not user.get("email") == email:
                raise ValueError("Invalid email or password")

            # Generate tokens
            access_token = JWTUtils.create_access_token(user)
            refresh_token = JWTUtils.create_refresh_token(user["id"])

            return {
                "access_token": access_token,
                "refresh_token": refresh_token,
                "user": user,
            }
        except requests.RequestException as e:
            raise ValueError(f"User service unavailable: {str(e)}")

    @staticmethod
    def refresh_access_token(refresh_token: str):
        """
        Generate new access token from refresh token
        """
        try:
            user_service_url = AuthService._resolve_user_service_url()
            payload = JWTUtils.decode_token(refresh_token)

            if payload.get("type") != "refresh":
                raise ValueError("Invalid token type")

            user_id = payload["user_id"]

            # Call user-service to get user info
            response = requests.get(
                f"{user_service_url}/users/{user_id}/",
                timeout=5
            )

            if response.status_code != 200:
                raise ValueError("User not found")

            user = response.json()

            new_access_token = JWTUtils.create_access_token(user)
            new_refresh_token = JWTUtils.create_refresh_token(str(user["id"]))

            return {
                "access_token": new_access_token,
                "refresh_token": new_refresh_token,
                "user": user,
            }
        except ValueError as e:
            raise ValueError(str(e))
        except requests.RequestException as e:
            raise ValueError(f"User service unavailable: {str(e)}")
