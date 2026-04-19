from rest_framework import serializers

from app.models import FeedbackUser


class FeedbackUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeedbackUser
        fields = ["id", "userid", "commentaire", "status"]


class FeedbackUserCreateSerializer(serializers.ModelSerializer):
    user_role = serializers.CharField(write_only=True)
    avance_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    conge_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    pret_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = FeedbackUser
        fields = ["userid", "commentaire", "status", "user_role", "avance_id", "conge_id", "pret_id"]


class FeedbackCreatedEventSerializer(serializers.Serializer):
    user_role = serializers.CharField()
    avance_id = serializers.UUIDField(required=False, allow_null=True)
    conge_id = serializers.UUIDField(required=False, allow_null=True)
    pret_id = serializers.UUIDField(required=False, allow_null=True)
