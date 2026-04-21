import json
import os
from urllib import request

from app.exceptions import CourseNotFoundException, CourseOperationException
from app.models import Course
from app.repositories import CourseRepository


class CourseService:
    def __init__(self):
        self.course_repository = CourseRepository()
        self.course_attachment_service = None

    def _get_attachment_service(self):
        if self.course_attachment_service is None:
            from app.services.course_attachment_service import CourseAttachmentService

            self.course_attachment_service = CourseAttachmentService()
        return self.course_attachment_service

    def _attach_file_metadata(self, courses):
        attachment_ids = [course.attachment_id for course in courses if getattr(course, "attachment_id", None)]
        attachment_map = self._get_attachment_service().get_attachments_by_ids(attachment_ids)

        for course in courses:
            attachment = attachment_map.get(str(course.attachment_id)) if getattr(course, "attachment_id", None) else None
            setattr(course, "attachment_file_name", attachment["file_name"] if attachment else None)

        return courses

    def _resolve_user_ids_by_department(self, department_id):
        user_service_url = os.getenv("USER_SERVICE_URL", "http://user-service:5002").rstrip("/")
        url = f"{user_service_url}/users/"

        try:
            with request.urlopen(url, timeout=5) as response:
                payload = json.loads(response.read().decode("utf-8"))
        except Exception as exc:
            raise CourseOperationException("Failed to resolve users by department") from exc

        users = payload if isinstance(payload, list) else []
        return [
            user.get("id")
            for user in users
            if str(user.get("departement_id") or "") == str(department_id)
        ]

    def get_all_courses(self, filters=None):
        filters = filters or {}

        department_id = filters.get("department")
        user_id_in = None
        if department_id:
            user_id_in = self._resolve_user_ids_by_department(department_id)
            if not user_id_in:
                return []

        has_filters = any(
            filters.get(key)
            for key in ["user_id", "courier_id", "status", "city", "start_date", "end_date", "department"]
        )

        if not has_filters:
            return self._attach_file_metadata(self.course_repository.get_all())

        created_at_date_range = None
        if filters.get("start_date") and filters.get("end_date"):
            created_at_date_range = [filters["start_date"], filters["end_date"]]

        return self._attach_file_metadata(
            self.course_repository.get_all_filtered(
                user_id=filters.get("user_id"),
                courier_id=filters.get("courier_id"),
                status_in=filters.get("status"),
                city_in=filters.get("city"),
                created_at_date_range=created_at_date_range,
                user_id_in=user_id_in,
            )
        )

    def get_course_by_id(self, course_id):
        course = self.course_repository.get_by_id(course_id)
        if course is None:
            raise CourseNotFoundException("Course not found")
        return self._attach_file_metadata([course])[0]

    def get_all_courses_by_user_id(self, user_id):
        return self._attach_file_metadata(self.course_repository.get_all_by_user_id(user_id))

    def create_course(self, data):
        try:
            attachment_file = data.get("attachment_file")

            if attachment_file is None:
                raise CourseOperationException("Attachment file is required")

            attachment_id = self._get_attachment_service().upload_attachment(
                attachment_file=attachment_file,
            )

            course = Course(
                name=data["name"],
                type=data["type"],
                phone_number=data["phone_number"],
                description=data.get("description"),
                attachment_id=attachment_id,
                user_id=data["user_id"],
                status=data.get("status", "pas_affectee"),
                city=data.get("city"),
                destination=data.get("destination"),
                dimensions=data.get("dimensions"),
                weight=data.get("weight"),
                courier_id=data.get("courier_id"),
            )
            return self.course_repository.create_course(course)
        except Exception as exc:
            raise CourseOperationException("Failed to create course") from exc

    def update_course(self, course_id, data):
        course = self.get_course_by_id(course_id)
        try:
            attachment_file = data.get("attachment_file")
            if attachment_file is not None:
                data = dict(data)
                data["attachment_id"] = self._get_attachment_service().upload_attachment(
                    attachment_file=attachment_file,
                    course_id=course_id,
                )
            return self.course_repository.update_course(course, data)
        except Exception as exc:
            raise CourseOperationException("Failed to update course") from exc

    def delete_course(self, course_id):
        course = self.get_course_by_id(course_id)
        try:
            self.course_repository.delete_course(course)
        except Exception as exc:
            raise CourseOperationException("Failed to delete course") from exc

    def attach_delivered_time(self, course_id, delivered_time_id):
        course = self.get_course_by_id(course_id)
        try:
            return self.course_repository.set_delivered_time_id(course, delivered_time_id)
        except Exception as exc:
            raise CourseOperationException("Failed to attach delivered time") from exc

    def assign_courier_to_course(self, course_id, courier_id):
        course = self.get_course_by_id(course_id)

        try:
            if course.status != "pas_affectee":
                raise CourseOperationException("Only pas_affectee courses can be assigned")

            if course.courier_id and str(course.courier_id) != str(courier_id):
                raise CourseOperationException("Course is already assigned to another courier")

            return self.course_repository.update_course(
                course,
                {
                    "courier_id": courier_id,
                    "status": "affectee",
                },
            )
        except CourseOperationException:
            raise
        except Exception as exc:
            raise CourseOperationException("Failed to assign courier") from exc

    def start_delivery(self, course_id, courier_id):
        course = self.get_course_by_id(course_id)

        try:
            if not course.courier_id:
                raise CourseOperationException("Course is not assigned to any courier")

            if str(course.courier_id) != str(courier_id):
                raise CourseOperationException("Course is assigned to another courier")

            if course.status == "termine":
                raise CourseOperationException("Course is already completed")

            if course.status != "affectee":
                raise CourseOperationException("Course must be affectee before starting delivery")

            return self.course_repository.update_course(course, {"status": "en_cours"})
        except CourseOperationException:
            raise
        except Exception as exc:
            raise CourseOperationException("Failed to start delivery") from exc

    def complete_delivery(self, course_id, courier_id):
        course = self.get_course_by_id(course_id)

        try:
            if not course.courier_id:
                raise CourseOperationException("Course is not assigned to any courier")

            if str(course.courier_id) != str(courier_id):
                raise CourseOperationException("Course is assigned to another courier")

            if course.status != "en_cours":
                raise CourseOperationException("Course must be in progress before completion")

            return self.course_repository.update_course(course, {"status": "termine"})
        except CourseOperationException:
            raise
        except Exception as exc:
            raise CourseOperationException("Failed to complete delivery") from exc
