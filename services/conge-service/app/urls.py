from django.urls import include, path
from rest_framework.routers import DefaultRouter

from app.views import CongeViewSet

router = DefaultRouter()
router.register("conges", CongeViewSet, basename="conges")

urlpatterns = [
    path("", include(router.urls)),
]
