
import uuid
from django.db import models


class DeliveredTime(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course_id = models.UUIDField(db_index=True)
    courier_id = models.UUIDField(db_index=True)
    image_id = models.UUIDField(blank=True, null=True, db_index=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"delivered_time {self.id} for courier {self.courier_id}"
