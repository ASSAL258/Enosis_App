from django.urls import include, path
from rest_framework.routers import DefaultRouter

from app.views import DeliveredTimeViewSet

router = DefaultRouter()
router.register("delivered-times", DeliveredTimeViewSet, basename="delivered-times")

urlpatterns = [
    path("", include(router.urls)),
]
