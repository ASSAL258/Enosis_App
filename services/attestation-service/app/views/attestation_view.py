import app.serilizers.attestation_serializer as AttestationSerializer

class AttestationViewSet(viewsets.ModelViewSet):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.attestation_serializer_class = AttestationSerializer()
        self.attestation_service = AttestationService()
    
    @action(detail=False, methods=["post"], url_path="create")
    def create_attestation(self, request):
        try:
            serializer = self.CreateAttestationSerializer(data=request.data)
            attestaion_data= self.CreateAttestationSerializer(data=request.data)
            attestaion_data = attestaion_data.is_valid(raise_exception=True)
            attestation = self.attestation_service.create_attestation(attestaion_data.validated_data)
            serializer.is_valid(raise_exception=True)
            attestation = self.attestation_service.create_attestation(serializer.validated_data)
            return attestation 
        except AttestationOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
    @action (detail=True, methods=["put"], url_path="update")
    def update_attestation(self, request, pk=None):
        try:
            attestation = self.attestation_service.get_attestation(attestation_id=pk)
            serializer = self.UpdateAttestationSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            updated_attestation = self.attestation_service.update_attestation(attestation, serializer.validated_data)
            return Response(self.attestation_serializer_class(updated_attestation).data)
        except AttestationNotFoundException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except AttestationOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)