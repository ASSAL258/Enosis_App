from rest_framework import status
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from app.exceptions import DepartementOperationException
from app.serializers import DepartementSerializer, DepartementCreateSerializer
from app.services import DepartementService


class DepartementViewSet(ViewSet):
    def list(self, request):
        try:
            departements = DepartementService.list_departements()
            return Response(DepartementSerializer(departements, many=True).data)
        except DepartementOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    def create(self, request):
        try:
            serializer = DepartementCreateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            departement = DepartementService.create_departement(serializer.validated_data)
            return Response(DepartementSerializer(departement).data, status=status.HTTP_201_CREATED)
        except DepartementOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, pk=None):
        try:
            departement = DepartementService.get_departement(pk)
            return Response(DepartementSerializer(departement).data)
        except DepartementOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        try:
            serializer = DepartementCreateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            departement = DepartementService.update_departement(pk, serializer.validated_data)
            return Response(DepartementSerializer(departement).data)
        except DepartementOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        try:
            DepartementService.delete_departement(pk)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except DepartementOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
