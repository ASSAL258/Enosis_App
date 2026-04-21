from app.models import Course


class CourseRepository:
    def get_by_id(self, course_id):
        return Course.objects.filter(id=course_id).first()

    def get_all(self):
        return list(Course.objects.all().order_by("-created_at"))

    def get_all_filtered(
        self,
        *,
        user_id=None,
        courier_id=None,
        status_in=None,
        city_in=None,
        created_at_date_range=None,
        user_id_in=None,
    ):
        queryset = Course.objects.all()

        if user_id:
            queryset = queryset.filter(user_id=user_id)

        if courier_id:
            queryset = queryset.filter(courier_id=courier_id)

        if status_in:
            queryset = queryset.filter(status__in=status_in)

        if city_in:
            queryset = queryset.filter(city__in=city_in)

        if created_at_date_range:
            queryset = queryset.filter(created_at__date__range=created_at_date_range)

        if user_id_in is not None:
            queryset = queryset.filter(user_id__in=user_id_in)

        return list(queryset.order_by("-created_at"))

    def get_all_by_user_id(self, user_id):
        return list(Course.objects.filter(user_id=user_id).order_by("-created_at"))

    def create_course(self, course):
        course.save()
        return course

    def update_course(self, course, data):
        for field in [
            "name",
            "type",
            "phone_number",
            "description",
            "attachment_id",
            "status",
            "city",
            "destination",
            "dimensions",
            "weight",
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

    def set_attachment_id(self, course, attachment_id):
        course.attachment_id = attachment_id
        course.save(update_fields=["attachment_id", "updated_at"])
        return course

    def delete_course(self, course):
        course.delete()
