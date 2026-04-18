from django.urls import include, path

urlpatterns = [
    path("", include("config_api.urls")),
]
