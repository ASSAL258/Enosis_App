from app.models import DeliveredTime


class DeliveredTimeRepository:
    def get_by_id(self, delivered_time_id):
        return DeliveredTime.objects.filter(id=delivered_time_id).first()

    def create_delivered_time(self, delivered_time):
        delivered_time.save()
        return delivered_time
