from django.urls import include, path
from rest_framework.routers import DefaultRouter

from app.views import DepartementViewSet, UserViewSet

router = DefaultRouter()
router.register("departements", DepartementViewSet, basename="departements")
router.register("users", UserViewSet, basename="users")

urlpatterns = [
    path("", include(router.urls)),
]
