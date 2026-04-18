from django.urls import include, path
from rest_framework.routers import DefaultRouter

from app.views import AuthViewSet, RoleViewSet

router = DefaultRouter()
router.register("auth", AuthViewSet, basename="auth")
router.register("roles", RoleViewSet, basename="roles")

urlpatterns = [
    path("", include(router.urls)),
]
