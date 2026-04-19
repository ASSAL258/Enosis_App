from rest_framework import status
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet
import os

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

    def services_config(self, _request):
        try:
            return Response(
                {
                    "services": {
                        "user-service": {
                            "base_url": os.getenv("USER_SERVICE_URL", "http://user-service:5002")
                        },
                        "auth-service": {
                            "base_url": os.getenv("AUTH_SERVICE_URL", "http://auth-service:5003")
                        },
                        "departement-service": {
                            "base_url": os.getenv(
                                "DEPARTEMENT_SERVICE_URL", "http://departement-service:5005"
                            )
                        },
                        "course-service": {
                            "base_url": os.getenv("COURSE_SERVICE_URL", "http://course-service:5006")
                        },
                        "courier-time-service": {
                            "base_url": os.getenv(
                                "COURIER_TIME_SERVICE_URL", "http://courier-time-service:5007"
                            )
                        },
                        "conge-service": {
                            "base_url": os.getenv("CONGE_SERVICE_URL", "http://conge-service:5008")
                        },
                        "soldes-service": {
                            "base_url": os.getenv("SOLDES_SERVICE_URL", "http://soldes-service:5009")
                        },
                    }
                }
            )
        except ConfigOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
