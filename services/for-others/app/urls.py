from django.urls import include, path
from rest_framework.routers import DefaultRouter
from app.views.for_other_view import ForOtherViewSet

router = DefaultRouter()
router.register("for-others", ForOtherViewSet, basename="for-others")

urlpatterns = [path("", include(router.urls))]
