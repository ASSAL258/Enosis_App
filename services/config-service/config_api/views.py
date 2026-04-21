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
                        {
                            "path": "/api/users/",
                            "upstream": "user-service.service.consul:5002",
                        },
                        {
                            "path": "/api/auth/",
                            "upstream": "auth-service.service.consul:5003",
                        },
                        {
                            "path": "/api/feedback-users/",
                            "upstream": "feedback-user.service.consul:5001",
                        },
                        {
                            "path": "/api/avances/",
                            "upstream": "avance-service.service.consul:5004",
                        },
                        {
                            "path": "/api/departements/",
                            "upstream": "departement-service.service.consul:5005",
                        },
                        {
                            "path": "/api/courses/",
                            "upstream": "course-service.service.consul:5006",
                        },
                        {
                            "path": "/api/delivered-times/",
                            "upstream": "courier-time-service.service.consul:5007",
                        },
                        {
                            "path": "/api/conges/",
                            "upstream": "conge-service.service.consul:5008",
                        },
                        {
                            "path": "/api/soldes/",
                            "upstream": "soldes-service.service.consul:5009",
                        },
                        {
                            "path": "/api/prets/",
                            "upstream": "pret-service.service.consul:5010",
                        },
                        {
                            "path": "/api/attestations/",
                            "upstream": "attestation-service.service.consul:5011",
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
                        "config-service": {
                            "base_url": os.getenv("CONFIG_SERVICE_URL", "http://config-service:5000")
                        },
                        "api-gateway": {
                            "base_url": os.getenv("API_GATEWAY_URL", "http://api-gateway")
                        },
                        "backend": {
                            "base_url": os.getenv("BACKEND_SERVICE_URL", "http://web:8000")
                        },
                        "discovery-service": {
                            "base_url": os.getenv("DISCOVERY_SERVICE_URL", "http://discovery-service:8500")
                        },
                        "user-service": {
                            "base_url": os.getenv("USER_SERVICE_URL", "http://user-service:5002")
                        },
                        "auth-service": {
                            "base_url": os.getenv("AUTH_SERVICE_URL", "http://auth-service:5003")
                        },
                        "feedback-user": {
                            "base_url": os.getenv("FEEDBACK_USER_SERVICE_URL", "http://feedback-user:5001")
                        },
                        "avance-service": {
                            "base_url": os.getenv("AVANCE_SERVICE_URL", "http://avance-service:5004")
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
                        "pret-service": {
                            "base_url": os.getenv("PRET_SERVICE_URL", "http://pret-service:5010")
                        },
                        "attestation-service": {
                            "base_url": os.getenv("ATTESTATION_SERVICE_URL", "http://attestation-service:5011")
                        },
                        "frontend": {
                            "base_url": os.getenv("FRONTEND_SERVICE_URL", "http://frontend")
                        },
                    }
                }
            )
        except ConfigOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
