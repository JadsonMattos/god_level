"""
Sales service.
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime

from app.models.sale import Sale
from app.models.store import Store
from app.models.channel import Channel
from app.services.query_filter_builder import QueryFilterBuilder


class SalesService:
    """Service for sales operations."""

    def __init__(self, db: Session):
        """
        Initialize sales service.

        Args:
            db: Database session
        """
        self.db = db

    def get_sales(
        self,
        limit: int = 10,
        offset: int = 0,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        store_id: Optional[int] = None,
        channel_id: Optional[int] = None,
    ) -> List[Sale]:
        """
        Get list of sales.

        Args:
            limit: Number of sales to return
            offset: Number of sales to skip
            start_date: Filter by start date
            end_date: Filter by end date
            store_id: Filter by store ID
            channel_id: Filter by channel ID

        Returns:
            List of sales
        """
        query = (
            self.db.query(Sale)
            .join(Store, Sale.store_id == Store.id)
            .join(Channel, Sale.channel_id == Channel.id)
            .options()
        )

        # Apply filters using centralized builder
        query = QueryFilterBuilder.apply_basic_filters(
            query,
            start_date=start_date,
            end_date=end_date,
            store_id=store_id,
            channel_id=channel_id,
        )

        # Order by created_at descending
        query = query.order_by(desc(Sale.created_at))

        # Apply pagination
        return query.limit(limit).offset(offset).all()

    def get_sale_by_id(self, sale_id: int) -> Optional[Sale]:
        """
        Get sale by ID.

        Args:
            sale_id: Sale ID

        Returns:
            Sale data or None
        """
        return self.db.query(Sale).filter(Sale.id == sale_id).first()

    def get_sales_count(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        store_id: Optional[int] = None,
        channel_id: Optional[int] = None,
    ) -> int:
        """
        Get total count of sales.

        Args:
            start_date: Filter by start date
            end_date: Filter by end date
            store_id: Filter by store ID
            channel_id: Filter by channel ID

        Returns:
            Total count of sales
        """
        query = self.db.query(func.count(Sale.id))

        # Apply filters using centralized builder
        query = QueryFilterBuilder.apply_basic_filters(
            query,
            start_date=start_date,
            end_date=end_date,
            store_id=store_id,
            channel_id=channel_id,
        )

        return query.scalar() or 0
