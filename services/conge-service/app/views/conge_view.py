from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from app.exceptions import CongeNotFoundException, CongeOperationException
from app.serializers import (
    CongeAttachmentUploadSerializer,
    CongeCreateSerializer,
    CongeSerializer,
    CongeUpdateSerializer,
)
from app.services.conge_attachment_service import CongeAttachmentService
from app.services.conge_service import CongeService


class CongeViewSet(ViewSet):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.conge_service = CongeService()
        self.conge_attachment_service = CongeAttachmentService()

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

    @swagger_auto_schema(
        method="post",
        operation_summary="Upload conge attachment",
        operation_description="Stores attachment content in MongoDB and links the generated UUID to the conge.",
        request_body=CongeAttachmentUploadSerializer,
        responses={
            201: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    "attachment_url": openapi.Schema(type=openapi.TYPE_STRING),
                },
            ),
            404: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={"detail": openapi.Schema(type=openapi.TYPE_STRING)},
            ),
        },
    )
    @swagger_auto_schema(
        method="get",
        operation_summary="Get conge attachment",
        operation_description="Returns attachment metadata and content saved in MongoDB for the conge.",
        responses={
            200: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    "attachment_url": openapi.Schema(type=openapi.TYPE_STRING),
                    "file_name": openapi.Schema(type=openapi.TYPE_STRING),
                    "content_type": openapi.Schema(type=openapi.TYPE_STRING),
                    "content_base64": openapi.Schema(type=openapi.TYPE_STRING),
                },
            ),
            404: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={"detail": openapi.Schema(type=openapi.TYPE_STRING)},
            ),
        },
    )
    @action(detail=True, methods=["get", "post"], url_path="attachment")
    def attachment(self, request, pk=None):
        try:
            if request.method == "POST":
                serializer = CongeAttachmentUploadSerializer(data=request.data)
                serializer.is_valid(raise_exception=True)
                attachment_url = self.conge_attachment_service.upload_attachment(
                    conge_id=pk,
                    file_name=serializer.validated_data["file_name"],
                    content_type=serializer.validated_data["content_type"],
                    content_base64=serializer.validated_data["content_base64"],
                )
                return Response({"attachment_url": str(attachment_url)}, status=status.HTTP_201_CREATED)

            attachment = self.conge_attachment_service.get_attachment(pk)
            return Response(attachment)
        except CongeNotFoundException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except CongeOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
