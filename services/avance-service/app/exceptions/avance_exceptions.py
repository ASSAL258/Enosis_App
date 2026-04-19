class AvanceServiceException(Exception):
    pass


class AvanceOperationException(AvanceServiceException):
    pass


class AvanceNotFoundException(AvanceServiceException):
    pass
