from rest_framework import serializers

from app.models import DeliveredTime


class DeliveredTimeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveredTime
        fields = [
            "id",
            "course_id",
            "courier_id",
            "start_time",
            "end_time",
            "created_at",
        ]


class DeliveredTimeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveredTime
        fields = [
            "course_id",
            "courier_id",
            "start_time",
            "end_time",
        ]
