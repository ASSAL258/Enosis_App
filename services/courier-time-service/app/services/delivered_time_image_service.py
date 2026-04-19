import uuid

from app.exceptions import DeliveredTimeNotFoundException
from app.repositories import DeliveredTimeImageRepository, DeliveredTimeRepository


class DeliveredTimeImageService:
    def __init__(self):
        self.delivered_time_repository = DeliveredTimeRepository()
        self.delivered_time_image_repository = DeliveredTimeImageRepository()

    def upload_image(self, delivered_time_id, file_name, content_type, content_base64):
        delivered_time = self.delivered_time_repository.get_by_id(delivered_time_id)
        if delivered_time is None:
            raise DeliveredTimeNotFoundException("Delivered time not found")

        image_id = uuid.uuid4()
        self.delivered_time_image_repository.save_image(
            image_id=image_id,
            delivered_time_id=delivered_time_id,
            file_name=file_name,
            content_type=content_type,
            content_base64=content_base64,
        )
        self.delivered_time_repository.set_image_id(delivered_time, image_id)
        return image_id

    def get_image(self, delivered_time_id):
        delivered_time = self.delivered_time_repository.get_by_id(delivered_time_id)
        if delivered_time is None:
            raise DeliveredTimeNotFoundException("Delivered time not found")
        if delivered_time.image_id is None:
            raise DeliveredTimeNotFoundException("Image not found")

        image = self.delivered_time_image_repository.get_image(delivered_time.image_id)
        if image is None:
            raise DeliveredTimeNotFoundException("Image not found")

        return {
            "image_id": image["_id"],
            "file_name": image["file_name"],
            "content_type": image["content_type"],
            "content_base64": image["content_base64"],
        }
