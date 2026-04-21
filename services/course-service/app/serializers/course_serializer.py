from rest_framework import serializers

from app.models.course import Course, CourseType


class CourseSerializer(serializers.ModelSerializer):
    attachment_file_name = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            "id",
            "name",
            "type",
            "phone_number",
            "description",
            "attachment_id",
            "user_id",
            "status",
            "delivered_time_id",
            "city",
            "destination",
            "dimensions",
            "weight",
            "courier_id",
            "attachment_file_name",
            "created_at",
            "updated_at",
        ]

    def get_attachment_file_name(self, obj):
        return getattr(obj, "attachment_file_name", None)


class CourseCreateSerializer(serializers.ModelSerializer):
    type = serializers.ChoiceField(choices=CourseType.choices, required=True)
    phone_number = serializers.CharField(required=True, allow_blank=False, max_length=30)
    attachment_file = serializers.FileField(required=True, write_only=True)

    class Meta:
        model = Course
        fields = [
            "name",
            "type",
            "phone_number",
            "description",
            "attachment_id",
            "attachment_file",
            "user_id",
            "status",
            "city",
            "destination",
            "dimensions",
            "weight",
            "courier_id",
        ]


class CourseUpdateSerializer(serializers.ModelSerializer):
    type = serializers.ChoiceField(choices=CourseType.choices, required=True)
    phone_number = serializers.CharField(required=True, allow_blank=False, max_length=30)
    attachment_file = serializers.FileField(required=False, write_only=True)

    class Meta:
        model = Course
        fields = [
            "name",
            "type",
            "phone_number",
            "description",
            "attachment_id",
            "attachment_file",
            "user_id",
            "status",
            "city",
            "destination",
            "dimensions",
            "weight",
            "courier_id",
        ]


class CourseAttachmentUploadSerializer(serializers.Serializer):
    attachment_file = serializers.FileField()


class CourseAssignCourierSerializer(serializers.Serializer):
    courier_id = serializers.UUIDField(required=True)


class CourseAttachDeliveredTimeSerializer(serializers.Serializer):
    delivered_time_id = serializers.UUIDField(required=True)
