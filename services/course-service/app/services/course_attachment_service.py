import uuid

from app.exceptions import CourseNotFoundException, CourseOperationException
from app.repositories import CourseAttachmentRepository, CourseRepository


class CourseAttachmentService:
    def __init__(self):
        self.course_repository = CourseRepository()
        self.course_attachment_repository = CourseAttachmentRepository()

    def upload_attachment(self, course_id, file_name, content_type, content_base64):
        course = self.course_repository.get_by_id(course_id)
        if course is None:
            raise CourseNotFoundException("Course not found")

        attachment_id = uuid.uuid4()
        self.course_attachment_repository.save_attachment(
            attachment_id=attachment_id,
            course_id=course_id,
            file_name=file_name,
            content_type=content_type,
            content_base64=content_base64,
        )
        self.course_repository.set_attachment_url(course, attachment_id)
        return attachment_id

    def get_attachment(self, course_id):
        course = self.course_repository.get_by_id(course_id)
        if course is None:
            raise CourseNotFoundException("Course not found")
        if course.attachment_url is None:
            raise CourseNotFoundException("Attachment not found")

        attachment = self.course_attachment_repository.get_attachment(course.attachment_url)
        if attachment is None:
            raise CourseNotFoundException("Attachment not found")

        return {
            "attachment_url": attachment["_id"],
            "file_name": attachment["file_name"],
            "content_type": attachment["content_type"],
            "content_base64": attachment["content_base64"],
        }
