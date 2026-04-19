from rest_framework import status
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from app.exceptions import SoldeNotFoundException, SoldeOperationException
from app.serializers import SoldeCreateSerializer, SoldeSerializer, SoldeUpdateSerializer
from app.services.solde_service import SoldeService


class SoldeViewSet(ViewSet):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.solde_service = SoldeService()

    def list(self, _request):
        try:
            soldes = self.solde_service.get_all_soldes()
            return Response(SoldeSerializer(soldes, many=True).data)
        except SoldeOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, _request, pk=None):
        try:
            solde = self.solde_service.get_solde_by_id(pk)
            return Response(SoldeSerializer(solde).data)
        except SoldeNotFoundException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except SoldeOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    def create(self, request):
        try:
            serializer = SoldeCreateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            solde = self.solde_service.create_solde(serializer.validated_data)
            return Response(SoldeSerializer(solde).data, status=status.HTTP_201_CREATED)
        except SoldeOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        try:
            serializer = SoldeUpdateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            solde = self.solde_service.update_solde(pk, serializer.validated_data)
            return Response(SoldeSerializer(solde).data)
        except SoldeNotFoundException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except SoldeOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, _request, pk=None):
        try:
            self.solde_service.delete_solde(pk)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except SoldeNotFoundException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except SoldeOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
