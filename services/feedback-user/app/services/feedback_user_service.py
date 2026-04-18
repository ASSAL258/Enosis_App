from app.repositories import FeedbackUserRepository
from app.services.feedback_event_publisher import FeedbackEventPublisher


class FeedbackUserService:
    def __init__(self):
        self.feedback_user_repository = FeedbackUserRepository()
        self.feedback_event_publisher = FeedbackEventPublisher()

    def list_feedbacks(self):
        return self.feedback_user_repository.list_feedbacks()

    def get_feedback(self, feedback_id):
        return self.feedback_user_repository.get_feedback(feedback_id=feedback_id)

    def create_feedback(self, validated_data: dict):
        feedback = self.feedback_user_repository.create_feedback(
            userid=validated_data["userid"],
            commentaire=validated_data["commentaire"],
            status=validated_data["status"],
        )
        self.publish_feedback_created_event(
            feedback=feedback,
            user_role=validated_data["user_role"],
            avance_id=validated_data["avance_id"],
        )
        return feedback

    def publish_feedback_created_event(self, *, feedback, user_role: str, avance_id):
        self.feedback_event_publisher.publish_feedback_created(
            feedback_id=str(feedback.id),
            user_role=user_role,
            avance_id=str(avance_id),
            user_id=str(feedback.userid),
        )

    def update_feedback(self, feedback, validated_data: dict):
        return self.feedback_user_repository.update_feedback(
            feedback,
            commentaire=validated_data["commentaire"],
            status=validated_data["status"],
        )

    def delete_feedback(self, feedback):
        self.feedback_user_repository.delete_feedback(feedback)
