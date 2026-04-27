from rest_framework import serializers
from app.models import ForOther


class ForOtherSerializer(serializers.ModelSerializer):
    class Meta:
        model = ForOther
        fields = ["id", "first_name", "last_name", "matricule", "target_service", "created_at"]
