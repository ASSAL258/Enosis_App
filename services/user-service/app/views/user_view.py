from rest_framework import status
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from app.exceptions import UserOperationException
from app.serializers import UserCreateSerializer, UserSerializer
from app.services import UserService


class UserViewSet(ViewSet):
    def list(self, _request):
        try:
            users = UserService.list_users()
            return Response(UserSerializer(users, many=True).data)
        except UserOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    def create(self, request):
        try:
            serializer = UserCreateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = UserService.create_user(serializer.validated_data)
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        except UserOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
