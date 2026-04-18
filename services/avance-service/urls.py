from django.urls import path, include
from django.http import JsonResponse
from rest_framework.routers import DefaultRouter
from app.Views.avance_view import AvanceViewSet
from .Views.CityView import CityViewSet

def health_check(request):
    return JsonResponse({'status': 'ok', 'service': 'course'})

router = DefaultRouter()
router.register(r'avances', AvanceViewSet, basename='avance')


urlpatterns = [
    path('health/', health_check),
    path('', include(router.urls)),
]