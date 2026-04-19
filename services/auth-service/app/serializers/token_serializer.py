from rest_framework import serializers


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)
    matricule = serializers.CharField(max_length=50)
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    role_id = serializers.UUIDField(required=False, allow_null=True)
    manager_id = serializers.UUIDField(required=False, allow_null=True)
    rh_id = serializers.UUIDField(required=False, allow_null=True)
    departement_id = serializers.UUIDField(required=False, allow_null=True)

    def validate(self, data):
        if data["password"] != data.pop("password_confirm"):
            raise serializers.ValidationError({"password": "Passwords do not match"})
        return data


class AuthResponseSerializer(serializers.Serializer):
    """Serializer for authentication response with user info and tokens"""
    access_token = serializers.CharField()
    refresh_token = serializers.CharField()
    user = serializers.SerializerMethodField()

    def get_user(self, obj):
        user = obj.get("user")
        return {
            "id": str(user["id"]),
            "matricule": user.get("matricule"),
            "email": user.get("email"),
            "first_name": user.get("first_name"),
            "last_name": user.get("last_name"),
            "role_id": str(user.get("role_id")) if user.get("role_id") else None,
            "manager_id": str(user.get("manager_id")) if user.get("manager_id") else None,
            "rh_id": str(user.get("rh_id")) if user.get("rh_id") else None,
            "departement_id": str(user.get("departement_id")) if user.get("departement_id") else None,
        }


class TokenSerializer(serializers.Serializer):
    access_token = serializers.CharField()
    refresh_token = serializers.CharField()


class RefreshTokenSerializer(serializers.Serializer):
    refresh_token = serializers.CharField()

