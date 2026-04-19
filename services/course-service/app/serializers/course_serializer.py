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
            "user_id",
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
            "user_id",
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
            "user_id",
            "city",
            "destination",
            "courier_id",
        ]
