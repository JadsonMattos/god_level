"""
Query filter builder to centralize common filter logic (DRY principle).

This module provides a centralized way to apply common filters to SQLAlchemy\
    queries,
eliminating code duplication across multiple service methods.
"""

from typing import Optional
from datetime import datetime
from sqlalchemy import extract
from sqlalchemy.orm import Query

from app.models.sale import Sale


class QueryFilterBuilder:
    """Builder for applying common filters to Sale queries."""

    @staticmethod
    def apply_sale_filters(
        query: Query,
        *,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        store_id: Optional[int] = None,
        channel_id: Optional[int] = None,
        day_of_week: Optional[int] = None,
        hour_start: Optional[int] = None,  # 0-23
        hour_end: Optional[int] = None,  # 0-23
    ) -> Query:
        """
        Apply common filters to a Sale query.

        Args:
            query: SQLAlchemy query to filter
            start_date: Filter by start date
            end_date: Filter by end date
            store_id: Filter by store ID
            channel_id: Filter by channel ID
            day_of_week: Filter by day of week (0=Monday, 6=Sunday)
            hour_start: Filter by start hour (0-23)
            hour_end: Filter by end hour (0-23)

        Returns:
            Filtered query
        """
        # Date filters
        if start_date:
            query = query.filter(Sale.created_at >= start_date)
        if end_date:
            query = query.filter(Sale.created_at <= end_date)

        # Entity filters
        if store_id:
            query = query.filter(Sale.store_id == store_id)
        if channel_id:
            query = query.filter(Sale.channel_id == channel_id)

        # Temporal filters
        if day_of_week is not None:
            # PostgreSQL: EXTRACT(DOW FROM timestamp) returns 0-6 (0=Sunday)
            # We convert: 0=Monday to 1=Sunday in PostgreSQL
            # So: 0 (Monday) -> 1, 1 (Tuesday) -> 2, ..., 6 (Sunday) -> 0
            pg_dow = (day_of_week + 1) % 7
            query = query.filter(extract("dow", Sale.created_at) == pg_dow)

        if hour_start is not None:
            query = query.filter(
                extract("hour", Sale.created_at) >= hour_start
            )
        if hour_end is not None:
            query = query.filter(extract("hour", Sale.created_at) <= hour_end)

        return query

    @staticmethod
    def apply_basic_filters(
        query: Query,
        *,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        store_id: Optional[int] = None,
        channel_id: Optional[int] = None,
    ) -> Query:
        """
        Apply basic filters (without temporal filters).

        Args:
            query: SQLAlchemy query to filter
            start_date: Filter by start date
            end_date: Filter by end date
            store_id: Filter by store ID
            channel_id: Filter by channel ID

        Returns:
            Filtered query
        """
        return QueryFilterBuilder.apply_sale_filters(
            query,
            start_date=start_date,
            end_date=end_date,
            store_id=store_id,
            channel_id=channel_id,
        )
