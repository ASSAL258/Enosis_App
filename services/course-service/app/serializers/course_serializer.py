from rest_framework import serializers

from app.models import Course


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = [
            "id",
            "name",
            "code",
            "description",
            "attachment_id",
            "attachment_url",
            "user_id",
            "status",
            "delivered_time_id",
            "city",
            "destination",
            "courier_id",
            "created_at",
            "updated_at",
        ]


class CourseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = [
            "name",
            "code",
            "description",
            "attachment_id",
            "attachment_url",
            "user_id",
            "status",
            "city",
            "destination",
            "courier_id",
        ]


class CourseUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = [
            "name",
            "code",
            "description",
            "attachment_id",
            "attachment_url",
            "user_id",
            "status",
            "city",
            "destination",
            "courier_id",
        ]


class CourseAttachmentUploadSerializer(serializers.Serializer):
    file_name = serializers.CharField(max_length=255)
    content_type = serializers.CharField(max_length=100)
    content_base64 = serializers.CharField()
