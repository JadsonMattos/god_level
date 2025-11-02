"""
Structured logging configuration.
"""

import logging
import sys
from datetime import datetime, timezone

from app.config import settings


class StructuredFormatter(logging.Formatter):
    """Custom formatter for structured logs."""

    def format(self, record: logging.LogRecord) -> str:
        """Format log record with structured data."""
        log_data = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
            "message": record.getMessage(),
        }

        # Add extra fields if present
        if hasattr(record, "extra_data"):
            log_data["extra"] = record.extra_data

        # Add exception info if present
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)

        # Format as JSON-like string (simple format)
        parts = [f"{k}={v}" for k, v in log_data.items() if v]
        return " | ".join(parts)


def setup_logging() -> None:
    """
    Setup structured logging for the application.
    """
    # Get root logger
    logger = logging.getLogger()
    if settings.ENVIRONMENT == "development":
        logger.setLevel(logging.DEBUG)
    else:
        logger.setLevel(logging.INFO)

    # Remove existing handlers
    logger.handlers.clear()

    # Console handler with structured formatter
    console_handler = logging.StreamHandler(sys.stdout)
    environment = settings.ENVIRONMENT
    if environment == "development":
        level = logging.DEBUG
    else:
        level = logging.INFO
    console_handler.setLevel(level)
    console_handler.setFormatter(StructuredFormatter())

    logger.addHandler(console_handler)

    # Log startup message
    logger.info(
        "Logging initialized",
        extra={
            "extra_data": {
                "environment": settings.ENVIRONMENT,
                "log_level": logger.level,
            }
        },
    )


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger instance with the given name.

    Args:
        name: Logger name (usually __name__)

    Returns:
        Logger instance
    """
    return logging.getLogger(name)


# Setup logging on module import
setup_logging()
