from django.urls import include, path
from rest_framework.routers import DefaultRouter

from app.views import FeedbackUserViewSet

router = DefaultRouter()
router.register("feedback-users", FeedbackUserViewSet, basename="feedback-users")

urlpatterns = [
    path("", include(router.urls)),
]
