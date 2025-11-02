"""
Analytics endpoints.
"""

from fastapi import APIRouter, Depends, Query, HTTPException
from typing import Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.services.analytics import AnalyticsService
from app.db.session import get_db
from app.core.logging import get_logger
from app.core.exceptions import (
    ValidationError,
    DatabaseError,
    NotFoundError,
)
from app.utils.date_parser import parse_date_filters

logger = get_logger(__name__)

router = APIRouter()


def get_analytics_service(db: Session = Depends(get_db)) -> AnalyticsService:
    """Get analytics service."""
    return AnalyticsService(db)


@router.get("/analytics/revenue")
async def get_revenue(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    store_id: Optional[int] = Query(None),
    channel_id: Optional[int] = Query(None),
    group_by: str = Query("day", pattern="^(day|week|month)$"),
    service: AnalyticsService = Depends(get_analytics_service),
):
    """
    Get revenue aggregated by time period.

    Args:
        start_date: Start date (YYYY-MM-DD)
        end_date: End date (YYYY-MM-DD)
        store_id: Filter by store
        channel_id: Filter by channel
        group_by: Group by day, week, or month
        service: Analytics service

    Returns:
        Revenue data by period
    """
    try:
        # Parse dates using centralized parser
        start, end = parse_date_filters(start_date, end_date)

        logger.info(
            "Fetching revenue data",
            extra={
                "extra_data": {
                    "start_date": start_date,
                    "end_date": end_date,
                    "store_id": store_id,
                    "channel_id": channel_id,
                    "group_by": group_by,
                }
            },
        )

        try:
            data = service.get_revenue(
                start_date=start,
                end_date=end,
                store_id=store_id,
                channel_id=channel_id,
                group_by=group_by
            )

            logger.info(
                "Revenue data fetched successfully: %d records", len(data),
                extra={"extra_data": {"record_count": len(data)}}
            )
        except SQLAlchemyError as e:
            logger.error(
                "Database error fetching revenue: %s", str(e), exc_info=True
            )
            raise DatabaseError(
                "Erro ao buscar dados de faturamento",
                operation="get_revenue"
            )

        return {
            "data": data,
            "filters": {
                "start_date": start_date,
                "end_date": end_date
            }
        }
    except (ValidationError, DatabaseError, NotFoundError):
        raise
    except Exception as e:
        logger.critical(
            "Unexpected error in get_revenue: %s", str(e), exc_info=True
        )
        raise


@router.get("/analytics/products")
async def get_top_products(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    store_id: Optional[int] = Query(None),
    channel_id: Optional[int] = Query(None),
    day_of_week: Optional[int] = Query(
        None,
        ge=0,
        le=6,
        description="Day of week (0=Monday, 6=Sunday)"
    ),
    hour_start: Optional[int] = Query(
        None,
        ge=0,
        le=23,
        description="Start hour (0-23)"
    ),
    hour_end: Optional[int] = Query(
        None,
        ge=0,
        le=23,
        description="End hour (0-23)"
    ),
    limit: int = Query(10, ge=1, le=100),
    service: AnalyticsService = Depends(get_analytics_service),
):
    """
    Get top products by quantity sold.

    Args:
        start_date: Start date (YYYY-MM-DD)
        end_date: End date (YYYY-MM-DD)
        store_id: Filter by store
        channel_id: Filter by channel
        day_of_week: Day of week filter (0=Monday, 6=Sunday)
        hour_start: Start hour filter (0-23)
        hour_end: End hour filter (0-23)
        limit: Number of products
        service: Analytics service

    Returns:
        Top products data
    """
    try:
        # Parse dates
        start = None
        end = None

        if start_date:
            try:
                start = datetime.fromisoformat(start_date)
            except ValueError:
                raise ValidationError(
                    f"Formato de data inicial inválido: {start_date}",
                    field="start_date"
                )

        if end_date:
            try:
                end = datetime.fromisoformat(end_date)
            except ValueError:
                raise ValidationError(
                    f"Formato de data final inválido: {end_date}",
                    field="end_date"
                )

        # Validate hour range
        if (
            hour_start is not None
            and hour_end is not None
            and hour_start > hour_end
        ):
            raise ValidationError(
                "hour_start deve ser menor ou igual a hour_end",
                field="hour_range"
            )

        logger.info(
            "Fetching top products",
            extra={
                "extra_data": {
                    "start_date": start_date,
                    "end_date": end_date,
                    "store_id": store_id,
                    "channel_id": channel_id,
                    "day_of_week": day_of_week,
                    "hour_start": hour_start,
                    "hour_end": hour_end,
                    "limit": limit,
                }
            },
        )

        try:
            data = service.get_top_products(
                start_date=start,
                end_date=end,
                store_id=store_id,
                channel_id=channel_id,
                day_of_week=day_of_week,
                hour_start=hour_start,
                hour_end=hour_end,
                limit=limit
            )
        except SQLAlchemyError as e:
            logger.error(
                "Database error fetching products: %s", str(e), exc_info=True
            )
            raise DatabaseError(
                "Erro ao buscar produtos",
                operation="get_top_products",
            )

        return {"data": data}
    except (ValidationError, DatabaseError):
        raise
    except Exception as e:
        logger.critical(
            "Unexpected error in get_top_products: %s",
            str(e),
            exc_info=True
        )
        raise


