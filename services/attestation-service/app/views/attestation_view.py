from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from app.exceptions import AttestationOperationException
from app.serializers import (
    AttestationCreateSerializer,
    AttestationResponseSerializer,
    AttestationUpdateSerializer,
)
from app.services.attestation_service import AttestationService


class AttestationViewSet(viewsets.ViewSet):
    """CRUD endpoints for attestation requests."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.attestation_service = AttestationService()

    @swagger_auto_schema(
        operation_description="List attestations, optionally filtered by user_id.",
        manual_parameters=[
            openapi.Parameter(
                "user_id",
                openapi.IN_QUERY,
                description="Filter by user UUID",
                type=openapi.TYPE_STRING,
                format=openapi.FORMAT_UUID,
            )
        ],
        responses={200: AttestationResponseSerializer(many=True)},
    )
    def list(self, request):
        try:
            user_id = request.query_params.get("user_id")
            attestations = (
                self.attestation_service.get_user_attestations(user_id)
                if user_id
                else self.attestation_service.list_attestations()
            )
            return Response(
                AttestationResponseSerializer(attestations, many=True).data,
                status=status.HTTP_200_OK,
            )
        except Exception as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        operation_description="Create a new attestation.",
        request_body=AttestationCreateSerializer,
        responses={201: AttestationResponseSerializer},
    )
    def create(self, request):
        try:
            serializer = AttestationCreateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            attestation = self.attestation_service.create_attestation(serializer.validated_data)
            return Response(
                AttestationResponseSerializer(attestation).data,
                status=status.HTTP_201_CREATED,
            )
        except AttestationOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        operation_description="Retrieve an attestation by ID.",
        responses={200: AttestationResponseSerializer, 404: "Attestation not found"},
    )
    def retrieve(self, request, pk=None):
        attestation = self.attestation_service.get_attestation(pk)
        if not attestation:
            return Response({"detail": "Attestation not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response(AttestationResponseSerializer(attestation).data, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        operation_description="Update an attestation.",
        request_body=AttestationUpdateSerializer,
        responses={200: AttestationResponseSerializer, 404: "Attestation not found"},
    )
    def update(self, request, pk=None):
        serializer = AttestationUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        attestation = self.attestation_service.update_attestation(pk, serializer.validated_data)
        if not attestation:
            return Response({"detail": "Attestation not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response(AttestationResponseSerializer(attestation).data, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        operation_description="Delete an attestation.",
        responses={204: "Deleted", 404: "Attestation not found"},
    )
    def destroy(self, request, pk=None):
        deleted = self.attestation_service.delete_attestation(pk)
        if not deleted:
            return Response({"detail": "Attestation not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["patch"], url_path="update-status")
    @swagger_auto_schema(
        operation_description="Update attestation status.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={"status": openapi.Schema(type=openapi.TYPE_STRING)},
            required=["status"],
        ),
        responses={200: AttestationResponseSerializer, 404: "Attestation not found"},
    )
    def update_status(self, request, pk=None):
        new_status = request.data.get("status")
        if not new_status:
            return Response({"detail": "Status is required"}, status=status.HTTP_400_BAD_REQUEST)
        attestation = self.attestation_service.update_status(pk, new_status)
        if not attestation:
            return Response({"detail": "Attestation not found or invalid status"}, status=status.HTTP_404_NOT_FOUND)
        return Response(AttestationResponseSerializer(attestation).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="consume-feedback")
    @swagger_auto_schema(
        operation_description="Consume a feedback_rh event and update the attestation.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                "feedback_rh_id": openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_UUID),
                "status": openapi.Schema(type=openapi.TYPE_STRING),
                "motif": openapi.Schema(type=openapi.TYPE_STRING),
            },
        ),
        responses={200: AttestationResponseSerializer, 404: "Attestation not found"},
    )
    def consume_feedback(self, request, pk=None):
        attestation = self.attestation_service.consume_feedback_rh(pk, request.data)
        if not attestation:
            return Response({"detail": "Attestation not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response(AttestationResponseSerializer(attestation).data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], url_path="health")
    def health(self, _request):
        return Response({"status": "ok", "service": "attestation-service"}, status=status.HTTP_200_OK)
