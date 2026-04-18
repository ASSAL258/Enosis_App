import uuid

from django.db import models


class FeedbackUser(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    userid = models.UUIDField()
    commentaire = models.TextField()
    status = models.CharField(max_length=50)

    class Meta:
        db_table = "feedback_users"

    def __str__(self) -> str:
        return f"{self.id} - {self.status}"
