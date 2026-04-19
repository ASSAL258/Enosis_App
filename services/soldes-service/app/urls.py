from django.urls import include, path
from rest_framework.routers import DefaultRouter

from app.views import SoldeViewSet

router = DefaultRouter()
router.register("soldes", SoldeViewSet, basename="soldes")

urlpatterns = [
    path("", include(router.urls)),
]
