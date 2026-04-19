from app.exceptions import CourierTimeOperationException, DeliveredTimeNotFoundException
from app.models import DeliveredTime
from app.repositories import DeliveredTimeRepository
from app.services.delivered_time_event_publisher import DeliveredTimeEventPublisher


class DeliveredTimeService:
    def __init__(self):
        self.delivered_time_repository = DeliveredTimeRepository()
        self.delivered_time_event_publisher = DeliveredTimeEventPublisher()

    def get_delivered_time_by_id(self, delivered_time_id):
        delivered_time = self.delivered_time_repository.get_by_id(delivered_time_id)
        if delivered_time is None:
            raise DeliveredTimeNotFoundException("Delivered time not found")
        return delivered_time

    def create_delivered_time(self, data):
        try:
            delivered_time = DeliveredTime(
                course_id=data["course_id"],
                courier_id=data["courier_id"],
                image_id=data.get("image_id"),
                start_time=data["start_time"],
                end_time=data["end_time"],
            )
            delivered_time = self.delivered_time_repository.create_delivered_time(delivered_time)
            self.delivered_time_event_publisher.publish_delivered_time_created(
                delivered_time_id=delivered_time.id,
                course_id=delivered_time.course_id,
            )
            return delivered_time
        except Exception as exc:
            raise CourierTimeOperationException("Failed to create delivered time") from exc
