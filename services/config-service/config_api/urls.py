from django.urls import path

from config_api.views import ConfigViewSet

config_view = ConfigViewSet.as_view({"get": "api_gateway_config"})
services_config_view = ConfigViewSet.as_view({"get": "services_config"})
health_view = ConfigViewSet.as_view({"get": "health"})

urlpatterns = [
    path("health", health_view, name="config-health"),
    path("config/api-gateway", config_view, name="api-gateway-config"),
    path("config/services", services_config_view, name="services-config"),
]
