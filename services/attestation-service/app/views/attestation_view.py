import app.serilizers.avance_serializer as AvanceSerializer

class AvanceViewSet(viewsets.ModelViewSet):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.avance_serializer_class = AvanceSerializer()
        self.avance_service = AvanceService()
    
    @action(detail=False, methods=["post"], url_path="create")
    def create_avance(self, request):
        try:
            serializer = self.CreateAvanceSerializer(data=request.data)
            attestaion_data= self.CreateAttestationSerializer(data=request.data)
            attestaion_data = attestaion_data.is_valid(raise_exception=True)
            attestation = self.avance_service.create_attestation(attestaion_data.validated_data)
            serializer.is_valid(raise_exception=True)
            avance = self.avance_service.create_avance(serializer.validated_data)
            return avance 
        except AvanceOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
    @action (detail=True, methods=["put"], url_path="update")
    def update_avance(self, request, pk=None):
        try:
            avance = self.avance_service.get_avance(avance_id=pk)
            serializer = self.UpdateAvanceSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            updated_avance = self.avance_service.update_avance(avance, serializer.validated_data)
            return Response(self.avance_serializer_class(updated_avance).data)
        except AvanceNotFoundException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except AvanceOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)