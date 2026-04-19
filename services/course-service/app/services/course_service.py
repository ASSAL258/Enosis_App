from app.exceptions import CourseNotFoundException, CourseOperationException
from app.models import Course
from app.repositories import CourseRepository


class CourseService:
    def __init__(self):
        self.course_repository = CourseRepository()

    def get_all_courses(self):
        return self.course_repository.get_all()

    def get_course_by_id(self, course_id):
        course = self.course_repository.get_by_id(course_id)
        if course is None:
            raise CourseNotFoundException("Course not found")
        return course

    def get_all_courses_by_user_id(self, user_id):
        return self.course_repository.get_all_by_user_id(user_id)

    def create_course(self, data):
        try:
            course = Course(
                name=data["name"],
                code=data["code"],
                description=data.get("description"),
                attachment_id=data.get("attachment_id"),
                user_id=data["user_id"],
                city=data.get("city"),
                destination=data.get("destination"),
                courier_id=data.get("courier_id"),
            )
            return self.course_repository.create_course(course)
        except Exception as exc:
            raise CourseOperationException("Failed to create course") from exc

    def update_course(self, course_id, data):
        course = self.get_course_by_id(course_id)
        try:
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
