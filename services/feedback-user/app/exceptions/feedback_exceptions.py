class FeedbackServiceException(Exception):
    pass


class FeedbackNotFoundException(FeedbackServiceException):
    pass


class FeedbackOperationException(FeedbackServiceException):
    pass
