from django.urls import include, path, re_path
from rest_framework.routers import DefaultRouter
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions

from app.views import DeliveredTimeViewSet

schema_view = get_schema_view(
    openapi.Info(
        title="Courier-Time Service API",
        default_version="v1",
        description="Swagger documentation for Courier-Time Service endpoints",
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

router = DefaultRouter()
router.register("delivered-times", DeliveredTimeViewSet, basename="delivered-times")

urlpatterns = [
    path("", include(router.urls)),
    re_path(r"^swagger(?P<format>\.json|\.yaml)$", schema_view.without_ui(cache_timeout=0), name="schema-json"),
    path("swagger/", schema_view.with_ui("swagger", cache_timeout=0), name="schema-swagger-ui"),
    path("docs/", schema_view.with_ui("swagger", cache_timeout=0), name="schema-docs"),
    path("redoc/", schema_view.with_ui("redoc", cache_timeout=0), name="schema-redoc"),
]
