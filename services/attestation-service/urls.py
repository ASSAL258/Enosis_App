from django.urls import path, include
from django.http import JsonResponse
from rest_framework.routers import DefaultRouter
from app.Views.attestation_view import AttestationViewSet
from .Views.CityView import CityViewSet

def health_check(request):
    return JsonResponse({'status': 'ok', 'service': 'attestation'})

router = DefaultRouter()
router.register(r'attestations', AttestationViewSet, basename='attestation')


urlpatterns = [
    path('health/', health_check),
    path('', include(router.urls)),
]