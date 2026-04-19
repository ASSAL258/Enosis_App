from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from app.exceptions import CongeNotFoundException, CongeOperationException
from app.serializers import CongeCreateSerializer, CongeSerializer, CongeUpdateSerializer
from app.services.conge_service import CongeService


class CongeViewSet(ViewSet):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.conge_service = CongeService()

    def list(self, _request):
        try:
            conges = self.conge_service.get_all_conges()
            return Response(CongeSerializer(conges, many=True).data)
        except CongeOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, _request, pk=None):
        try:
            conge = self.conge_service.get_conge_by_id(pk)
            return Response(CongeSerializer(conge).data)
        except CongeNotFoundException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except CongeOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["get"], url_path=r"user/(?P<user_id>[^/.]+)")
    def get_all_by_user_id(self, _request, user_id=None):
        try:
            conges = self.conge_service.get_all_conges_by_user_id(user_id)
            return Response(CongeSerializer(conges, many=True).data)
        except CongeOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    def create(self, request):
        try:
            serializer = CongeCreateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            conge = self.conge_service.create_conge(serializer.validated_data)
            return Response(CongeSerializer(conge).data, status=status.HTTP_201_CREATED)
        except CongeOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        try:
            serializer = CongeUpdateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            conge = self.conge_service.update_conge(pk, serializer.validated_data)
            return Response(CongeSerializer(conge).data)
        except CongeNotFoundException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except CongeOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, _request, pk=None):
        try:
            self.conge_service.delete_conge(pk)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except CongeNotFoundException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except CongeOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
