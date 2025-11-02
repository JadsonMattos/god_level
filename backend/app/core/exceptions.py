"""
Custom exceptions for better error handling.
"""

from typing import Optional, Any


class AnalyticsError(Exception):
    """Base exception for analytics errors."""

    def __init__(
        self,
        message: str,
        status_code: int = 500,
        details: Optional[dict[str, Any]] = None,
    ):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class NotFoundError(AnalyticsError):
    """Resource not found error."""

    def __init__(self, resource: str, identifier: Any = None):
        message = f"{resource} not found"
        if identifier:
            message += f" (id: {identifier})"
        super().__init__(
            message,
            status_code=404,
            details={"resource": resource},
        )


class ValidationError(AnalyticsError):
    """Validation error."""

    def __init__(self, message: str, field: Optional[str] = None):
        details = {}
        if field:
            details["field"] = field
        super().__init__(message, status_code=400, details=details)


class DatabaseError(AnalyticsError):
    """Database operation error."""

    def __init__(self, message: str, operation: Optional[str] = None):
        details = {}
        if operation:
            details["operation"] = operation
        super().__init__(
            message,
            status_code=503,
            details=details,
        )


class AuthenticationError(AnalyticsError):
    """Authentication error."""

    def __init__(self, message: str = "Authentication failed"):
        super().__init__(message, status_code=401)


class AuthorizationError(AnalyticsError):
    """Authorization error."""

    def __init__(self, message: str = "Not authorized"):
        super().__init__(message, status_code=403)


class RateLimitError(AnalyticsError):
    """Rate limit exceeded error."""

    def __init__(self, message: str = "Rate limit exceeded"):
        super().__init__(message, status_code=429)
