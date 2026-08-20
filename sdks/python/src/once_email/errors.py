class OnceEmailError(Exception):
    """Stable error without response bodies, request URLs, or credentials."""

    def __init__(self, code: str, status: int | None, retryable: bool, retry_after_seconds: int | None = None):
        super().__init__("Once Email API request failed")
        self.code = code
        self.status = status
        self.retryable = retryable
        self.retry_after_seconds = retry_after_seconds
