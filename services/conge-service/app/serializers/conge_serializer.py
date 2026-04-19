from rest_framework import serializers

from app.models import Conge


class CongeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conge
        fields = [
            "id",
            "user_id",
            "type_dabsense",
            "start_date",
            "end_date",
            "motif",
            "attachment_url",
            "feedback_rh_id",
            "feedback_manager_id",
            "solde_id",
            "created_at",
            "updated_at",
        ]


class CongeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conge
        fields = ["user_id", "type_dabsense", "start_date", "end_date", "motif", "attachment_url"]


class CongeUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conge
        fields = ["user_id", "type_dabsense", "start_date", "end_date", "motif", "attachment_url"]


class CongeAttachmentUploadSerializer(serializers.Serializer):
    file_name = serializers.CharField(max_length=255)
    content_type = serializers.CharField(max_length=100)
    content_base64 = serializers.CharField()
