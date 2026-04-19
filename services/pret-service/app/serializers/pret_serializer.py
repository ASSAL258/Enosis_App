from rest_framework import serializers

from app.models import Pret


class PretSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pret
        fields = [
            "id",
            "user_id",
            "motif",
            "fonction",
            "status",
            "duree",
            "montant_demande",
            "feedback_manager_id",
            "feedback_rh_id",
            "created_at",
            "updated_at",
        ]


class PretCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pret
        fields = ["user_id", "motif", "fonction", "status", "duree", "montant_demande"]


class PretUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pret
        fields = ["user_id", "motif", "fonction", "status", "duree", "montant_demande"]
