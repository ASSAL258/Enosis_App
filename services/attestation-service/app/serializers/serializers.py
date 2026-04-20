from rest_framework import serializers
from app.models.attestation import Attestation


class AttestationCreateSerializer(serializers.Serializer):
    """Serializer for creating a new attestation"""
    user_id = serializers.UUIDField(required=True)
    type_demande = serializers.IntegerField(
        required=True,
        help_text="1: Attestation de Travail, 2: Attestation de Salaire, 3: Attestation domiciliation de salaire"
    )
    societe = serializers.IntegerField(
        required=True,
        help_text="1: AMA Papillon, 2: AMA Detergent, 3: Sulfonation, 4: FMCG Maroc"
    )
    motif = serializers.CharField(max_length=255, required=True, allow_blank=False, allow_null=False)
    feedback_rh_id = serializers.UUIDField(required=False, allow_null=True)


class AttestationUpdateSerializer(serializers.Serializer):
    """Serializer for updating an attestation"""
    type_demande = serializers.IntegerField(required=False)
    societe = serializers.IntegerField(required=False)
    motif = serializers.CharField(max_length=255, required=False, allow_blank=False)
    status = serializers.ChoiceField(
        choices=['pending', 'approved', 'rejected'],
        required=False
    )
    feedback_rh_id = serializers.UUIDField(required=False, allow_null=True)


class AttestationResponseSerializer(serializers.ModelSerializer):
    """Serializer for attestation response"""
    type_demande_display = serializers.SerializerMethodField()
    societe_display = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()

    class Meta:
        model = Attestation
        fields = [
            'id',
            'user_id',
            'type_demande',
            'type_demande_display',
            'societe',
            'societe_display',
            'motif',
            'status',
            'status_display',
            'feedback_rh_id',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_type_demande_display(self, obj: Attestation) -> str:
        type_choices = {
            1: 'Attestation de Travail',
            2: 'Attestation de Salaire',
            3: 'Attestation domiciliation de salaire'
        }
        return type_choices.get(obj.type_demande, 'Unknown')

    def get_societe_display(self, obj: Attestation) -> str:
        societe_choices = {
            1: 'AMA Papillon',
            2: 'AMA Detergent',
            3: 'Sulfonation',
            4: 'FMCG Maroc'
        }
        return societe_choices.get(obj.societe, 'Unknown')

    def get_status_display(self, obj: Attestation) -> str:
        status_choices = {
            'pending': 'Pending',
            'approved': 'Approved',
            'rejected': 'Rejected'
        }
        return status_choices.get(obj.status, 'Unknown')
        return duree_choices.get(obj.duree_de_remboursement, str(obj.duree_de_remboursement))