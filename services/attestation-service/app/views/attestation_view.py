from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from app.exceptions.attestaion_exceptions import AttestationOperationException
from app.serializers.serializers import (
    AttestationCreateSerializer,
    AttestationUpdateSerializer,
    AttestationResponseSerializer,
)
from app.services.attestation_service import AttestationService


class AttestationViewSet(viewsets.ViewSet):
    """
    ViewSet for Attestation CRUD operations
    Supports creating, listing, retrieving, updating, and deleting attestations
    Also acts as consumer for feedback_rh publisher
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.attestation_service = AttestationService()

    @swagger_auto_schema(
        operation_description="List all attestations or filter by user_id",
        manual_parameters=[
            openapi.Parameter(
                "user_id",
                openapi.IN_QUERY,
                description="UUID of user to filter attestations",
                type=openapi.TYPE_STRING,
                format=openapi.FORMAT_UUID,
            )
        ],
        responses={200: AttestationResponseSerializer(many=True)},
    )
    def list(self, request):
        """List all attestations"""
        try:
            user_id = request.query_params.get("user_id")
            if user_id:
                attestations = self.attestation_service.get_user_attestations(user_id)
            else:
                attestations = self.attestation_service.list_attestations()

            serializer = AttestationResponseSerializer(attestations, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as exc:
            return Response(
                {"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST
            )

    @swagger_auto_schema(
        operation_description="Create a new attestation",
        request_body=AttestationCreateSerializer,
        responses={
            201: AttestationResponseSerializer,
            400: "Invalid data",
        },
    )
    def create(self, request):
        """Create a new attestation"""
        try:
            serializer = AttestationCreateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            attestation = self.attestation_service.create_attestation(
                serializer.validated_data
            )
            response_serializer = AttestationResponseSerializer(attestation)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        except AttestationOperationException as exc:
            return Response(
                {"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as exc:
            return Response(
                {"detail": f"Error creating attestation: {str(exc)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @swagger_auto_schema(
        operation_description="Retrieve a specific attestation by ID",
        responses={
            200: AttestationResponseSerializer,
            404: "Attestation not found",
        },
    )
    def retrieve(self, request, pk=None):
        """Retrieve a specific attestation"""
        try:
            attestation = self.attestation_service.get_attestation(pk)
            if not attestation:
                return Response(
                    {"detail": "Attestation not found"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            serializer = AttestationResponseSerializer(attestation)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as exc:
            return Response(
                {"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST
            )

    @swagger_auto_schema(
        operation_description="Update an attestation",
        request_body=AttestationUpdateSerializer,
        responses={
            200: AttestationResponseSerializer,
            404: "Attestation not found",
        },
    )
    def update(self, request, pk=None):
        """Update an attestation"""
        try:
            serializer = AttestationUpdateSerializer(data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)

            attestation = self.attestation_service.update_attestation(
                pk, serializer.validated_data
            )
            if not attestation:
                return Response(
                    {"detail": "Attestation not found"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            response_serializer = AttestationResponseSerializer(attestation)
            return Response(response_serializer.data, status=status.HTTP_200_OK)
        except Exception as exc:
            return Response(
                {"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST
            )

    @swagger_auto_schema(
        operation_description="Delete an attestation",
        responses={
            204: "Attestation deleted",
            404: "Attestation not found",
        },
    )
    def destroy(self, request, pk=None):
        """Delete an attestation"""
        try:
            result = self.attestation_service.delete_attestation(pk)
            if not result:
                return Response(
                    {"detail": "Attestation not found"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as exc:
            return Response(
                {"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=["patch"], url_path="update-status")
    @swagger_auto_schema(
        operation_description="Update attestation status",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={"status": openapi.Schema(type=openapi.TYPE_STRING)},
        ),
        responses={
            200: AttestationResponseSerializer,
            404: "Attestation not found",
        },
    )
    def update_status(self, request, pk=None):
        """Update attestation status"""
        try:
            new_status = request.data.get("status")
            if not new_status:
                return Response(
                    {"detail": "Status is required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            attestation = self.attestation_service.update_status(pk, new_status)
            if not attestation:
                return Response(
                    {"detail": "Attestation not found or invalid status"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            serializer = AttestationResponseSerializer(attestation)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as exc:
            return Response(
                {"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=["post"], url_path="consume-feedback")
    @swagger_auto_schema(
        operation_description="Consume feedback from feedback_rh publisher",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                "feedback_rh_id": openapi.Schema(type=openapi.TYPE_STRING),
                "status": openapi.Schema(type=openapi.TYPE_STRING),
                "motif": openapi.Schema(type=openapi.TYPE_STRING),
            },
        ),
        responses={
            200: AttestationResponseSerializer,
            404: "Attestation not found",
        },
    )
    def consume_feedback(self, request, pk=None):
        """
        Consumer endpoint for feedback_rh publisher
        Updates attestation based on feedback from RH
        """
        try:
            feedback_data = request.data

            attestation = self.attestation_service.consume_feedback_rh(pk, feedback_data)
            if not attestation:
                return Response(
                    {"detail": "Attestation not found"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            serializer = AttestationResponseSerializer(attestation)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as exc:
            return Response(
                {"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=["get"], url_path="health")
    def health(self, request):
        """Health check endpoint"""
        return Response(
            {"status": "ok", "service": "attestation-service"},
            status=status.HTTP_200_OK,
        )
