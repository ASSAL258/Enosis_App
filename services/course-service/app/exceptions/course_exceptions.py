class CourseServiceException(Exception):
    pass


class CourseOperationException(CourseServiceException):
    pass


class CourseNotFoundException(CourseServiceException):
    pass
