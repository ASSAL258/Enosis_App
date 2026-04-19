
from rest_framework import serializers

class  CreateAvanceSerializer(serializers.Serializer):
    motif = serializers.CharField(max_length=255)
    montante = serializers.FloatField()
    duree_de_remboursement = serializers.IntegerField()
    user_id = serializers.UUIDField(required=False, allow_null=True)
class  AvanceFeedbackSerializer(serializers.Serializer):
    feedback_id = serializers.UUIDField()
    user_role = serializers.CharField(max_length=50)
    avance_id = serializers.UUIDField()