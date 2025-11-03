"""
Sales endpoints.
"""

from fastapi import APIRouter, Depends, Query, HTTPException
from typing import Optional
from sqlalchemy.orm import Session

from app.services.sales import SalesService
from app.db.session import get_db
from app.utils.date_parser import parse_date_filters
from app.core.exceptions import ValidationError

router = APIRouter()


def get_sales_service(db: Session = Depends(get_db)) -> SalesService:
    """
    Get sales service.

    Args:
        db: Database session

    Returns:
        Sales service instance
    """
    return SalesService(db)


@router.get("/sales")
async def get_sales(
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    store_id: Optional[int] = Query(None),
    channel_id: Optional[int] = Query(None),
    service: SalesService = Depends(get_sales_service),
    db: Session = Depends(get_db)
):
    """
    Get list of sales.

    Args:
        limit: Number of sales to return
        offset: Number of sales to skip
        start_date: Filter by start date (YYYY-MM-DD)
        end_date: Filter by end date (YYYY-MM-DD)
        store_id: Filter by store ID
        channel_id: Filter by channel ID
        service: Sales service
        db: Database session

    Returns:
        List of sales with pagination info
    """
    try:
        # Parse dates using centralized parser
        start, end = parse_date_filters(start_date, end_date)
    except ValidationError:
        # Re-raise validation errors to be handled by global error handler
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao processar filtros de data: {str(e)}")
    
    try:
        # Get sales
        sales = service.get_sales(
            limit=limit,
            offset=offset,
            start_date=start,
            end_date=end,
            store_id=store_id,
            channel_id=channel_id
        )

        # Get total count
        total = service.get_sales_count(
            start_date=start,
            end_date=end,
            store_id=store_id,
            channel_id=channel_id
        )

        # Convert to response format
        sales_data = [
            {
                "id": sale.id,
                "store_id": sale.store_id,
                "customer_id": sale.customer_id,
                "channel_id": sale.channel_id,
                "created_at": sale.created_at.isoformat(),
                "total_amount": float(sale.total_amount),
                "status": sale.sale_status_desc,
            }
            for sale in sales
        ]

        return {
            "data": sales_data,
            "total": total,
            "limit": limit,
            "offset": offset,
            "has_more": offset + limit < total
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
