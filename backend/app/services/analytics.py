"""
Analytics service with aggregations.
"""

from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, extract
from datetime import datetime, timedelta

from app.models.sale import Sale
from app.models.store import Store
from app.models.channel import Channel
from app.models.product_sale import ProductSale
from app.models.product import Product
from app.models.delivery_sale import DeliverySale
from app.services.cache import cache_result
from app.services.query_filter_builder import QueryFilterBuilder


class AnalyticsService:
    """Service for analytics and aggregations."""

    def __init__(self, db: Session):
        """
        Initialize analytics service.

        Args:
            db: Database session
        """
        self.db = db

    @cache_result(prefix="revenue", ttl=300)  # 5 minutes cache
    def get_revenue(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        store_id: Optional[int] = None,
        channel_id: Optional[int] = None,
        group_by: str = "day",
    ) -> List[Dict]:
        """
        Get revenue aggregated by time period.

        Args:
            start_date: Start date filter
            end_date: End date filter
            store_id: Store filter
            channel_id: Channel filter
            group_by: 'day', 'week', 'month'

        Returns:
            List of revenue data by period
        """
        # Use database-specific date truncation
        try:
            db_url = str(self.db.bind.url)
        except AttributeError:
            # For test connections, use SQLite-compatible approach
            db_url = "sqlite:///test.db"

        if "sqlite" in db_url:
            # SQLite doesn't have date_trunc, use strftime
            if group_by == "day":
                date_expr = func.strftime("%Y-%m-%d", Sale.created_at)
            elif group_by == "week":
                date_expr = func.strftime("%Y-%W", Sale.created_at)
            elif group_by == "month":
                date_expr = func.strftime("%Y-%m", Sale.created_at)
            else:
                date_expr = func.strftime("%Y-%m-%d", Sale.created_at)
        else:
            # PostgreSQL/MySQL date_trunc
            date_expr = func.date_trunc(group_by, Sale.created_at)

        query = self.db.query(
            date_expr.label("period"),
            func.sum(Sale.total_amount).label("revenue"),
            func.count(Sale.id).label("sales_count"),
            func.avg(Sale.total_amount).label("avg_ticket"),
        ).filter(Sale.sale_status_desc == "COMPLETED")

        # Apply filters using centralized builder
        query = QueryFilterBuilder.apply_basic_filters(
            query,
            start_date=start_date,
            end_date=end_date,
            store_id=store_id,
            channel_id=channel_id,
        )

        # Group and order
        query = query.group_by("period").order_by("period")

        results = query.all()

        return [
            {
                "period": str(row.period)[:10],  # Truncate to YYYY-MM-DD
                "revenue": float(row.revenue) if row.revenue else 0,
                "sales_count": row.sales_count,
                "avg_ticket": float(row.avg_ticket) if row.avg_ticket else 0,
            }
            for row in results
        ]

    @cache_result(prefix="products", ttl=300)  # 5 minutes cache
    def get_top_products(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        store_id: Optional[int] = None,
        channel_id: Optional[int] = None,
        day_of_week: Optional[int] = None,
        hour_start: Optional[int] = None,  # 0-23
        hour_end: Optional[int] = None,  # 0-23
        limit: int = 10,
    ) -> List[Dict]:
        """
        Get top products by quantity sold.

        Args:
            start_date: Start date filter
            end_date: End date filter
            store_id: Store filter
            channel_id: Channel filter
            day_of_week: Day of week filter (0=Monday, 6=Sunday)
            hour_start: Start hour filter (0-23)
            hour_end: End hour filter (0-23)
            limit: Number of top products

        Returns:
            List of top products
        """
        query = (
            self.db.query(
                Product.name,
                func.sum(ProductSale.quantity).label("total_quantity"),
                func.count(ProductSale.id).label("sales_count"),
                func.sum(ProductSale.total_price).label("total_revenue"),
                func.avg(ProductSale.total_price).label("avg_price"),
            )
            .join(Product, ProductSale.product_id == Product.id)
            .join(Sale, ProductSale.sale_id == Sale.id)
            .filter(Sale.sale_status_desc == "COMPLETED")
        )

        # Apply filters using centralized builder
        query = QueryFilterBuilder.apply_sale_filters(
            query,
            start_date=start_date,
            end_date=end_date,
            store_id=store_id,
            channel_id=channel_id,
            day_of_week=day_of_week,
            hour_start=hour_start,
            hour_end=hour_end,
        )

        # Group, order and limit
        query = (
            query.group_by(Product.id, Product.name)
            .order_by(desc("total_quantity"))
            .limit(limit)
        )

        results = query.all()

        return [
            {
                "product_name": row.name,
                "total_quantity": float(row.total_quantity or 0),
                "sales_count": row.sales_count,
                "total_revenue": float(row.total_revenue or 0),
                "avg_price": float(row.avg_price or 0),
            }
            for row in results
        ]

    @cache_result(prefix="channels", ttl=300)  # 5 minutes cache
    def get_channel_performance(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        store_id: Optional[int] = None,
    ) -> List[Dict]:
        """
        Get performance metrics by channel.

        Args:
            start_date: Start date filter
            end_date: End date filter
            store_id: Store filter

        Returns:
            List of channel performance data
        """
        query = (
            self.db.query(
                Channel.name,
                Channel.type,
                func.sum(Sale.total_amount).label("total_revenue"),
                func.count(Sale.id).label("sales_count"),
                func.avg(Sale.total_amount).label("avg_ticket"),
            )
            .join(Sale, Sale.channel_id == Channel.id)
            .filter(Sale.sale_status_desc == "COMPLETED")
        )

        # Apply filters using centralized builder
        query = QueryFilterBuilder.apply_basic_filters(
            query, start_date=start_date, end_date=end_date, store_id=store_id
        )

        # Group by and order (fix line length for linter)
        query = query.group_by(
            Channel.id, Channel.name, Channel.type
        ).order_by(desc("total_revenue"))

        results = query.all()

        return [
            {
                "channel_name": row.name,
                "channel_type": row.type,
                "total_revenue": (
                    float(row.total_revenue) if row.total_revenue else 0
                ),
                "sales_count": row.sales_count,
                "avg_ticket": (float(row.avg_ticket) if row.avg_ticket else 0),
            }
            for row in results
        ]

    @cache_result(prefix="summary", ttl=300)  # 5 minutes cache
    def get_metrics_summary(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        store_id: Optional[int] = None,
        channel_id: Optional[int] = None,
    ) -> Dict:
        """
        Get summary metrics.

        Returns:
            Dict with total revenue, sales count, avg ticket, etc.
        """
        query = self.db.query(
            func.sum(Sale.total_amount).label("total_revenue"),
            func.count(Sale.id).label("sales_count"),
            func.avg(Sale.total_amount).label("avg_ticket"),
            func.min(Sale.created_at).label("first_sale"),
            func.max(Sale.created_at).label("last_sale"),
        ).filter(Sale.sale_status_desc == "COMPLETED")

        # Apply filters using centralized builder
        query = QueryFilterBuilder.apply_basic_filters(
            query,
            start_date=start_date,
            end_date=end_date,
            store_id=store_id,
            channel_id=channel_id,
        )

        result = query.first()

        return {
            "total_revenue": (
                float(result.total_revenue) if result.total_revenue else 0
            ),
            "sales_count": (
                result.sales_count if result.sales_count is not None else 0
            ),
            "avg_ticket": float(result.avg_ticket) if result.avg_ticket else 0,
            "first_sale": (
                result.first_sale.isoformat() if result.first_sale else None
            ),
            "last_sale": (
                result.last_sale.isoformat() if result.last_sale else None
            ),
        }

    @cache_result(prefix="margin", ttl=300)
    def get_products_margin(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        store_id: Optional[int] = None,
        channel_id: Optional[int] = None,
        limit: int = 20,
    ) -> List[Dict]:
        """
        Get products with lowest margin.

        Args:
            start_date: Start date filter
            end_date: End date filter
            store_id: Store filter
            channel_id: Channel filter
            limit: Number of products to return

        Returns:
            List of products with margin analysis
        """
        query = (
            self.db.query(
                Product.id,
                Product.name,
                func.avg(ProductSale.base_price).label("avg_price"),
                func.avg(ProductSale.base_price * 0.7).label("avg_cost"),
                (
                    func.avg(ProductSale.base_price)
                    - func.avg(ProductSale.base_price * 0.7)
                ).label("margin"),
                func.sum(ProductSale.quantity).label("total_quantity"),
                func.sum(ProductSale.total_price).label("total_revenue"),
            )
            .join(ProductSale, ProductSale.product_id == Product.id)
            .join(Sale, Sale.id == ProductSale.sale_id)
        )

        # Apply filters using centralized builder
        query = QueryFilterBuilder.apply_basic_filters(
            query,
            start_date=start_date,
            end_date=end_date,
            store_id=store_id,
            channel_id=channel_id,
        )

        # Group by product and filter products with margin > 0
        query = (
            query.group_by(Product.id, Product.name)
            .having(
                (
                    func.avg(ProductSale.base_price)
                    - func.avg(ProductSale.base_price * 0.7)
                )
                > 0
            )
            .order_by(
                (
                    func.avg(ProductSale.base_price)
                    - func.avg(ProductSale.base_price * 0.7)
                )
            )
            .limit(limit)
        )

        results = query.all()

        return [
            {
                "product_id": r.id,
                "product_name": r.name,
                "avg_price": float(r.avg_price) if r.avg_price else 0,
                "avg_cost": float(r.avg_cost) if r.avg_cost else 0,
                "margin": float(r.margin) if r.margin else 0,
                "margin_percentage": (
                    float(r.margin) / float(r.avg_price) * 100
                    if r.avg_price and r.margin
                    else 0
                ),
                "total_quantity": (
                    float(r.total_quantity) if r.total_quantity else 0
                ),
                "total_revenue": (
                    float(r.total_revenue) if r.total_revenue else 0
                ),
            }
            for r in results
        ]

    @cache_result(prefix="delivery", ttl=300)
    def get_delivery_performance(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        store_id: Optional[int] = None,
        group_by: str = "day",
    ) -> List[Dict]:
        """
        Get delivery performance metrics.

        Args:
            start_date: Start date filter
            end_date: End date filter
            store_id: Store filter
            group_by: 'day', 'week', 'month'

        Returns:
            List of delivery performance by time period
        """
        query = self.db.query(
            Sale.id, Sale.created_at, Sale.delivery_seconds, Sale.store_id
        ).filter(Sale.delivery_seconds.isnot(None))

        # Apply filters using centralized builder
        query = QueryFilterBuilder.apply_basic_filters(
            query, start_date=start_date, end_date=end_date, store_id=store_id
        )

        results = query.all()

        # Group by time period
        grouped_data = {}
        for r in results:
            if group_by == "day":
                key = r.created_at.date()
            elif group_by == "week":
                key = r.created_at.isocalendar()[:2]  # (year, week)
            elif group_by == "month":
                key = (r.created_at.year, r.created_at.month)
            else:
                key = r.created_at.date()

            if key not in grouped_data:
                grouped_data[key] = {
                    "period": str(key),
                    "delivery_times": [],
                    "total_deliveries": 0,
                    "avg_delivery_time": 0,
                }

            # Convert delivery_seconds to minutes and append to delivery_times
            delivery_time_minutes = r.delivery_seconds / 60
            grouped_data[key]["delivery_times"].append(delivery_time_minutes)
            grouped_data[key]["total_deliveries"] += 1

        # Calculate averages and min/max delivery times
        for data in grouped_data.values():
            if data["delivery_times"]:
                data["avg_delivery_time"] = sum(data["delivery_times"]) / len(
                    data["delivery_times"]
                )
                data["min_delivery_time"] = min(data["delivery_times"])
                data["max_delivery_time"] = max(data["delivery_times"])
            else:
                data["avg_delivery_time"] = 0
                data["min_delivery_time"] = 0
                data["max_delivery_time"] = 0

            # Remove raw delivery_times to reduce response size
            del data["delivery_times"]

        return list(grouped_data.values())

    @cache_result(prefix="customers", ttl=300)
    def get_customer_insights(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        store_id: Optional[int] = None,
    ) -> Dict:
        """
        Get customer insights including churn analysis.

        Args:
            start_date: Start date filter
            end_date: End date filter
            store_id: Store filter

        Returns:
            Customer insights dictionary
        """
        from app.models.customer import Customer

        # Base query for sales with customers
        base_query = (
            self.db.query(Sale)
            .join(Customer, Customer.id == Sale.customer_id)
            .filter(Sale.customer_id.isnot(None))
        )

        # Apply filters using centralized builder
        base_query = QueryFilterBuilder.apply_basic_filters(
            base_query,
            start_date=start_date,
            end_date=end_date,
            store_id=store_id,
        )

        # Total customers
        total_customers = (
            base_query.with_entities(Sale.customer_id).distinct().count()
        )

        # Customers with 3+ purchases
        frequent_customers_query = base_query.group_by(
            Sale.customer_id
        ).having(func.count(Sale.id) >= 3)
        frequent_customers = (
            frequent_customers_query.with_entities(Sale.customer_id)
            .distinct()
            .count()
        )

        # Customers inactive for 30+ days
        thirty_days_ago = datetime.now() - timedelta(days=30)
        inactive_customers = (
            base_query.filter(Sale.created_at < thirty_days_ago)
            .with_entities(Sale.customer_id)
            .distinct()
            .count()
        )

        # Average purchases per customer
        avg_purchases = (
            base_query.group_by(Sale.customer_id)
            .with_entities(func.count(Sale.id).label("purchase_count"))
            .all()
        )

        avg_purchases_value = (
            sum(p.purchase_count for p in avg_purchases) / len(avg_purchases)
            if avg_purchases
            else 0
        )

        return {
            "total_customers": total_customers,
            "frequent_customers": frequent_customers,
            "inactive_customers": inactive_customers,
            "avg_purchases_per_customer": round(avg_purchases_value, 2),
            "frequent_customer_percentage": round(
                (
                    (frequent_customers / total_customers * 100)
                    if total_customers > 0
                    else 0
                ),
                2,
            ),
            "inactive_customer_percentage": round(
                (
                    (inactive_customers / total_customers * 100)
                    if total_customers > 0
                    else 0
                ),
                2,
            ),
        }

    @cache_result(prefix="heatmap", ttl=300)
    def get_peak_hours_heatmap(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        store_id: Optional[int] = None,
        channel_id: Optional[int] = None,
    ) -> List[Dict]:
        """
        Get peak hours heatmap data.

        Args:
            start_date: Start date filter
            end_date: End date filter
            store_id: Store filter
            channel_id: Channel filter

        Returns:
            List of heatmap data by day of week and hour
        """
        query = self.db.query(
            extract("dow", Sale.created_at).label("day_of_week"),
            extract("hour", Sale.created_at).label("hour"),
            func.count(Sale.id).label("sales_count"),
            func.sum(Sale.total_amount).label("total_revenue"),
        )

        # Apply filters using centralized builder
        query = QueryFilterBuilder.apply_basic_filters(
            query,
            start_date=start_date,
            end_date=end_date,
            store_id=store_id,
            channel_id=channel_id,
        )

        # Group by day of week and hour
        query = query.group_by(
            extract("dow", Sale.created_at), extract("hour", Sale.created_at)
        ).order_by("day_of_week", "hour")

        results = query.all()

        # Convert to heatmap format
        heatmap_data = []
        for r in results:
            day_names = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
            heatmap_data.append(
                {
                    "day": int(r.day_of_week),
                    "day_name": day_names[int(r.day_of_week)],
                    "hour": int(r.hour),
                    "sales_count": r.sales_count,
                    "total_revenue": (
                        float(r.total_revenue) if r.total_revenue else 0
                    ),
                }
            )

        return heatmap_data

    @cache_result(prefix="anomalies", ttl=300)
    def get_anomaly_alerts(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        store_id: Optional[int] = None,
    ) -> List[Dict]:
        """
        Detect anomalies and generate alerts.

        Args:
            start_date: Start date filter
            end_date: End date filter
            store_id: Store filter

        Returns:
            List of anomaly alerts
        """
        alerts = []

        # Get current period data
        current_query = self.db.query(
            func.count(Sale.id).label("sales_count"),
            func.sum(Sale.total_amount).label("total_revenue"),
            func.avg(Sale.total_amount).label("avg_ticket"),
        )

        if start_date:
            current_query = current_query.filter(Sale.created_at >= start_date)
        if end_date:
            current_query = current_query.filter(Sale.created_at <= end_date)
        if store_id:
            current_query = current_query.filter(Sale.store_id == store_id)

        current_data = current_query.first()

        # Get previous period data for comparison
        if start_date and end_date:
            period_days = (end_date - start_date).days
            prev_start = start_date - timedelta(days=period_days)
            prev_end = start_date

            prev_query = self.db.query(
                func.count(Sale.id).label("sales_count"),
                func.sum(Sale.total_amount).label("total_revenue"),
                func.avg(Sale.total_amount).label("avg_ticket"),
            ).filter(Sale.created_at >= prev_start, Sale.created_at < prev_end)

            if store_id:
                prev_query = prev_query.filter(Sale.store_id == store_id)

            prev_data = prev_query.first()

            if prev_data and current_data:
                # Check for revenue anomalies
                if prev_data.total_revenue > 0:
                    revenue_change = (
                        (current_data.total_revenue - prev_data.total_revenue)
                        / prev_data.total_revenue
                    ) * 100

                    if revenue_change < -20:  # 20% decrease
                        alerts.append(
                            {
                                "id": "revenue_decrease",
                                "type": "warning",
                                "title": "Queda Significativa no Faturamento",
                                "message": (
                                    f"Faturamento caiu\
                                        {abs(revenue_change):.1f}% em\
                                            relação ao período anterior"
                                ),
                                "severity": (
                                    "high"
                                    if revenue_change < -30
                                    else "medium"
                                ),
                                "timestamp": datetime.now().isoformat(),
                            }
                        )
                    elif revenue_change > 50:  # 50% increase
                        alerts.append(
                            {
                                "id": "revenue_increase",
                                "type": "info",
                                "title": "Aumento Significativo Faturamento",
                                "message": f"Faturamento aumentou\
                                    {revenue_change:.1f}% em\
                                        relação ao período anterior",
                                "severity": "low",
                                "timestamp": datetime.now().isoformat(),
                            }
                        )

                # Check for sales count anomalies
                if prev_data.sales_count > 0:
                    sales_change = (
                        (current_data.sales_count - prev_data.sales_count)
                        / prev_data.sales_count
                    ) * 100

                    if sales_change < -15:  # 15% decrease
                        alerts.append(
                            {
                                "id": "sales_decrease",
                                "type": "warning",
                                "title": "Queda no Número de Vendas",
                                "message": f"Número de vendas caiu\
                                    {abs(sales_change):.1f}% em\
                                        relação ao período anterior",
                                "severity": "medium",
                                "timestamp": datetime.now().isoformat(),
                            }
                        )

                # Check for average ticket anomalies
                if prev_data.avg_ticket > 0:
                    ticket_change = (
                        (current_data.avg_ticket - prev_data.avg_ticket)
                        / prev_data.avg_ticket
                    ) * 100

                    if ticket_change < -10:  # 10% decrease
                        alerts.append(
                            {
                                "id": "ticket_decrease",
                                "type": "warning",
                                "title": "Queda no Ticket Médio",
                                "message": f"Ticket médio caiu\
                                    {abs(ticket_change):.1f}% em\
                                        relação ao período anterior",
                                "severity": "medium",
                                "timestamp": datetime.now().isoformat(),
                            }
                        )

        try:
            delivery_query = self.db.query(
                func.avg(Sale.delivery_seconds).label("avg_delivery_seconds")
            )

            if start_date:
                delivery_query = delivery_query.filter(
                    Sale.created_at >= start_date
                )
            if end_date:
                delivery_query = delivery_query.filter(
                    Sale.created_at <= end_date
                )
            if store_id:
                delivery_query = delivery_query.filter(
                    Sale.store_id == store_id
                )

            avg_delivery_seconds = delivery_query.scalar() or 0
            avg_delivery_minutes = (
                avg_delivery_seconds / 60 if avg_delivery_seconds else 0
            )

            if avg_delivery_minutes > 45:  # More than 45 minutes
                alerts.append(
                    {
                        "id": "delivery_slow",
                        "type": "warning",
                        "title": "Tempo de Entrega Elevado",
                        "message": f"Tempo médio de entrega está em\
                            {avg_delivery_minutes:.1f} minutos",
                        "severity": "medium",
                        "timestamp": datetime.now().isoformat(),
                    }
                )
        except Exception:
            pass  # Skip if delivery data not available

        # Check for customer churn anomalies
        if current_data and current_data.sales_count > 0:
            # Simple churn detection based on recent sales trend
            recent_sales = self.db.query(func.count(Sale.id)).filter(
                Sale.created_at >= datetime.now() - timedelta(days=7)
            )
            if store_id:
                recent_sales = recent_sales.filter(Sale.store_id == store_id)

            recent_count = recent_sales.scalar()

            if recent_count and current_data.sales_count > 0:
                weekly_avg = (
                    current_data.sales_count
                    / (
                        (end_date - start_date).days
                        if start_date and end_date
                        else 30
                    )
                    * 7
                )

                if recent_count < weekly_avg * 0.7:  # 30% below weekly average
                    alerts.append(
                        {
                            "id": "sales_trend_down",
                            "type": "warning",
                            "title": "Tendência de Vendas em Queda",
                            "message": "Vendas da última semana estão\
                                30% abaixo da média semanal",
                            "severity": "medium",
                            "timestamp": datetime.now().isoformat(),
                        }
                    )

        return alerts

    @cache_result(prefix="items", ttl=300)
    def get_top_items_analysis(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        store_id: Optional[int] = None,
        channel_id: Optional[int] = None,
        limit: int = 20,
    ) -> List[Dict]:
        """
        Get top items/complements analysis.

        Args:
            start_date: Start date filter
            end_date: End date filter
            store_id: Store filter
            channel_id: Channel filter
            limit: Number of items to return

        Returns:
            List of top items with statistics
        """
        from app.models.item_product_sale import ItemProductSale
        from app.models.item import Item

        query = (
            self.db.query(
                Item.name.label("item_name"),
                func.count(ItemProductSale.id).label("times_added"),
                func.sum(ItemProductSale.additional_price).label(
                    "revenue_generated"
                ),
                func.avg(ItemProductSale.additional_price).label("avg_price"),
                func.count(
                    func.distinct(ItemProductSale.product_sale_id)
                ).label("unique_products"),
            )
            .select_from(ItemProductSale)
            .join(Item, Item.id == ItemProductSale.item_id)
            .join(
                ProductSale, ProductSale.id == ItemProductSale.product_sale_id
            )
            .join(Sale, Sale.id == ProductSale.sale_id)
            .filter(Sale.sale_status_desc == "COMPLETED")
        )

        # Apply filters
        if start_date:
            query = query.filter(Sale.created_at >= start_date)
        if end_date:
            query = query.filter(Sale.created_at <= end_date)
        if store_id:
            query = query.filter(Sale.store_id == store_id)
        if channel_id:
            query = query.filter(Sale.channel_id == channel_id)

        # Group by item and order by times added
        query = (
            query.group_by(Item.name)
            .order_by(desc("times_added"))
            .limit(limit)
        )

        results = query.all()

        return [
            {
                "item_name": r.item_name,
                "times_added": r.times_added,
                "revenue_generated": (
                    float(r.revenue_generated) if r.revenue_generated else 0
                ),
                "avg_price": float(r.avg_price) if r.avg_price else 0,
                "unique_products": r.unique_products,
            }
            for r in results
        ]

    @cache_result(prefix="products_customizations", ttl=300)
    def get_products_with_most_customizations(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        store_id: Optional[int] = None,
        channel_id: Optional[int] = None,
        limit: int = 20,
    ) -> List[Dict]:
        """
        Get products that receive most customizations.

        Args:
            start_date: Start date filter
            end_date: End date filter
            store_id: Store filter
            channel_id: Channel filter
            limit: Number of products to return

        Returns:
            List of products with customization statistics
        """
        from app.models.item_product_sale import ItemProductSale

        query = (
            self.db.query(
                Product.name.label("product_name"),
                func.count(ItemProductSale.id).label("total_customizations"),
                func.count(
                    func.distinct(ItemProductSale.product_sale_id)
                ).label("sales_with_customizations"),
                func.count(func.distinct(ProductSale.id)).label("total_sales"),
                func.round(
                    func.count(func.distinct(ItemProductSale.product_sale_id))
                    * 100.0
                    / func.count(func.distinct(ProductSale.id)),
                    2,
                ).label("customization_rate"),
            )
            .select_from(ProductSale)
            .join(Product, Product.id == ProductSale.product_id)
            .join(Sale, Sale.id == ProductSale.sale_id)
            .outerjoin(
                ItemProductSale,
                ItemProductSale.product_sale_id == ProductSale.id,
            )
            .filter(Sale.sale_status_desc == "COMPLETED")
        )

        # Apply filters
        if start_date:
            query = query.filter(Sale.created_at >= start_date)
        if end_date:
            query = query.filter(Sale.created_at <= end_date)
        if store_id:
            query = query.filter(Sale.store_id == store_id)
        if channel_id:
            query = query.filter(Sale.channel_id == channel_id)

        # Group by product and order by customization rate
        query = (
            query.group_by(Product.name)
            .order_by(desc("customization_rate"))
            .limit(limit)
        )

        results = query.all()

        return [
            {
                "product_name": r.product_name,
                "total_customizations": r.total_customizations,
                "sales_with_customizations": r.sales_with_customizations,
                "total_sales": r.total_sales,
                "customization_rate": (
                    float(r.customization_rate) if r.customization_rate else 0
                ),
            }
            for r in results
        ]

    @cache_result(prefix="payments", ttl=300)
    def get_payment_mix_by_channel(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        store_id: Optional[int] = None,
    ) -> List[Dict]:
        """
        Get payment mix analysis by channel.

        Args:
            start_date: Start date filter
            end_date: End date filter
            store_id: Store filter

        Returns:
            List of payment mix data by channel
        """
        from app.models.payment import Payment
        from app.models.payment_type import PaymentType

        query = (
            self.db.query(
                Channel.name.label("channel_name"),
                PaymentType.description.label("payment_type"),
                func.count(Payment.id).label("payment_count"),
                func.sum(Payment.value).label("total_value"),
                func.round(
                    func.count(Payment.id)
                    * 100.0
                    / func.sum(func.count(Payment.id)).over(
                        partition_by=Channel.name
                    ),
                    2,
                ).label("percentage"),
            )
            .select_from(Payment)
            .join(PaymentType, PaymentType.id == Payment.payment_type_id)
            .join(Sale, Sale.id == Payment.sale_id)
            .join(Channel, Channel.id == Sale.channel_id)
            .filter(Sale.sale_status_desc == "COMPLETED")
        )

        # Apply filters
        if start_date:
            query = query.filter(Sale.created_at >= start_date)
        if end_date:
            query = query.filter(Sale.created_at <= end_date)
        if store_id:
            query = query.filter(Sale.store_id == store_id)

        # Group by channel and payment type
        query = query.group_by(Channel.name, PaymentType.description).order_by(
            Channel.name, desc("payment_count")
        )

        results = query.all()

        return [
            {
                "channel_name": r.channel_name,
                "payment_type": r.payment_type,
                "payment_count": r.payment_count,
                "total_value": float(r.total_value) if r.total_value else 0,
                "percentage": float(r.percentage) if r.percentage else 0,
            }
            for r in results
        ]

    @cache_result(prefix="cancellations", ttl=300)
    def get_cancellations_analysis(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        store_id: Optional[int] = None,
        channel_id: Optional[int] = None,
    ) -> Dict:
        """
        Get cancellations analysis including reasons and patterns.

        Args:
            start_date: Start date filter
            end_date: End date filter
            store_id: Store filter
            channel_id: Channel filter

        Returns:
            Cancellations analysis dictionary
        """
        # Base query for cancellations
        query = self.db.query(Sale).filter(
            Sale.sale_status_desc == "CANCELLED"
        )

        if start_date:
            query = query.filter(Sale.created_at >= start_date)
        if end_date:
            query = query.filter(Sale.created_at <= end_date)
        if store_id:
            query = query.filter(Sale.store_id == store_id)
        if channel_id:
            query = query.filter(Sale.channel_id == channel_id)

        # Total cancellations
        total_cancellations = query.count()

        # Total sales for percentage calculation
        total_sales_query = self.db.query(Sale)
        if start_date:
            total_sales_query = total_sales_query.filter(
                Sale.created_at >= start_date
            )
        if end_date:
            total_sales_query = total_sales_query.filter(
                Sale.created_at <= end_date
            )
        if store_id:
            total_sales_query = total_sales_query.filter(
                Sale.store_id == store_id
            )
        if channel_id:
            total_sales_query = total_sales_query.filter(
                Sale.channel_id == channel_id
            )

        total_sales = total_sales_query.count()

        # Cancellation rate
        cancellation_rate = (
            (total_cancellations / total_sales * 100) if total_sales > 0 else 0
        )

        # Cancellations by channel
        cancellations_by_channel = (
            self.db.query(
                Channel.name.label("channel_name"),
                Channel.type.label("channel_type"),
                func.count(Sale.id).label("cancellation_count"),
                func.sum(Sale.total_amount).label("lost_revenue"),
            )
            .join(Channel, Channel.id == Sale.channel_id)
            .filter(Sale.sale_status_desc == "CANCELLED")
        )

        if start_date:
            cancellations_by_channel = cancellations_by_channel.filter(
                Sale.created_at >= start_date
            )
        if end_date:
            cancellations_by_channel = cancellations_by_channel.filter(
                Sale.created_at <= end_date
            )
        if store_id:
            cancellations_by_channel = cancellations_by_channel.filter(
                Sale.store_id == store_id
            )

        cancellations_by_channel = (
            cancellations_by_channel.group_by(
                Channel.id, Channel.name, Channel.type
            )
            .order_by(desc("cancellation_count"))
            .all()
        )

        # Cancellations by hour (to identify patterns)
        cancellations_by_hour = self.db.query(
            func.extract("hour", Sale.created_at).label("hour"),
            func.count(Sale.id).label("cancellation_count"),
        ).filter(Sale.sale_status_desc == "CANCELLED")

        if start_date:
            cancellations_by_hour = cancellations_by_hour.filter(
                Sale.created_at >= start_date
            )
        if end_date:
            cancellations_by_hour = cancellations_by_hour.filter(
                Sale.created_at <= end_date
            )
        if store_id:
            cancellations_by_hour = cancellations_by_hour.filter(
                Sale.store_id == store_id
            )
        if channel_id:
            cancellations_by_hour = cancellations_by_hour.filter(
                Sale.channel_id == channel_id
            )

        cancellations_by_hour = (
            cancellations_by_hour.group_by(
                func.extract("hour", Sale.created_at)
            )
            .order_by("hour")
            .all()
        )

        return {
            "total_cancellations": total_cancellations,
            "total_sales": total_sales,
            "cancellation_rate": round(cancellation_rate, 2),
            "cancellations_by_channel": [
                {
                    "channel_name": r.channel_name,
                    "channel_type": r.channel_type,
                    "cancellation_count": r.cancellation_count,
                    "lost_revenue": (
                        float(r.lost_revenue) if r.lost_revenue else 0
                    ),
                }
                for r in cancellations_by_channel
            ],
            "cancellations_by_hour": [
                {
                    "hour": int(r.hour),
                    "cancellation_count": r.cancellation_count,
                }
                for r in cancellations_by_hour
            ],
        }

    @cache_result(prefix="delivery_regions", ttl=300)
    def get_delivery_performance_by_region(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        store_id: Optional[int] = None,
        limit: int = 50,
    ) -> List[Dict]:
        """
        Get delivery performance by region.

        Args:
            start_date: Start date filter
            end_date: End date filter
            store_id: Store filter
            limit: Number of regions to return

        Returns:
            List of delivery performance by region
        """
        from app.models.delivery_address import DeliveryAddress

        query = (
            self.db.query(
                DeliveryAddress.neighborhood.label("neighborhood"),
                DeliveryAddress.city.label("city"),
                DeliveryAddress.state.label("state"),
                func.count(DeliverySale.id).label("delivery_count"),
                func.avg(Sale.delivery_seconds / 60.0).label(
                    "avg_delivery_time"
                ),
                func.min(Sale.delivery_seconds / 60.0).label(
                    "min_delivery_time"
                ),
                func.max(Sale.delivery_seconds / 60.0).label(
                    "max_delivery_time"
                ),
                func.sum(Sale.total_amount).label("total_revenue"),
            )
            .select_from(DeliverySale)
            .join(Sale, Sale.id == DeliverySale.sale_id)
            .join(
                DeliveryAddress,
                DeliveryAddress.delivery_sale_id == DeliverySale.id,
            )
            .filter(
                Sale.sale_status_desc == "COMPLETED",
                Sale.delivery_seconds.isnot(None),
            )
        )

        # Apply filters
        if start_date:
            query = query.filter(Sale.created_at >= start_date)
        if end_date:
            query = query.filter(Sale.created_at <= end_date)
        if store_id:
            query = query.filter(Sale.store_id == store_id)

        # Group by region and filter by minimum deliveries
        query = (
            query.group_by(
                DeliveryAddress.neighborhood,
                DeliveryAddress.city,
                DeliveryAddress.state,
            )
            .having(
                func.count(DeliverySale.id)
                >= 5  # Minimum 5 deliveries for statistical relevance
            )
            .order_by(desc("delivery_count"))
            .limit(limit)
        )

        results = query.all()

        return [
            {
                "neighborhood": r.neighborhood,
                "city": r.city,
                "state": r.state,
                "delivery_count": r.delivery_count,
                "avg_delivery_time": (
                    float(r.avg_delivery_time) if r.avg_delivery_time else 0
                ),
                "min_delivery_time": r.min_delivery_time,
                "max_delivery_time": r.max_delivery_time,
                "total_revenue": (
                    float(r.total_revenue) if r.total_revenue else 0
                ),
            }
            for r in results
        ]

    @cache_result(prefix="store_growth", ttl=300)
    def get_store_growth_analysis(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        min_growth_rate: float = 5.0,
    ) -> List[Dict]:
        """
        Get store growth analysis with linear trend detection.

        Args:
            start_date: Start date filter
            end_date: End date filter
            min_growth_rate: Minimum growth rate percentage to consider

        Returns:
            List of stores with growth analysis
        """
        # Default to last 6 months if no dates provided
        if not end_date:
            end_date = datetime.now()
        if not start_date:
            start_date = end_date - timedelta(days=180)

        # Get monthly revenue for each store
        query = (
            self.db.query(
                Store.id.label("store_id"),
                Store.name.label("store_name"),
                Store.city.label("city"),
                Store.state.label("state"),
                func.date_trunc("month", Sale.created_at).label("month"),
                func.sum(Sale.total_amount).label("monthly_revenue"),
                func.count(Sale.id).label("monthly_sales"),
            )
            .select_from(Sale)
            .join(Store, Store.id == Sale.store_id)
            .filter(
                Sale.sale_status_desc == "COMPLETED",
                Sale.created_at >= start_date,
                Sale.created_at <= end_date,
            )
            .group_by(
                Store.id,
                Store.name,
                Store.city,
                Store.state,
                func.date_trunc("month", Sale.created_at),
            )
            .order_by(Store.id, func.date_trunc("month", Sale.created_at))
        )

        results = query.all()

        # Group by store and analyze growth
        store_data = {}
        for result in results:
            store_id = result.store_id
            if store_id not in store_data:
                store_data[store_id] = {
                    "store_id": store_id,
                    "store_name": result.store_name,
                    "city": result.city,
                    "state": result.state,
                    "monthly_data": [],
                }

            store_data[store_id]["monthly_data"].append(
                {
                    "month": result.month,
                    "revenue": float(result.monthly_revenue),
                    "sales": result.monthly_sales,
                }
            )

        # Analyze growth for each store
        growth_analysis = []
        for store_id, data in store_data.items():
            monthly_data = sorted(
                data["monthly_data"], key=lambda x: x["month"]
            )

            if (
                len(monthly_data) < 3
            ):  # Need at least 3 months for trend analysis
                continue

            # Calculate growth rate
            first_month = monthly_data[0]["revenue"]
            last_month = monthly_data[-1]["revenue"]

            if first_month > 0:
                total_growth_rate = (
                    (last_month - first_month) / first_month
                ) * 100

                # Calculate monthly average growth rate
                monthly_growth_rates = []
                for i in range(1, len(monthly_data)):
                    prev_revenue = monthly_data[i - 1]["revenue"]
                    curr_revenue = monthly_data[i]["revenue"]
                    if prev_revenue > 0:
                        monthly_growth = (
                            (curr_revenue - prev_revenue) / prev_revenue
                        ) * 100
                        monthly_growth_rates.append(monthly_growth)

                avg_monthly_growth = (
                    sum(monthly_growth_rates) / len(monthly_growth_rates)
                    if monthly_growth_rates
                    else 0
                )

                growth_variance = 0
                if len(monthly_growth_rates) > 1:
                    growth_variance = sum(
                        (rate - avg_monthly_growth) ** 2
                        for rate in monthly_growth_rates
                    ) / len(monthly_growth_rates)

                # Determine growth pattern
                growth_pattern = "stable"
                if (
                    avg_monthly_growth > min_growth_rate
                    and growth_variance < 100
                ):  # Low variance = consistent growth
                    growth_pattern = "growing"
                elif avg_monthly_growth < -min_growth_rate:
                    growth_pattern = "declining"
                elif growth_variance > 200:  # High variance = volatile
                    growth_pattern = "volatile"

                # Calculate trend strength (R-squared approximation)
                trend_strength = 0
                if len(monthly_data) > 2:
                    x_values = list(range(len(monthly_data)))
                    y_values = [d["revenue"] for d in monthly_data]

                    # Simple linear regression
                    n = len(x_values)
                    sum_x = sum(x_values)
                    sum_y = sum(y_values)
                    sum_xy = sum(x * y for x, y in zip(x_values, y_values))
                    sum_x2 = sum(x * x for x in x_values)

                    if n * sum_x2 - sum_x * sum_x != 0:
                        slope = (n * sum_xy - sum_x * sum_y) / (
                            n * sum_x2 - sum_x * sum_x
                        )
                        intercept = (sum_y - slope * sum_x) / n

                        # Calculate R-squared
                        y_mean = sum_y / n
                        ss_tot = sum((y - y_mean) ** 2 for y in y_values)
                        ss_res = sum(
                            (y - (slope * x + intercept)) ** 2
                            for x, y in zip(x_values, y_values)
                        )

                        if ss_tot > 0:
                            trend_strength = max(0, 1 - (ss_res / ss_tot))

                growth_analysis.append(
                    {
                        "store_id": store_id,
                        "store_name": data["store_name"],
                        "city": data["city"],
                        "state": data["state"],
                        "total_growth_rate": round(total_growth_rate, 2),
                        "avg_monthly_growth": round(avg_monthly_growth, 2),
                        "growth_pattern": growth_pattern,
                        "trend_strength": round(trend_strength, 3),
                        "growth_variance": round(growth_variance, 2),
                        "months_analyzed": len(monthly_data),
                        "first_month_revenue": first_month,
                        "last_month_revenue": last_month,
                        "monthly_data": monthly_data,
                    }
                )

        # Sort by growth rate descending
        growth_analysis.sort(
            key=lambda x: x["total_growth_rate"], reverse=True
        )

        return growth_analysis

    @cache_result(prefix="product_seasonality", ttl=300)
    def get_product_seasonality_analysis(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        store_id: Optional[int] = None,
        channel_id: Optional[int] = None,
        min_seasonality_threshold: float = 0.3,
    ) -> List[Dict]:
        """
        Get product seasonality analysis.

        Args:
            start_date: Start date filter
            end_date: End date filter
            store_id: Store filter
            channel_id: Channel filter
            min_seasonality_threshold: Minimum seasonality score to consider

        Returns:
            List of products with seasonality analysis
        """
        # Default to last 12 months if no dates provided
        if not end_date:
            end_date = datetime.now()
        if not start_date:
            start_date = end_date - timedelta(days=365)

        # Get monthly sales for each product
        query = (
            self.db.query(
                Product.id.label("product_id"),
                Product.name.label("product_name"),
                func.date_trunc("month", Sale.created_at).label("month"),
                func.sum(ProductSale.quantity).label("monthly_quantity"),
                func.sum(ProductSale.total_price).label("monthly_revenue"),
                func.count(ProductSale.id).label("monthly_sales"),
            )
            .select_from(ProductSale)
            .join(Product, Product.id == ProductSale.product_id)
            .join(Sale, Sale.id == ProductSale.sale_id)
            .filter(
                Sale.sale_status_desc == "COMPLETED",
                Sale.created_at >= start_date,
                Sale.created_at <= end_date,
            )
        )

        # Apply filters
        if store_id:
            query = query.filter(Sale.store_id == store_id)
        if channel_id:
            query = query.filter(Sale.channel_id == channel_id)

        query = query.group_by(
            Product.id, Product.name, func.date_trunc("month", Sale.created_at)
        ).order_by(Product.id, func.date_trunc("month", Sale.created_at))

        results = query.all()

        # Group by product and analyze seasonality
        product_data = {}
        for result in results:
            product_id = result.product_id
            if product_id not in product_data:
                product_data[product_id] = {
                    "product_id": product_id,
                    "product_name": result.product_name,
                    "monthly_data": [],
                }

            product_data[product_id]["monthly_data"].append(
                {
                    "month": result.month,
                    "quantity": float(result.monthly_quantity),
                    "revenue": float(result.monthly_revenue),
                    "sales": result.monthly_sales,
                }
            )

        # Analyze seasonality for each product
        seasonality_analysis = []
        for product_id, data in product_data.items():
            monthly_data = sorted(
                data["monthly_data"], key=lambda x: x["month"]
            )

            if (
                len(monthly_data) < 6
            ):  # Need at least 6 months for seasonality analysis
                continue

            # Calculate monthly averages
            monthly_quantities = [d["quantity"] for d in monthly_data]
            monthly_revenues = [d["revenue"] for d in monthly_data]

            # Calculate seasonality score using coefficient of variation
            avg_quantity = sum(monthly_quantities) / len(monthly_quantities)
            avg_revenue = sum(monthly_revenues) / len(monthly_revenues)

            if avg_quantity > 0 and avg_revenue > 0:
                # Coefficient of variation for quantity
                quantity_variance = sum(
                    (q - avg_quantity) ** 2 for q in monthly_quantities
                ) / len(monthly_quantities)
                quantity_cv = (quantity_variance**0.5) / avg_quantity

                # Coefficient of variation for revenue
                revenue_variance = sum(
                    (r - avg_revenue) ** 2 for r in monthly_revenues
                ) / len(monthly_revenues)
                revenue_cv = (revenue_variance**0.5) / avg_revenue

                # Seasonality score (average of both CVs)
                seasonality_score = (quantity_cv + revenue_cv) / 2

                # Find peak and low months
                peak_month = max(monthly_data, key=lambda x: x["quantity"])
                low_month = min(monthly_data, key=lambda x: x["quantity"])

                # Calculate peak-to-low ratio
                peak_low_ratio = (
                    peak_month["quantity"] / low_month["quantity"]
                    if low_month["quantity"] > 0
                    else 0
                )

                # Determine seasonality pattern
                seasonality_pattern = "stable"
                if seasonality_score > min_seasonality_threshold:
                    if peak_low_ratio > 2.0:
                        seasonality_pattern = "highly_seasonal"
                    elif peak_low_ratio > 1.5:
                        seasonality_pattern = "moderately_seasonal"
                    else:
                        seasonality_pattern = "slightly_seasonal"

                # Calculate trend (simple linear regression)
                trend_direction = "stable"
                if len(monthly_data) > 2:
                    x_values = list(range(len(monthly_data)))
                    y_values = monthly_quantities

                    n = len(x_values)
                    sum_x = sum(x_values)
                    sum_y = sum(y_values)
                    sum_xy = sum(x * y for x, y in zip(x_values, y_values))
                    sum_x2 = sum(x * x for x in x_values)

                    if n * sum_x2 - sum_x * sum_x != 0:
                        slope = (n * sum_xy - sum_x * sum_y) / (
                            n * sum_x2 - sum_x * sum_x
                        )
                        if slope > 0.1:
                            trend_direction = "growing"
                        elif slope < -0.1:
                            trend_direction = "declining"

                seasonality_analysis.append(
                    {
                        "product_id": product_id,
                        "product_name": data["product_name"],
                        "seasonality_score": round(seasonality_score, 3),
                        "seasonality_pattern": seasonality_pattern,
                        "peak_month": peak_month["month"].strftime("%Y-%m"),
                        "low_month": low_month["month"].strftime("%Y-%m"),
                        "peak_quantity": peak_month["quantity"],
                        "low_quantity": low_month["quantity"],
                        "peak_low_ratio": round(peak_low_ratio, 2),
                        "avg_monthly_quantity": round(avg_quantity, 2),
                        "avg_monthly_revenue": round(avg_revenue, 2),
                        "trend_direction": trend_direction,
                        "months_analyzed": len(monthly_data),
                        "monthly_data": monthly_data,
                    }
                )

        # Sort by seasonality score descending
        seasonality_analysis.sort(
            key=lambda x: x["seasonality_score"], reverse=True
        )

    @cache_result(prefix="promotions", ttl=300)
    def get_promotions_analysis(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        store_id: Optional[int] = None,
        channel_id: Optional[int] = None,
    ) -> Dict:
        """
        Get promotions and discounts analysis.

        Args:
            start_date: Start date filter
            end_date: End date filter
            store_id: Store filter
            channel_id: Channel filter

        Returns:
            Promotions analysis data
        """
        query = self.db.query(
            func.sum(Sale.total_discount).label("total_discounts"),
            func.sum(Sale.total_increase).label("total_increases"),
            func.count(Sale.id).label("total_sales"),
            func.count(Sale.id)
            .filter(Sale.total_discount > 0)
            .label("sales_with_discount"),
            func.count(Sale.id)
            .filter(Sale.total_increase > 0)
            .label("sales_with_increase"),
            func.avg(Sale.total_discount).label("avg_discount"),
            func.avg(Sale.total_increase).label("avg_increase"),
        ).filter(Sale.sale_status_desc == "COMPLETED")

        # Apply filters
        if start_date:
            query = query.filter(Sale.created_at >= start_date)
        if end_date:
            query = query.filter(Sale.created_at <= end_date)
        if store_id:
            query = query.filter(Sale.store_id == store_id)
        if channel_id:
            query = query.filter(Sale.channel_id == channel_id)

        result = query.first()

        # Get discount reasons
        discount_reasons_query = self.db.query(
            Sale.discount_reason,
            func.count(Sale.id).label("count"),
            func.sum(Sale.total_discount).label("total_discount"),
        ).filter(Sale.sale_status_desc == "COMPLETED", Sale.total_discount > 0)

        if start_date:
            discount_reasons_query = discount_reasons_query.filter(
                Sale.created_at >= start_date
            )
        if end_date:
            discount_reasons_query = discount_reasons_query.filter(
                Sale.created_at <= end_date
            )
        if store_id:
            discount_reasons_query = discount_reasons_query.filter(
                Sale.store_id == store_id
            )
        if channel_id:
            discount_reasons_query = discount_reasons_query.filter(
                Sale.channel_id == channel_id
            )

        discount_reasons = (
            discount_reasons_query.group_by(Sale.discount_reason)
            .order_by(desc("count"))
            .limit(10)
            .all()
        )

        return {
            "total_discounts": (
                float(result.total_discounts) if result.total_discounts else 0
            ),
            "total_increases": (
                float(result.total_increases) if result.total_increases else 0
            ),
            "total_sales": result.total_sales,
            "sales_with_discount": result.sales_with_discount,
            "sales_with_increase": result.sales_with_increase,
            "avg_discount": (
                float(result.avg_discount) if result.avg_discount else 0
            ),
            "avg_increase": (
                float(result.avg_increase) if result.avg_increase else 0
            ),
            "discount_percentage": round(
                (
                    (result.sales_with_discount / result.total_sales * 100)
                    if result.total_sales > 0
                    else 0
                ),
                2,
            ),
            "increase_percentage": round(
                (
                    (result.sales_with_increase / result.total_sales * 100)
                    if result.total_sales > 0
                    else 0
                ),
                2,
            ),
            "discount_reasons": [
                {
                    "reason": r.discount_reason or "Sem motivo especificado",
                    "count": r.count,
                    "total_discount": (
                        float(r.total_discount) if r.total_discount else 0
                    ),
                }
                for r in discount_reasons
            ],
        }

    @cache_result(prefix="inventory", ttl=300)
    def get_inventory_turnover_analysis(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        store_id: Optional[int] = None,
        channel_id: Optional[int] = None,
        limit: int = 20,
    ) -> List[Dict]:
        """
        Get inventory turnover analysis (based on sales velocity).

        Args:
            start_date: Start date filter
            end_date: End date filter
            store_id: Store filter
            channel_id: Channel filter
            limit: Number of products to return

        Returns:
            Inventory turnover analysis
        """
        query = (
            self.db.query(
                Product.id,
                Product.name,
                func.sum(ProductSale.quantity).label("total_quantity_sold"),
                func.count(ProductSale.id).label("sales_count"),
                func.avg(ProductSale.quantity).label("avg_quantity_per_sale"),
                func.sum(ProductSale.total_price).label("total_revenue"),
                func.avg(ProductSale.base_price).label("avg_price"),
            )
            .select_from(ProductSale)
            .join(Product, Product.id == ProductSale.product_id)
            .join(Sale, Sale.id == ProductSale.sale_id)
            .filter(Sale.sale_status_desc == "COMPLETED")
        )

        # Apply filters
        if start_date:
            query = query.filter(Sale.created_at >= start_date)
        if end_date:
            query = query.filter(Sale.created_at <= end_date)
        if store_id:
            query = query.filter(Sale.store_id == store_id)
        if channel_id:
            query = query.filter(Sale.channel_id == channel_id)

        # Calculate period days for turnover calculation
        if start_date and end_date:
            period_days = (end_date - start_date).days
        else:
            period_days = 30  # Default to 30 days

        query = (
            query.group_by(Product.id, Product.name)
            .order_by(desc("total_quantity_sold"))
            .limit(limit)
        )

        results = query.all()

        return [
            {
                "product_id": r.id,
                "product_name": r.name,
                "total_quantity_sold": (
                    float(r.total_quantity_sold)
                    if r.total_quantity_sold
                    else 0
                ),
                "sales_count": r.sales_count,
                "avg_quantity_per_sale": (
                    float(r.avg_quantity_per_sale)
                    if r.avg_quantity_per_sale
                    else 0
                ),
                "total_revenue": (
                    float(r.total_revenue) if r.total_revenue else 0
                ),
                "avg_price": float(r.avg_price) if r.avg_price else 0,
                "daily_velocity": (
                    round(float(r.total_quantity_sold) / period_days, 2)
                    if period_days > 0
                    else 0
                ),
                "turnover_score": (
                    round(float(r.total_quantity_sold) / period_days, 2)
                    if period_days > 0
                    else 0
                ),
            }
            for r in results
        ]