@router.get("/analytics/channels")
async def get_channel_performance(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    store_id: Optional[int] = Query(None),
    service: AnalyticsService = Depends(get_analytics_service),
):
    """
    Get performance metrics by channel.

    Args:
        start_date: Start date (YYYY-MM-DD)
        end_date: End date (YYYY-MM-DD)
        store_id: Filter by store
        service: Analytics service

    Returns:
        Channel performance data
    """
    try:
        # Parse dates
        # Parse dates using centralized parser
        start, end = parse_date_filters(start_date, end_date)

        data = service.get_channel_performance(
            start_date=start,
            end_date=end,
            store_id=store_id
        )

        return {"data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics/summary")
async def get_metrics_summary(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    store_id: Optional[int] = Query(None),
    channel_id: Optional[int] = Query(None),
    service: AnalyticsService = Depends(get_analytics_service),
):
    """
    Get summary metrics (overview).

    Args:
        start_date: Start date (YYYY-MM-DD)
        end_date: End date (YYYY-MM-DD)
        store_id: Filter by store
        channel_id: Filter by channel
        service: Analytics service

    Returns:
        Summary metrics
    """
    try:
        # Parse dates
        # Parse dates using centralized parser
        start, end = parse_date_filters(start_date, end_date)

        data = service.get_metrics_summary(
            start_date=start,
            end_date=end,
            store_id=store_id,
            channel_id=channel_id
        )

        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics/products-margin")
async def get_products_margin(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    store_id: Optional[int] = Query(None),
    channel_id: Optional[int] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    service: AnalyticsService = Depends(get_analytics_service),
):
    """
    Get products with lowest margin.

    Args:
        start_date: Start date (YYYY-MM-DD)
        end_date: End date (YYYY-MM-DD)
        store_id: Filter by store
        channel_id: Filter by channel
        limit: Number of products to return
        service: Analytics service

    Returns:
        Products with margin analysis
    """
    try:
        # Parse dates
        # Parse dates using centralized parser
        start, end = parse_date_filters(start_date, end_date)

        data = service.get_products_margin(
            start_date=start,
            end_date=end,
            store_id=store_id,
            channel_id=channel_id,
            limit=limit
        )

        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics/delivery-performance")
async def get_delivery_performance(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    store_id: Optional[int] = Query(None),
    group_by: str = Query("day", pattern="^(day|week|month)$"),
    service: AnalyticsService = Depends(get_analytics_service),
):
    """
    Get delivery performance metrics.

    Args:
        start_date: Start date (YYYY-MM-DD)
        end_date: End date (YYYY-MM-DD)
        store_id: Filter by store
        group_by: Group by day, week, or month
        service: Analytics service

    Returns:
        Delivery performance data by period
    """
    try:
        # Parse dates
        # Parse dates using centralized parser
        start, end = parse_date_filters(start_date, end_date)

        data = service.get_delivery_performance(
            start_date=start,
            end_date=end,
            store_id=store_id,
            group_by=group_by
        )

        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics/customer-insights")
async def get_customer_insights(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    store_id: Optional[int] = Query(None),
    service: AnalyticsService = Depends(get_analytics_service),
):
    """
    Get customer insights including churn analysis.

    Args:
        start_date: Start date (YYYY-MM-DD)
        end_date: End date (YYYY-MM-DD)
        store_id: Filter by store
        service: Analytics service

    Returns:
        Customer insights data
    """
    try:
        # Parse dates
        # Parse dates using centralized parser
        start, end = parse_date_filters(start_date, end_date)

        data = service.get_customer_insights(
            start_date=start,
            end_date=end,
            store_id=store_id
        )

        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics/peak-hours-heatmap")
async def get_peak_hours_heatmap(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    store_id: Optional[int] = Query(None),
    channel_id: Optional[int] = Query(None),
    service: AnalyticsService = Depends(get_analytics_service),
):
    """
    Get peak hours heatmap data.

    Args:
        start_date: Start date (YYYY-MM-DD)
        end_date: End date (YYYY-MM-DD)
        store_id: Filter by store
        channel_id: Filter by channel
        service: Analytics service

    Returns:
        Peak hours heatmap data
    """
    try:
        # Parse dates
        # Parse dates using centralized parser
        start, end = parse_date_filters(start_date, end_date)

        data = service.get_peak_hours_heatmap(
            start_date=start,
            end_date=end,
            store_id=store_id,
            channel_id=channel_id
        )

        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics/anomaly-alerts")
