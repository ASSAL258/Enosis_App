from rest_framework import status
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from app.exceptions import CourierTimeOperationException, DeliveredTimeNotFoundException
from app.serializers import DeliveredTimeCreateSerializer, DeliveredTimeSerializer
from app.services import DeliveredTimeService


class DeliveredTimeViewSet(ViewSet):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.delivered_time_service = DeliveredTimeService()

    def retrieve(self, _request, pk=None):
        try:
            delivered_time = self.delivered_time_service.get_delivered_time_by_id(pk)
            return Response(DeliveredTimeSerializer(delivered_time).data)
        except DeliveredTimeNotFoundException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except CourierTimeOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    def create(self, request):
        try:
            serializer = DeliveredTimeCreateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            delivered_time = self.delivered_time_service.create_delivered_time(serializer.validated_data)
            return Response(DeliveredTimeSerializer(delivered_time).data, status=status.HTTP_201_CREATED)
        except CourierTimeOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
