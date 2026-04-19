from rest_framework import serializers

from app.models import Solde


class SoldeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Solde
        fields = ["id", "conge_id", "solde_initial", "solde_accorde", "solde_restant", "created_at"]


class SoldeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Solde
        fields = ["conge_id", "solde_initial", "solde_accorde", "solde_restant"]


class SoldeUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Solde
        fields = ["conge_id", "solde_initial", "solde_accorde", "solde_restant"]