async def get_anomaly_alerts(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    store_id: Optional[int] = Query(None),
    service: AnalyticsService = Depends(get_analytics_service),
):
    """
    Get anomaly alerts.

    Args:
        start_date: Start date (YYYY-MM-DD)
        end_date: End date (YYYY-MM-DD)
        store_id: Filter by store
        service: Analytics service

    Returns:
        List of anomaly alerts
    """
    try:
        # Parse dates
        # Parse dates using centralized parser
        start, end = parse_date_filters(start_date, end_date)

        data = service.get_anomaly_alerts(
            start_date=start,
            end_date=end,
            store_id=store_id
        )

        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics/top-items")
async def get_top_items_analysis(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    store_id: Optional[int] = Query(None),
    channel_id: Optional[int] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    service: AnalyticsService = Depends(get_analytics_service),
):
    """
    Get top items/complements analysis.

    Args:
        start_date: Start date (YYYY-MM-DD)
        end_date: End date (YYYY-MM-DD)
        store_id: Filter by store
        channel_id: Filter by channel
        limit: Number of items to return
        service: Analytics service

    Returns:
        Top items with statistics
    """
    try:
        # Parse dates
        # Parse dates using centralized parser
        start, end = parse_date_filters(start_date, end_date)

        data = service.get_top_items_analysis(
            start_date=start,
            end_date=end,
            store_id=store_id,
            channel_id=channel_id,
            limit=limit
        )

        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics/products-customizations")
async def get_products_with_most_customizations(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    store_id: Optional[int] = Query(None),
    channel_id: Optional[int] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    service: AnalyticsService = Depends(get_analytics_service),
):
    """
    Get products that receive most customizations.

    Args:
        start_date: Start date (YYYY-MM-DD)
        end_date: End date (YYYY-MM-DD)
        store_id: Filter by store
        channel_id: Filter by channel
        limit: Number of products to return
        service: Analytics service

    Returns:
        Products with customization statistics
    """
    try:
        # Parse dates
        # Parse dates using centralized parser
        start, end = parse_date_filters(start_date, end_date)

        data = service.get_products_with_most_customizations(
            start_date=start,
            end_date=end,
            store_id=store_id,
            channel_id=channel_id,
            limit=limit
        )

        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics/payment-mix")
async def get_payment_mix_by_channel(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    store_id: Optional[int] = Query(None),
    service: AnalyticsService = Depends(get_analytics_service),
):
    """
    Get payment mix analysis by channel.

    Args:
        start_date: Start date (YYYY-MM-DD)
        end_date: End date (YYYY-MM-DD)
        store_id: Filter by store
        service: Analytics service

    Returns:
        Payment mix data by channel
    """
    try:
        # Parse dates
        # Parse dates using centralized parser
        start, end = parse_date_filters(start_date, end_date)

        data = service.get_payment_mix_by_channel(
            start_date=start,
            end_date=end,
            store_id=store_id
        )

        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics/cancellations")
async def get_cancellations_analysis(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    store_id: Optional[int] = Query(None),
    channel_id: Optional[int] = Query(None),
    service: AnalyticsService = Depends(get_analytics_service),
):
    """Get cancellations analysis."""
    start = None
    end = None

    if start_date:
        try:
            start = datetime.fromisoformat(start_date)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Invalid start_date format",
            )

    if end_date:
        try:
            end = datetime.fromisoformat(end_date)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Invalid end_date format",
            )

    data = service.get_cancellations_analysis(
        start_date=start,
        end_date=end,
        store_id=store_id,
        channel_id=channel_id
    )
    return data


@router.get("/analytics/delivery-performance-by-region")
async def get_delivery_performance_by_region_summary(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    store_id: Optional[int] = Query(None),
    service: AnalyticsService = Depends(get_analytics_service),
):
    """Get delivery performance by region summary."""
    # Parse dates using centralized parser
    start, end = parse_date_filters(start_date, end_date)

    data = service.get_delivery_performance_by_region(
        start_date=start,
        end_date=end,
        store_id=store_id
    )
    return data


@router.get("/analytics/delivery-regions")
async def get_delivery_performance_by_region(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    store_id: Optional[int] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    service: AnalyticsService = Depends(get_analytics_service),
):
    """
    Get delivery performance by region.

    Args:
        start_date: Start date (YYYY-MM-DD)
        end_date: End date (YYYY-MM-DD)
        store_id: Filter by store
        limit: Number of regions to return
        service: Analytics service

    Returns:
        Delivery performance by region
    """
    try:
        # Parse dates
        # Parse dates using centralized parser
        start, end = parse_date_filters(start_date, end_date)

        data = service.get_delivery_performance_by_region(
            start_date=start,
            end_date=end,
            store_id=store_id,
            limit=limit
        )

        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics/store-growth")
