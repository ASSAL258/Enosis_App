from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from app.exceptions import (
    FeedbackNotFoundException,
    FeedbackOperationException,
)
from app.serializers import (
    FeedbackCreatedEventSerializer,
    FeedbackUserCreateSerializer,
    FeedbackUserSerializer,
)
from app.services import FeedbackUserService


class FeedbackUserViewSet(ViewSet):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.feedback_user_service = FeedbackUserService()

    def list(self, _request):
        try:
            feedbacks = self.feedback_user_service.list_feedbacks()
            return Response(FeedbackUserSerializer(feedbacks, many=True).data)
        except FeedbackOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, _request, pk=None):
        try:
            feedback = self.feedback_user_service.get_feedback(pk)
            if feedback is None:
                raise FeedbackNotFoundException("Feedback not found.")
            return Response(FeedbackUserSerializer(feedback).data)
        except FeedbackNotFoundException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)

    def create(self, request):
        try:
            serializer = FeedbackUserCreateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            feedback = self.feedback_user_service.create_feedback(serializer.validated_data)
            return Response(FeedbackUserSerializer(feedback).data, status=status.HTTP_201_CREATED)
        except FeedbackOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["post"], url_path="events/feedback-created")
    def publish_feedback_created(self, request, pk=None):
        try:
            feedback = self.feedback_user_service.get_feedback(pk)
            if feedback is None:
                raise FeedbackNotFoundException("Feedback not found.")

            serializer = FeedbackCreatedEventSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.feedback_user_service.publish_feedback_created_event(
                feedback=feedback,
                user_role=serializer.validated_data["user_role"],
                avance_id=serializer.validated_data.get("avance_id"),
                conge_id=serializer.validated_data.get("conge_id"),
                pret_id=serializer.validated_data.get("pret_id"),
            )
            return Response({"detail": "feedback.created published."}, status=status.HTTP_202_ACCEPTED)
        except FeedbackNotFoundException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except FeedbackOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        try:
            feedback = self.feedback_user_service.get_feedback(pk)
            if feedback is None:
                raise FeedbackNotFoundException("Feedback not found.")

            serializer = FeedbackUserCreateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            updated_feedback = self.feedback_user_service.update_feedback(feedback, serializer.validated_data)
            return Response(FeedbackUserSerializer(updated_feedback).data)
        except FeedbackNotFoundException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except FeedbackOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, _request, pk=None):
        try:
            feedback = self.feedback_user_service.get_feedback(pk)
            if feedback is None:
                raise FeedbackNotFoundException("Feedback not found.")

            self.feedback_user_service.delete_feedback(feedback)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except FeedbackNotFoundException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except FeedbackOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
