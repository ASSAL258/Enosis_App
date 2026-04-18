from rest_framework import serializers


class LoginSerializer(serializers.Serializer):
    user_id = serializers.IntegerField(min_value=1)


class TokenSerializer(serializers.Serializer):
    access_token = serializers.CharField()
    refresh_token = serializers.CharField()
