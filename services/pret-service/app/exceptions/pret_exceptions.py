class PretServiceException(Exception):
    pass


class PretOperationException(PretServiceException):
    pass


class PretNotFoundException(PretServiceException):
    pass
