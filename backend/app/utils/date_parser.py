"""
Date parsing utilities to centralize date filter parsing (DRY principle).

This module provides centralized date parsing and validation logic,
eliminating duplication across multiple API endpoints.
"""

from typing import Optional, Tuple
from datetime import datetime

from app.core.exceptions import ValidationError

# Constants for timezone handling
UTC_SUFFIX = "+00:00"


def parse_date_filters(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
) -> Tuple[Optional[datetime], Optional[datetime]]:
    """
    Parse and validate date filters from string to datetime objects.

    Args:
        start_date: Start date string (YYYY-MM-DD or ISO format)
        end_date: End date string (YYYY-MM-DD or ISO format)

    Returns:
        Tuple of (start_datetime, end_datetime), either can be None

    Raises:
        ValidationError: If date format is invalid or start > end
    """
    start = None
    end = None

    if start_date:
        try:
            start = datetime.fromisoformat(start_date.replace("Z", UTC_SUFFIX))
            # Remove timezone for comparison if end_date has no timezone
            if start.tzinfo and (
                not end_date or "Z" not in end_date and "+" not in end_date
            ):
                start = start.replace(tzinfo=None)
        except (ValueError, AttributeError) as e:
            raise ValidationError(
                f"Formato de data inválido: {start_date}", field="start_date"
            ) from e

    if end_date:
        try:
            end = datetime.fromisoformat(end_date.replace("Z", UTC_SUFFIX))
            # Remove timezone for comparison if start_date has no timezone
            if end.tzinfo and (
                not start_date
                or "Z" not in start_date
                and "+" not in start_date
            ):
                end = end.replace(tzinfo=None)
        except (ValueError, AttributeError) as e:
            raise ValidationError(
                f"Formato de data inválido: {end_date}", field="end_date"
            ) from e

    # Validate that start <= end
    if start and end and start > end:
        raise ValidationError(
            "Data inicial deve ser anterior à data final", field="start_date"
        )

    return start, end


def parse_single_date(
    date_str: Optional[str], field_name: str = "date"
) -> Optional[datetime]:
    """
    Parse a single date string.

    Args:
        date_str: Date string to parse
        field_name: Field name for error messages

    Returns:
        Parsed datetime or None

    Raises:
        ValidationError: If date format is invalid
    """
    if not date_str:
        return None

    try:
        date = datetime.fromisoformat(date_str.replace("Z", UTC_SUFFIX))
        return date
    except (ValueError, AttributeError) as e:
        raise ValidationError(
            f"Formato de data inválido: {date_str}", field=field_name
        ) from e
