from django.http import JsonResponse
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from app.views.avance_view import AvanceViewSet


def health_check(_request):
    return JsonResponse({"status": "ok", "service": "avance-service"})


router = DefaultRouter()
router.register(r"avances", AvanceViewSet, basename="avance")


urlpatterns = [
    path("health/", health_check),
    path("", include(router.urls)),
]
