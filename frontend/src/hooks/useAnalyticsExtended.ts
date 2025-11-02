import { useState, useEffect } from 'react'
import { analyticsApi } from '../services/api'
import type { AnalyticsFilters } from '../types/api'

// New hooks for Sprint 6 features

interface MarginData {
  product_id: number
  product_name: string
  avg_price: number
  avg_cost: number
  margin: number
  margin_percentage: number
  total_quantity: number
  total_revenue: number
}

interface UseProductsMarginReturn {
  data: MarginData[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useProductsMargin(
  filters: AnalyticsFilters = {},
  limit: number = 20
): UseProductsMarginReturn {
  const [data, setData] = useState<MarginData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (filters.start_date) params.append('start_date', filters.start_date)
      if (filters.end_date) params.append('end_date', filters.end_date)
      if (filters.store_id) params.append('store_id', filters.store_id.toString())
      if (filters.channel_id) params.append('channel_id', filters.channel_id.toString())
      params.append('limit', limit.toString())
      
      const response = await analyticsApi.get(`/analytics/products-margin?${params.toString()}`)
      setData(response.data || response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products margin')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [JSON.stringify(filters), limit])

  const refetch = () => {
    void fetchData()
  }

  return { data, loading, error, refetch }
}

interface DeliveryData {
  period: string
  total_deliveries: number
  avg_delivery_time: number
  min_delivery_time: number
  max_delivery_time: number
}

interface UseDeliveryPerformanceReturn {
  data: DeliveryData[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useDeliveryPerformance(
  filters: AnalyticsFilters = {},
  groupBy: 'day' | 'week' | 'month' = 'day'
): UseDeliveryPerformanceReturn {
  const [data, setData] = useState<DeliveryData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (filters.start_date) params.append('start_date', filters.start_date)
      if (filters.end_date) params.append('end_date', filters.end_date)
      if (filters.store_id) params.append('store_id', filters.store_id.toString())
      params.append('group_by', groupBy)
      
      const response = await analyticsApi.get(`/analytics/delivery-performance?${params.toString()}`)
      setData(response.data || response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch delivery performance')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [JSON.stringify(filters), groupBy])

  const refetch = () => {
    void fetchData()
  }

  return { data, loading, error, refetch }
}

interface CustomerInsights {
  total_customers: number
  frequent_customers: number
  inactive_customers: number
  avg_purchases_per_customer: number
  frequent_customer_percentage: number
  inactive_customer_percentage: number
}

interface UseCustomerInsightsReturn {
  data: CustomerInsights | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useCustomerInsights(
  filters: AnalyticsFilters = {}
): UseCustomerInsightsReturn {
  const [data, setData] = useState<CustomerInsights | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (filters.start_date) params.append('start_date', filters.start_date)
      if (filters.end_date) params.append('end_date', filters.end_date)
      if (filters.store_id) params.append('store_id', filters.store_id.toString())
      
      const response = await analyticsApi.get(`/analytics/customer-insights?${params.toString()}`)
      setData(response.data || response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customer insights')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [JSON.stringify(filters)])

  const refetch = () => {
    void fetchData()
  }

  return { data, loading, error, refetch }
}

interface HeatmapData {
  day: number
  day_name: string
  hour: number
  sales_count: number
  total_revenue: number
}

interface UsePeakHoursHeatmapReturn {
  data: HeatmapData[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function usePeakHoursHeatmap(
  filters: AnalyticsFilters = {}
): UsePeakHoursHeatmapReturn {
  const [data, setData] = useState<HeatmapData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (filters.start_date) params.append('start_date', filters.start_date)
      if (filters.end_date) params.append('end_date', filters.end_date)
      if (filters.store_id) params.append('store_id', filters.store_id.toString())
      if (filters.channel_id) params.append('channel_id', filters.channel_id.toString())
      
      const response = await analyticsApi.get(`/analytics/peak-hours-heatmap?${params.toString()}`)
      setData(response.data || response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch peak hours heatmap')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [JSON.stringify(filters)])

  const refetch = () => {
    void fetchData()
  }

  return { data, loading, error, refetch }
}
