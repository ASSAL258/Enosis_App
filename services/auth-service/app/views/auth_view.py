from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.viewsets import ViewSet

from app.exceptions import AuthOperationException
from app.serializers import LoginSerializer, TokenSerializer
from app.services import AuthService


class AuthViewSet(ViewSet):
    @action(detail=False, methods=["post"], url_path="login")
    def login(self, request):
        try:
            serializer = LoginSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            tokens = AuthService.login(user_id=serializer.validated_data["user_id"])
            return Response(TokenSerializer(tokens).data)
        except AuthOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
