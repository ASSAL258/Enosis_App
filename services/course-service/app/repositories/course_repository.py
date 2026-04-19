from app.models import Course


class CourseRepository:
    def get_by_id(self, course_id):
        return Course.objects.filter(id=course_id).first()

    def get_all(self):
        return list(Course.objects.all().order_by("-created_at"))

    def get_all_by_user_id(self, user_id):
        return list(Course.objects.filter(user_id=user_id).order_by("-created_at"))

    def create_course(self, course):
        course.save()
        return course

    def update_course(self, course, data):
        for field in [
            "name",
            "code",
            "description",
            "attachment_id",
            "attachment_url",
            "status",
            "city",
            "destination",
            "courier_id",
            "user_id",
        ]:
            if field in data:
                setattr(course, field, data[field])
        course.save()
        return course

    def set_delivered_time_id(self, course, delivered_time_id):
        course.delivered_time_id = delivered_time_id
        course.save(update_fields=["delivered_time_id", "updated_at"])
        return course

    def set_attachment_url(self, course, attachment_url):
        course.attachment_url = attachment_url
        course.save(update_fields=["attachment_url", "updated_at"])
        return course

    def delete_course(self, course):
        course.delete()
