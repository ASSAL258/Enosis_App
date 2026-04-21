import uuid
import base64

from app.exceptions import CourseNotFoundException, CourseOperationException
from app.repositories import CourseAttachmentRepository, CourseRepository


class CourseAttachmentService:
    def __init__(self):
        self.course_repository = CourseRepository()
        self.course_attachment_repository = CourseAttachmentRepository()

    def upload_attachment(self, attachment_file, course_id=None):
        file_name = getattr(attachment_file, "name", "")
        content_type = getattr(attachment_file, "content_type", "")

        if not file_name.lower().endswith(".pdf") and content_type != "application/pdf":
            raise CourseOperationException("Only PDF attachments are allowed")

        content_base64 = base64.b64encode(attachment_file.read()).decode("utf-8")

        attachment_id = uuid.uuid4()
        self.course_attachment_repository.save_attachment(
            attachment_id=attachment_id,
            course_id=course_id,
            file_name=file_name,
            content_type=content_type,
            content_base64=content_base64,
        )

        if course_id is not None:
            course = self.course_repository.get_by_id(course_id)
            if course is None:
                raise CourseNotFoundException("Course not found")
            self.course_repository.set_attachment_id(course, attachment_id)

        return attachment_id

    def get_attachment(self, course_id):
        course = self.course_repository.get_by_id(course_id)
        if course is None:
            raise CourseNotFoundException("Course not found")
        if course.attachment_id is None:
            raise CourseNotFoundException("Attachment not found")

        attachment = self.course_attachment_repository.get_attachment(course.attachment_id)
        if attachment is None:
            raise CourseNotFoundException("Attachment not found")

        return {
            "attachment_id": attachment["_id"],
            "file_name": attachment["file_name"],
            "content_type": attachment["content_type"],
            "content_base64": attachment["content_base64"],
        }

    def get_attachments_by_ids(self, attachment_ids):
        return self.course_attachment_repository.get_attachments_by_ids(attachment_ids)
