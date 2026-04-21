from rest_framework import serializers

from app.models import DeliveredTime


class DeliveredTimeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveredTime
        fields = [
            "id",
            "course_id",
            "courier_id",
            "image_id",
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


class DeliveredTimeImageUploadSerializer(serializers.Serializer):
    file_name = serializers.CharField(max_length=255)
    content_type = serializers.CharField(max_length=100)
    content_base64 = serializers.CharField()


class DeliveredTimeStartSerializer(serializers.Serializer):
    courier_id = serializers.UUIDField(required=True)
    start_time = serializers.DateTimeField(required=True)


class DeliveredTimeCompleteSerializer(serializers.Serializer):
    courier_id = serializers.UUIDField(required=True)
    end_time = serializers.DateTimeField(required=True)
