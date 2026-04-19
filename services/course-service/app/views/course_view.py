from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from app.exceptions import CourseNotFoundException, CourseOperationException
from app.serializers import (
    CourseAttachmentUploadSerializer,
    CourseCreateSerializer,
    CourseSerializer,
    CourseUpdateSerializer,
)
from app.services.course_attachment_service import CourseAttachmentService
from app.services.course_service import CourseService


class CourseViewSet(ViewSet):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.course_service = CourseService()
        self.course_attachment_service = CourseAttachmentService()

    def list(self, _request):
        try:
            courses = self.course_service.get_all_courses()
            return Response(CourseSerializer(courses, many=True).data)
        except CourseOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, _request, pk=None):
        try:
            course = self.course_service.get_course_by_id(pk)
            return Response(CourseSerializer(course).data)
        except CourseNotFoundException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except CourseOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["get"], url_path=r"user/(?P<user_id>[^/.]+)")
    def get_all_by_user_id(self, _request, user_id=None):
        try:
            courses = self.course_service.get_all_courses_by_user_id(user_id)
            return Response(CourseSerializer(courses, many=True).data)
        except CourseOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    def create(self, request):
        try:
            serializer = CourseCreateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            course = self.course_service.create_course(serializer.validated_data)
            return Response(CourseSerializer(course).data, status=status.HTTP_201_CREATED)
        except CourseOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        try:
            serializer = CourseUpdateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            course = self.course_service.update_course(pk, serializer.validated_data)
            return Response(CourseSerializer(course).data)
        except CourseNotFoundException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except CourseOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, _request, pk=None):
        try:
            self.course_service.delete_course(pk)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except CourseNotFoundException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except CourseOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        method="post",
        operation_summary="Upload course attachment",
        operation_description="Stores attachment content in MongoDB and links the generated UUID to the course.",
        request_body=CourseAttachmentUploadSerializer,
        responses={
            201: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    "attachment_url": openapi.Schema(type=openapi.TYPE_STRING),
                },
            ),
            404: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={"detail": openapi.Schema(type=openapi.TYPE_STRING)},
            ),
        },
    )
    @swagger_auto_schema(
        method="get",
        operation_summary="Get course attachment",
        operation_description="Returns attachment metadata and content saved in MongoDB for the course.",
        responses={
            200: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    "attachment_url": openapi.Schema(type=openapi.TYPE_STRING),
                    "file_name": openapi.Schema(type=openapi.TYPE_STRING),
                    "content_type": openapi.Schema(type=openapi.TYPE_STRING),
                    "content_base64": openapi.Schema(type=openapi.TYPE_STRING),
                },
            ),
            404: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={"detail": openapi.Schema(type=openapi.TYPE_STRING)},
            ),
        },
    )
    @action(detail=True, methods=["get", "post"], url_path="attachment")
    def attachment(self, request, pk=None):
        try:
            if request.method == "POST":
                serializer = CourseAttachmentUploadSerializer(data=request.data)
                serializer.is_valid(raise_exception=True)
                attachment_url = self.course_attachment_service.upload_attachment(
                    course_id=pk,
                    file_name=serializer.validated_data["file_name"],
                    content_type=serializer.validated_data["content_type"],
                    content_base64=serializer.validated_data["content_base64"],
                )
                return Response({"attachment_url": str(attachment_url)}, status=status.HTTP_201_CREATED)

            attachment = self.course_attachment_service.get_attachment(pk)
            return Response(attachment)
        except CourseNotFoundException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except CourseOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
