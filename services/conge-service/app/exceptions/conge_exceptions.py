class CongeServiceException(Exception):
    pass


class CongeOperationException(CongeServiceException):
    pass


class CongeNotFoundException(CongeServiceException):
    pass
