from rest_framework import serializers

from app.models import Role


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ["id", "name", "description", "created_at"]


class RoleCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ["name", "description"]
