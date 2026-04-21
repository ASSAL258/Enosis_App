from app.models import DeliveredTime


class DeliveredTimeRepository:
    def get_by_id(self, delivered_time_id):
        return DeliveredTime.objects.filter(id=delivered_time_id).first()

    def create_delivered_time(self, delivered_time):
        delivered_time.save()
        return delivered_time

    def set_image_id(self, delivered_time, image_id):
        delivered_time.image_id = image_id
        delivered_time.save(update_fields=["image_id"])
        return delivered_time

    def set_start_time(self, delivered_time, start_time):
        delivered_time.start_time = start_time
        delivered_time.save(update_fields=["start_time"])
        return delivered_time

    def set_end_time(self, delivered_time, end_time):
        delivered_time.end_time = end_time
        delivered_time.save(update_fields=["end_time"])
        return delivered_time
