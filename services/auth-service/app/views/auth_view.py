from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.viewsets import ViewSet
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema

from app.serializers import (
    AuthResponseSerializer,
    LoginSerializer,
    RegisterSerializer,
    RefreshTokenSerializer,
)
from app.services import AuthService


class AuthViewSet(ViewSet):
    """
    ViewSet for user authentication endpoints
    Provides login, register, and token refresh endpoints
    Returns JWT tokens with user info including role
    """

    @swagger_auto_schema(
        operation_summary="Register user",
        operation_description="Create a new user and return JWT tokens with user info.",
        request_body=RegisterSerializer,
        responses={
            201: AuthResponseSerializer,
            400: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    "detail": openapi.Schema(type=openapi.TYPE_STRING),
                },
            ),
        },
    )
    @action(detail=False, methods=["post"], url_path="register")
    def register(self, request):
        """
        Register a new user
        Returns access token, refresh token, and user info with role
        """
        try:
            serializer = RegisterSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            auth_data = AuthService.register_user(serializer.validated_data)
            response_serializer = AuthResponseSerializer(auth_data)

            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response(
                {"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"detail": f"Registration failed: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @swagger_auto_schema(
        operation_summary="Login user",
        operation_description="Authenticate with email/password and return JWT tokens.",
        request_body=LoginSerializer,
        responses={
            200: AuthResponseSerializer,
            401: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    "detail": openapi.Schema(type=openapi.TYPE_STRING),
                },
            ),
        },
    )
    @action(detail=False, methods=["post"], url_path="login")
    def login(self, request):
        """
        Login user with email and password
        Returns access token, refresh token, and user info with role
        """
        try:
            serializer = LoginSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            auth_data = AuthService.login(
                email=serializer.validated_data["email"],
                password=serializer.validated_data["password"],
            )
            response_serializer = AuthResponseSerializer(auth_data)

            return Response(response_serializer.data, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response(
                {"detail": str(e)}, status=status.HTTP_401_UNAUTHORIZED
            )
        except Exception as e:
            return Response(
                {"detail": f"Login failed: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @swagger_auto_schema(
        operation_summary="Refresh token",
        operation_description="Generate new tokens from a valid refresh token.",
        request_body=RefreshTokenSerializer,
        responses={
            200: AuthResponseSerializer,
            401: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    "detail": openapi.Schema(type=openapi.TYPE_STRING),
                },
            ),
        },
    )
    @action(detail=False, methods=["post"], url_path="refresh")
    def refresh(self, request):
        """
        Refresh access token using refresh token
        Returns new access token, refresh token, and user info
        """
        try:
            serializer = RefreshTokenSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            auth_data = AuthService.refresh_access_token(
                serializer.validated_data["refresh_token"]
            )
            response_serializer = AuthResponseSerializer(auth_data)

            return Response(response_serializer.data, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response(
                {"detail": str(e)}, status=status.HTTP_401_UNAUTHORIZED
            )
        except Exception as e:
            return Response(
                {"detail": f"Token refresh failed: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