async def get_store_growth_analysis(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    min_growth_rate: float = Query(5.0, ge=0, le=100),
    service: AnalyticsService = Depends(get_analytics_service),
):
    """
    Get store growth analysis with linear trend detection.

    Args:
        start_date: Start date (YYYY-MM-DD)
        end_date: End date (YYYY-MM-DD)
        min_growth_rate: Minimum growth rate percentage to consider
        service: Analytics service

    Returns:
        Store growth analysis data
    """
    try:
        # Parse dates
        # Parse dates using centralized parser
        start, end = parse_date_filters(start_date, end_date)

        data = service.get_store_growth_analysis(
            start_date=start,
            end_date=end,
            min_growth_rate=min_growth_rate
        )

        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics/product-seasonality")
async def get_product_seasonality_analysis(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    store_id: Optional[int] = Query(None),
    channel_id: Optional[int] = Query(None),
    min_seasonality_threshold: float = Query(0.3, ge=0, le=1),
    service: AnalyticsService = Depends(get_analytics_service),
):
    """
    Get product seasonality analysis.

    Args:
        start_date: Start date (YYYY-MM-DD)
        end_date: End date (YYYY-MM-DD)
        store_id: Filter by store
        channel_id: Filter by channel
        min_seasonality_threshold: Minimum seasonality score to consider
        service: Analytics service

    Returns:
        Product seasonality analysis data
    """
    try:
        # Parse dates
        # Parse dates using centralized parser
        start, end = parse_date_filters(start_date, end_date)

        data = service.get_product_seasonality_analysis(
            start_date=start,
            end_date=end,
            store_id=store_id,
            channel_id=channel_id,
        )

        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics/promotions")
async def get_promotions_analysis(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    store_id: Optional[int] = Query(None),
    channel_id: Optional[int] = Query(None),
    service: AnalyticsService = Depends(get_analytics_service),
):
    """
    Get promotions and discounts analysis.

    Args:
        start_date: Start date (YYYY-MM-DD)
        end_date: End date (YYYY-MM-DD)
        store_id: Filter by store
        channel_id: Filter by channel
        service: Analytics service

    Returns:
        Promotions analysis data
    """
    try:
        # Parse dates safely
        start = None
        end = None

        if start_date:
            try:
                start = datetime.fromisoformat(start_date)
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid start_date format: {start_date}",
                )

        if end_date:
            try:
                end = datetime.fromisoformat(end_date)
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid end_date format: {end_date}",
                )

        data = service.get_promotions_analysis(
            start_date=start,
            end_date=end,
            store_id=store_id,
            channel_id=channel_id,
        )

        return data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics/inventory")
async def get_inventory_turnover(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    store_id: Optional[int] = Query(None),
    channel_id: Optional[int] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    service: AnalyticsService = Depends(get_analytics_service),
):
    """
    Get inventory turnover analysis.

    Args:
        start_date: Start date (YYYY-MM-DD)
        end_date: End date (YYYY-MM-DD)
        store_id: Filter by store
        channel_id: Filter by channel
        limit: Number of products to return
        service: Analytics service

    Returns:
        Inventory turnover analysis
    """
    try:
        # Parse dates safely
        start = None
        end = None

        if start_date:
            try:
                start = datetime.fromisoformat(start_date)
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid start_date format: {start_date}"
                )

        if end_date:
            try:
                end = datetime.fromisoformat(end_date)
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid end_date format: {end_date}"
                )

        data = service.get_inventory_turnover_analysis(
            start_date=start,
            end_date=end,
            store_id=store_id,
            channel_id=channel_id,
            limit=limit
        )

        return {"data": data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics/anomalies")
async def get_anomalies_detection(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    store_id: Optional[int] = Query(None),
    service: AnalyticsService = Depends(get_analytics_service),
):
    """
    Get anomaly alerts and detection.

    Args:
        start_date: Start date (YYYY-MM-DD)
        end_date: End date (YYYY-MM-DD)
        store_id: Filter by store
        service: Analytics service

    Returns:
        Anomaly alerts data
    """
    try:
        # Parse dates safely
        start = None
        end = None

        if start_date:
            try:
                start = datetime.fromisoformat(start_date)
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid start_date format: {start_date}"
                )

        if end_date:
            try:
                end = datetime.fromisoformat(end_date)
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid end_date format: {end_date}"
                )

        data = service.get_anomaly_alerts(
            start_date=start,
            end_date=end,
            store_id=store_id
        )

        return {"data": data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
