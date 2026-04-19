from rest_framework import serializers
from app.models import Departement


class DepartementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Departement
        fields = ["id", "name", "description", "created_at", "updated_at"]


class DepartementCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Departement
        fields = ["name", "description"]
