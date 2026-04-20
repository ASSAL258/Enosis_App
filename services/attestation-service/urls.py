from django.urls import path, include
from rest_framework.routers import DefaultRouter
from app.views.attestation_view import AttestationViewSet

router = DefaultRouter()
router.register(r"attestations", AttestationViewSet, basename="attestation")

urlpatterns = [
    path("", include(router.urls)),
]
