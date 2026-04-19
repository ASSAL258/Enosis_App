from django.urls import include, path
from rest_framework.routers import DefaultRouter

from app.views import PretViewSet

router = DefaultRouter()
router.register("prets", PretViewSet, basename="prets")

urlpatterns = [
    path("", include(router.urls)),
]
