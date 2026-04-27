from rest_framework import status
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from app.models import ForOther
from app.serializers import ForOtherSerializer
from app.services import ForOtherEventPublisher


class ForOtherViewSet(ViewSet):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.publisher = ForOtherEventPublisher()

    def list(self, _request):
        items = ForOther.objects.all().order_by("-created_at")
        return Response(ForOtherSerializer(items, many=True).data)

    def create(self, request):
        serializer = ForOtherSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()

        # Publish event to service-specific queue
        self.publisher.publish_for_service(
            for_other_id=str(instance.id),
            first_name=instance.first_name,
            last_name=instance.last_name,
            matricule=instance.matricule,
            target_service=instance.target_service,
        )

        return Response(ForOtherSerializer(instance).data, status=status.HTTP_201_CREATED)
