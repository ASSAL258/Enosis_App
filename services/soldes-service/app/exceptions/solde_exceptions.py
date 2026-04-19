class SoldeServiceException(Exception):
    pass


class SoldeOperationException(SoldeServiceException):
    pass


class SoldeNotFoundException(SoldeServiceException):
    pass
