import os
import uuid

import jwt
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from app.exceptions import AvanceNotFoundException, AvanceOperationException
from app.models import Avance
from app.serializers.avance_serializer import CreateAvanceSerializer
from app.services.avance_service import AvanceService


class AvanceViewSet(viewsets.ModelViewSet):
    queryset = Avance.objects.all().order_by("-created_at")

    error_response_schema = openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            "detail": openapi.Schema(type=openapi.TYPE_STRING),
        },
    )

    avance_response_schema = openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            "id": openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_UUID),
            "motif": openapi.Schema(type=openapi.TYPE_STRING),
            "montante": openapi.Schema(type=openapi.TYPE_NUMBER),
            "duree_de_remboursement": openapi.Schema(type=openapi.TYPE_INTEGER),
            "user_id": openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_UUID),
            "feedback_rh_id": openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_UUID, nullable=True),
            "created_at": openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_DATETIME),
        },
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.avance_service = AvanceService()

    def list(self, request, *args, **kwargs):
        avances = self.get_queryset()
        return Response([self._serialize_avance(avance) for avance in avances], status=status.HTTP_200_OK)

    @swagger_auto_schema(
        operation_summary="Create avance",
        operation_description="Create a new avance record. user_id can be provided in body or extracted from Authorization Bearer token.",
        request_body=CreateAvanceSerializer,
        manual_parameters=[
            openapi.Parameter(
                "Authorization",
                openapi.IN_HEADER,
                description="Bearer <access_token>",
                type=openapi.TYPE_STRING,
                required=False,
            )
        ],
        responses={
            201: avance_response_schema,
            400: error_response_schema,
        },
    )
    @action(detail=False, methods=["post"], url_path="create")
    def create_avance(self, request):
        try:
            serializer = CreateAvanceSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            avance_data = dict(serializer.validated_data)
            if avance_data.get("user_id") is None:
                avance_data["user_id"] = self._extract_user_id_from_auth_header(request)

            if avance_data.get("user_id") is None:
                return Response(
                    {"detail": "user_id is required (body or Authorization Bearer token)"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            avance = self.avance_service.create_avance(avance_data)
            return Response(self._serialize_avance(avance), status=status.HTTP_201_CREATED)
        except AvanceOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        operation_summary="Update avance",
        operation_description="Update an existing avance record by ID.",
        request_body=CreateAvanceSerializer,
        responses={
            200: avance_response_schema,
            404: error_response_schema,
            400: error_response_schema,
        },
    )
    @action(detail=True, methods=["put"], url_path="update")
    def update_avance(self, request, pk=None):
        try:
            avance = self.avance_service.get_avance(avance_id=pk)
            serializer = CreateAvanceSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            updated_avance = self.avance_service.update_avance(avance, serializer.validated_data)
            return Response(self._serialize_avance(updated_avance), status=status.HTTP_200_OK)
        except AvanceNotFoundException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except AvanceOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    def _serialize_avance(self, avance):
        return {
            "id": str(avance.id),
            "motif": avance.motif,
            "montante": float(avance.montante),
            "duree_de_remboursement": avance.duree_de_remboursement,
            "user_id": str(avance.user_id),
            "feedback_rh_id": str(avance.feedback_rh_id) if avance.feedback_rh_id else None,
            "created_at": avance.created_at.isoformat() if avance.created_at else None,
        }

    def _extract_user_id_from_auth_header(self, request):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return None

        token = auth_header.split(" ", 1)[1].strip()
        if not token:
            return None

        try:
            payload = jwt.decode(
                token,
                os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production"),
                algorithms=["HS256"],
            )
            user_id = payload.get("user_id")
            if not user_id:
                return None
            return uuid.UUID(str(user_id))
        except (jwt.InvalidTokenError, ValueError, TypeError):
            return None