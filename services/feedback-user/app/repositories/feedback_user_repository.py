from app.models import FeedbackUser


class FeedbackUserRepository:
    def list_feedbacks(self) -> list[FeedbackUser]:
        return list(FeedbackUser.objects.all())

    def get_feedback(self, *, feedback_id):
        return FeedbackUser.objects.filter(id=feedback_id).first()

    def create_feedback(self, *, userid, commentaire: str, status: str) -> FeedbackUser:
        return FeedbackUser.objects.create(
            userid=userid,
            commentaire=commentaire,
            status=status,
        )

    def update_feedback(self, feedback: FeedbackUser, *, commentaire: str, status: str) -> FeedbackUser:
        feedback.commentaire = commentaire
        feedback.status = status
        feedback.save(update_fields=["commentaire", "status"])
        return feedback

    def delete_feedback(self, feedback: FeedbackUser) -> None:
        feedback.delete()
