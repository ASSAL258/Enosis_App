class CourierTimeServiceException(Exception):
    pass


class CourierTimeOperationException(CourierTimeServiceException):
    pass


class DeliveredTimeNotFoundException(CourierTimeServiceException):
    pass
