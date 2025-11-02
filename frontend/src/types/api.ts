export interface ApiResponse<T> {
  data: T
  total: number
  limit: number
  offset: number
  has_more: boolean
}

export interface Sale {
  id: number
  store_id: number
  customer_id: number | null
  channel_id: number
  created_at: string
  total_amount: number
  status: string
}

export interface Store {
  id: number
  name: string
  city?: string | null
  state?: string | null
  is_active?: boolean
}

export interface Channel {
  id: number
  name: string
  description?: string | null
  type?: 'P' | 'D' | null
}

export interface SalesFilters {
  limit?: number
  offset?: number
  start_date?: string
  end_date?: string
  store_id?: number
  channel_id?: number
}

export interface RevenueData {
  period: string
  revenue: number
  sales_count: number
  avg_ticket: number
}

export interface ProductData {
  product_name: string
  total_quantity: number
  sales_count: number
  total_revenue: number
  avg_price: number
}

export interface ChannelData {
  channel_name: string
  channel_type: 'P' | 'D'
  total_revenue: number
  sales_count: number
  avg_ticket: number
}

export interface MetricsSummary {
  total_revenue: number
  sales_count: number
  avg_ticket: number
  first_sale?: string
  last_sale?: string
}

export interface AnalyticsFilters {
  start_date?: string
  end_date?: string
  store_id?: number
  channel_id?: number
  day_of_week?: number  // 0=Monday, 6=Sunday
  hour_start?: number   // 0-23
  hour_end?: number      // 0-23
}

export interface PromotionsData {
  total_discounts: number
  total_increases: number
  total_sales: number
  sales_with_discount: number
  sales_with_increase: number
  avg_discount: number
  avg_increase: number
  discount_percentage: number
  increase_percentage: number
  discount_reasons: Array<{
    reason: string
    count: number
    total_discount: number
  }>
}

export interface InventoryData {
  product_id: number
  product_name: string
  total_quantity_sold: number
  sales_count: number
  avg_quantity_per_sale: number
  total_revenue: number
  avg_price: number
  daily_velocity: number
  turnover_score: number
}

