from rest_framework import serializers
from decimal import Decimal

from app.models.attestation import Attestation


class AttestationCreateSerializer(serializers.Serializer):
    user_id = serializers.UUIDField(required=True)
    type_demande = serializers.ChoiceField(
        choices=[
            (1, 'Attestation de Travail'),
            (2, 'Attestation de Salaire'),
            (3, 'Attestation domiciliation de salaire')
        ],
        required=True,
        allow_blank=False
    )
    societe = serializers.ChoiceField(
        choices=[
            (1, 'AMA Papillon'),
            (2, 'AMA Detergent'),
            (3, 'Sulfonation'),
            (4, 'FMCG Maroc')
        ],
        required=True,
        allow_blank=False
    )
    motif = serializers.CharField(max_length=255, required=True, allow_blank=False, allow_null=False)
    montante = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        min_value=Decimal('0.01'),
        required=True
    )
    duree_de_remboursement = serializers.ChoiceField(
        choices=[(1, "1 mois"), (2, "2 mois")],
        required=True
    )
    feedback_rh_id = serializers.UUIDField(required=False, allow_null=True)


class AttestationUpdateSerializer(serializers.Serializer):
    type_demande = serializers.ChoiceField(
        choices=[
            (1, 'Attestation de Travail'),
            (2, 'Attestation de Salaire'),
            (3, 'Attestation domiciliation de salaire')
        ],
        required=False,
        allow_blank=False
    )
    societe = serializers.ChoiceField(
        choices=[
            (1, 'AMA Papillon'),
            (2, 'AMA Detergent'),
            (3, 'Sulfonation'),
            (4, 'FMCG Maroc')
        ],
        required=False,
        allow_blank=False
    )
    motif = serializers.CharField(max_length=255, required=False, allow_blank=False)
    montante = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        min_value=Decimal('0.01'),
        required=False
    )
    duree_de_remboursement = serializers.ChoiceField(
        choices=[(1, "1 mois"), (2, "2 mois")],
        required=False
    )
    feedback_rh_id = serializers.UUIDField(required=False, allow_null=True)


class AttestationResponseSerializer(serializers.ModelSerializer):
    type_demande_display = serializers.SerializerMethodField()
    societe_display = serializers.SerializerMethodField()
    duree_de_remboursement_display = serializers.SerializerMethodField()

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
            'montante',
            'duree_de_remboursement',
            'duree_de_remboursement_display',
            'feedback_rh_id',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def get_type_demande_display(self, obj: Attestation) -> str:
        type_choices = {
            1: 'Attestation de Travail',
            2: 'Attestation de Salaire',
            3: 'Attestation domiciliation de salaire',
        }
        return type_choices.get(obj.type_demande, str(obj.type_demande))

    def get_societe_display(self, obj: Attestation) -> str:
        societe_choices = {
            1: 'AMA Papillon',
            2: 'AMA Detergent',
            3: 'Sulfonation',
            4: 'FMCG Maroc',
        }
        return societe_choices.get(obj.societe, str(obj.societe))

    def get_duree_de_remboursement_display(self, obj: Attestation) -> str:
        duree_choices = {
            1: '1 mois',
            2: '2 mois',
        }
        return duree_choices.get(obj.duree_de_remboursement, str(obj.duree_de_remboursement))