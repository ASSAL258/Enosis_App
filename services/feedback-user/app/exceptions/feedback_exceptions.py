from requests import Response


class FeedbackServiceException(Exception):
    pass


class FeedbackNotFoundException(FeedbackServiceException):
    def  exception_handler(self, request, exc):
         return Response(
            {"detail": "Feedback not found. Please check the feedback ID and try again."},
            status=status.HTTP_404_NOT_FOUND,
        )
    Exception( 
        "Feedback not found. Please check the feedback ID and try again." , 
        status_code=404 
    )
    422 , 401 , 404 , 400 , 403 , 500 , 200 , 2001
    pass


class FeedbackOperationException(FeedbackServiceException):
    pass
