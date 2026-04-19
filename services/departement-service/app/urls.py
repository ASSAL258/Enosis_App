from django.urls import include, path
from rest_framework.routers import DefaultRouter

from app.views import DepartementViewSet

router = DefaultRouter()
router.register("departements", DepartementViewSet, basename="departements")

urlpatterns = [
    path("", include(router.urls)),
]
