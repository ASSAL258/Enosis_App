from rest_framework import status
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from config_api.exceptions import ConfigOperationException


class ConfigViewSet(ViewSet):
    def health(self, _request):
        try:
            return Response({"status": "ok", "service": "config-service"})
        except ConfigOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)


    def api_gateway_config(self, _request):
        try:
            return Response(
                {
                    "gateway": "nginx",
                    "routes": [
                        {"path": "/api/backend/", "upstream": "web.service.consul:8000"},
                        {
                            "path": "/api/config/",
                            "upstream": "config-service.service.consul:5000",
                        },
                    ],
                }
            )
        except ConfigOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
