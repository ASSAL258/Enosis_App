from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import FormParser, MultiPartParser, JSONParser
from rest_framework.viewsets import ViewSet

from app.exceptions import CourseNotFoundException, CourseOperationException
from app.serializers import (
    CourseAssignCourierSerializer,
    CourseAttachDeliveredTimeSerializer,
    CourseAttachmentUploadSerializer,
    CourseCreateSerializer,
    CourseSerializer,
    CourseUpdateSerializer,
)
from app.services.course_attachment_service import CourseAttachmentService
from app.services.course_service import CourseService


class CourseViewSet(ViewSet):
    parser_classes = [JSONParser, FormParser, MultiPartParser]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.course_service = CourseService()
        self.course_attachment_service = CourseAttachmentService()

    def list(self, request):
        try:
            status_values = request.query_params.getlist("status")
            city_values = request.query_params.getlist("city")

            status_csv = request.query_params.get("status_in")
            city_csv = request.query_params.get("city_in")

            if status_csv:
                status_values.extend([value.strip() for value in status_csv.split(",") if value.strip()])

            if city_csv:
                city_values.extend([value.strip() for value in city_csv.split(",") if value.strip()])

            filters = {
                "user_id": request.query_params.get("user_id"),
                "courier_id": request.query_params.get("courier_id"),
                "status": list(dict.fromkeys(status_values)) if status_values else None,
                "city": list(dict.fromkeys(city_values)) if city_values else None,
                "start_date": request.query_params.get("start_date"),
                "end_date": request.query_params.get("end_date"),
                "department": request.query_params.get("department"),
            }

            courses = self.course_service.get_all_courses(filters=filters)
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

    @swagger_auto_schema(
        method="post",
        operation_summary="Create course",
        operation_description="Create a new course record. Supports optional PDF attachment upload.",
        request_body=CourseCreateSerializer,
        responses={
            201: CourseSerializer,
        },
    )
    @action(detail=False, methods=["post"], url_path="create")
    def create_course(self, request):
        try:
            serializer = CourseCreateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            course = self.course_service.create_course(serializer.validated_data)
            course = self.course_service.get_course_by_id(course.id)
            return Response(CourseSerializer(course).data, status=status.HTTP_201_CREATED)
        except CourseOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    def create(self, request):
        try:
            serializer = CourseCreateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            course = self.course_service.create_course(serializer.validated_data)
            course = self.course_service.get_course_by_id(course.id)
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
                    "attachment_id": openapi.Schema(type=openapi.TYPE_STRING),
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
                    "attachment_id": openapi.Schema(type=openapi.TYPE_STRING),
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
                attachment_id = self.course_attachment_service.upload_attachment(
                    attachment_file=serializer.validated_data["attachment_file"],
                    course_id=pk,
                )
                return Response({"attachment_id": str(attachment_id)}, status=status.HTTP_201_CREATED)

            attachment = self.course_attachment_service.get_attachment(pk)
            return Response(attachment)
        except CourseNotFoundException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except CourseOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        method="post",
        operation_summary="Assign course to courier",
        operation_description="Assigns the selected course to the courier and marks it as affectee.",
        request_body=CourseAssignCourierSerializer,
        responses={200: CourseSerializer},
    )
    @action(detail=True, methods=["post"], url_path="assign-courier")
    def assign_courier(self, request, pk=None):
        try:
            serializer = CourseAssignCourierSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            course = self.course_service.assign_courier_to_course(pk, serializer.validated_data["courier_id"])
            course = self.course_service.get_course_by_id(course.id)
            return Response(CourseSerializer(course).data)
        except CourseNotFoundException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except CourseOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        method="post",
        operation_summary="Start delivery",
        operation_description="Marks a course as en_cours for the assigned courier.",
        request_body=CourseAssignCourierSerializer,
        responses={200: CourseSerializer},
    )
    @action(detail=True, methods=["post"], url_path="start-delivery")
    def start_delivery(self, request, pk=None):
        try:
            serializer = CourseAssignCourierSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            course = self.course_service.start_delivery(pk, serializer.validated_data["courier_id"])
            course = self.course_service.get_course_by_id(course.id)
            return Response(CourseSerializer(course).data)
        except CourseNotFoundException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except CourseOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        method="post",
        operation_summary="Complete delivery",
        operation_description="Marks a course as termine for the assigned courier.",
        request_body=CourseAssignCourierSerializer,
        responses={200: CourseSerializer},
    )
    @action(detail=True, methods=["post"], url_path="complete-delivery")
    def complete_delivery(self, request, pk=None):
        try:
            serializer = CourseAssignCourierSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            course = self.course_service.complete_delivery(pk, serializer.validated_data["courier_id"])
            course = self.course_service.get_course_by_id(course.id)
            return Response(CourseSerializer(course).data)
        except CourseNotFoundException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except CourseOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        method="post",
        operation_summary="Attach delivered-time record",
        operation_description="Links an existing delivered-time record to the course.",
        request_body=CourseAttachDeliveredTimeSerializer,
        responses={200: CourseSerializer},
    )
    @action(detail=True, methods=["post"], url_path="attach-delivered-time")
    def attach_delivered_time(self, request, pk=None):
        try:
            serializer = CourseAttachDeliveredTimeSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            course = self.course_service.attach_delivered_time(pk, serializer.validated_data["delivered_time_id"])
            course = self.course_service.get_course_by_id(course.id)
            return Response(CourseSerializer(course).data)
        except CourseNotFoundException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except CourseOperationException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
