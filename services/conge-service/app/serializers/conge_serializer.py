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
            "feedback_rh_id",
            "feedback_manager_id",
            "solde_id",
            "created_at",
            "updated_at",
        ]


class CongeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conge
        fields = ["user_id", "type_dabsense", "start_date", "end_date", "motif"]


class CongeUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conge
        fields = ["user_id", "type_dabsense", "start_date", "end_date", "motif"]
