from rest_framework import serializers

from app.models import Departement, User


class UserSerializer(serializers.ModelSerializer):
    role_id = serializers.UUIDField(read_only=True)
    manager_id = serializers.UUIDField(read_only=True)
    rh_id = serializers.UUIDField(read_only=True)
    departement_id = serializers.UUIDField(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "matricule",
            "email",
            "first_name",
            "last_name",
            "role_id",
            "manager_id",
            "rh_id",
            "departement_id",
            "is_active",
            "created_at",
        ]


class UserCreateSerializer(serializers.ModelSerializer):
    role_id = serializers.UUIDField(required=False, allow_null=True)
    manager_id = serializers.UUIDField(required=False, allow_null=True)
    rh_id = serializers.UUIDField(required=False, allow_null=True)
    departement_id = serializers.PrimaryKeyRelatedField(
        source="departement", queryset=Departement.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = User
        fields = [
            "matricule",
            "email",
            "password",
            "first_name",
            "last_name",
            "role_id",
            "manager_id",
            "rh_id",
            "departement_id",
        ]
        extra_kwargs = {"password": {"write_only": True}}
