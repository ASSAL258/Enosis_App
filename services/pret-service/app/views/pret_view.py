from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from app.exceptions import PretNotFoundException, PretOperationException
from app.serializers import PretCreateSerializer, PretSerializer, PretUpdateSerializer
from app.services.pret_service import PretService


class PretViewSet(ViewSet):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.pret_service = PretService()

    def list(self, _request):
        try:
            prets = self.pret_service.get_all_prets()
            return Response(PretSerializer(prets, many=True).data)
        except PretOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, _request, pk=None):
        try:
            pret = self.pret_service.get_pret_by_id(pk)
            return Response(PretSerializer(pret).data)
        except PretNotFoundException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except PretOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["get"], url_path=r"user/(?P<user_id>[^/.]+)")
    def get_all_by_user_id(self, _request, user_id=None):
        try:
            prets = self.pret_service.get_all_prets_by_user_id(user_id)
            return Response(PretSerializer(prets, many=True).data)
        except PretOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    def create(self, request):
        try:
            serializer = PretCreateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            pret = self.pret_service.create_pret(serializer.validated_data)
            return Response(PretSerializer(pret).data, status=status.HTTP_201_CREATED)
        except PretOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        try:
            serializer = PretUpdateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            pret = self.pret_service.update_pret(pk, serializer.validated_data)
            return Response(PretSerializer(pret).data)
        except PretNotFoundException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except PretOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, _request, pk=None):
        try:
            self.pret_service.delete_pret(pk)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except PretNotFoundException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except PretOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
