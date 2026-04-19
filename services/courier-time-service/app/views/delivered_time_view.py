from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from app.exceptions import CourierTimeOperationException, DeliveredTimeNotFoundException
from app.serializers import (
    DeliveredTimeCreateSerializer,
    DeliveredTimeImageUploadSerializer,
    DeliveredTimeSerializer,
)
from app.services.delivered_time_image_service import DeliveredTimeImageService
from app.services import DeliveredTimeService


class DeliveredTimeViewSet(ViewSet):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.delivered_time_service = DeliveredTimeService()
        self.delivered_time_image_service = DeliveredTimeImageService()

    def retrieve(self, _request, pk=None):
        try:
            delivered_time = self.delivered_time_service.get_delivered_time_by_id(pk)
            return Response(DeliveredTimeSerializer(delivered_time).data)
        except DeliveredTimeNotFoundException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except CourierTimeOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    def create(self, request):
        try:
            serializer = DeliveredTimeCreateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            delivered_time = self.delivered_time_service.create_delivered_time(serializer.validated_data)
            return Response(DeliveredTimeSerializer(delivered_time).data, status=status.HTTP_201_CREATED)
        except CourierTimeOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        method="post",
        operation_summary="Upload delivered-time image",
        operation_description="Stores image content in MongoDB and links the generated UUID to the delivered time.",
        request_body=DeliveredTimeImageUploadSerializer,
        responses={
            201: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    "image_id": openapi.Schema(type=openapi.TYPE_STRING),
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
        operation_summary="Get delivered-time image",
        operation_description="Returns image metadata and content saved in MongoDB for the delivered time.",
        responses={
            200: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    "image_id": openapi.Schema(type=openapi.TYPE_STRING),
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
    @action(detail=True, methods=["get", "post"], url_path="image")
    def image(self, request, pk=None):
        try:
            if request.method == "POST":
                serializer = DeliveredTimeImageUploadSerializer(data=request.data)
                serializer.is_valid(raise_exception=True)
                image_id = self.delivered_time_image_service.upload_image(
                    delivered_time_id=pk,
                    file_name=serializer.validated_data["file_name"],
                    content_type=serializer.validated_data["content_type"],
                    content_base64=serializer.validated_data["content_base64"],
                )
                return Response({"image_id": str(image_id)}, status=status.HTTP_201_CREATED)

            image = self.delivered_time_image_service.get_image(pk)
            return Response(image)
        except DeliveredTimeNotFoundException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except CourierTimeOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
