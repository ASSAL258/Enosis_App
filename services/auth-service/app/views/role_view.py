from rest_framework import status
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from app.exceptions import RoleOperationException
from app.serializers import RoleCreateSerializer, RoleSerializer
from app.services import RoleService


class RoleViewSet(ViewSet):
    def list(self, _request):
        try:
            roles = RoleService.list_roles()
            return Response(RoleSerializer(roles, many=True).data)
        except RoleOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    def create(self, request):
        try:
            serializer = RoleCreateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            role = RoleService.create_role(serializer.validated_data)
            return Response(RoleSerializer(role).data, status=status.HTTP_201_CREATED)
        except RoleOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
