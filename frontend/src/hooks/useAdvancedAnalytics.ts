import { useState, useEffect } from 'react'
import { analyticsApi } from '../services/api'
import type { AnalyticsFilters } from '../types/api'

// Types
export interface ItemData {
  item_id: number
  item_name: string
  times_added: number
  revenue_generated: number
  unique_products: number
  avg_price: number
}

export interface ProductCustomizationData {
  product_id: number
  product_name: string
  total_sales: number
  total_customizations: number
  customization_rate: number
  avg_customizations_per_sale: number
}

export interface PaymentMixData {
  channel_id: number
  channel_name: string
  payment_type_id: number
  payment_type_name: string
  payment_count: number
  total_value: number
  percentage: number
}

export interface DeliveryRegionData {
  neighborhood: string
  city: string
  delivery_count: number
  avg_delivery_time: number
  total_revenue: number
  avg_order_value: number
}

export interface StoreGrowthData {
  store_id: number
  store_name: string
  total_growth_rate: number
  trend_category: string
  trend_strength: number
  monthly_data: Array<{
    month: string
    revenue: number
    growth_rate: number
  }>
}

export interface ProductSeasonalityData {
  product_id: number
  product_name: string
  seasonality_score: number
  seasonality_category: string
  peak_month: string
  low_month: string
  peak_to_low_ratio: number
  monthly_data: Array<{
    month: string
    revenue: number
    sales_count: number
  }>
}

// Hook para análise de itens mais vendidos
interface UseTopItemsReturn {
  data: ItemData[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useTopItems(
  filters: AnalyticsFilters = {},
  limit: number = 20
): UseTopItemsReturn {
  const [data, setData] = useState<ItemData[]>([])
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
      
      const response = await analyticsApi.get(`/analytics/top-items?${params.toString()}`)
      setData(response.data || response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch top items')
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

// Hook para análise de customizações de produtos
interface UseProductsCustomizationsReturn {
  data: ProductCustomizationData[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useProductsCustomizations(
  filters: AnalyticsFilters = {},
  limit: number = 20
): UseProductsCustomizationsReturn {
  const [data, setData] = useState<ProductCustomizationData[]>([])
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
      
      const response = await analyticsApi.get(`/analytics/products-customizations?${params.toString()}`)
      setData(response.data || response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customizations')
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

// Hook para análise de mix de pagamentos
interface UsePaymentMixReturn {
  data: PaymentMixData[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function usePaymentMix(
  filters: AnalyticsFilters = {}
): UsePaymentMixReturn {
  const [data, setData] = useState<PaymentMixData[]>([])
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
      
      const response = await analyticsApi.get(`/analytics/payment-mix?${params.toString()}`)
      setData(response.data || response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payment mix')
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

// Hook para análise de delivery por região
interface UseDeliveryRegionsReturn {
  data: DeliveryRegionData[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useDeliveryRegions(
  filters: AnalyticsFilters = {},
  limit: number = 50
): UseDeliveryRegionsReturn {
  const [data, setData] = useState<DeliveryRegionData[]>([])
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
      params.append('limit', limit.toString())
      
      const response = await analyticsApi.get(`/analytics/delivery-regions?${params.toString()}`)
      setData(response.data || response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch delivery regions')
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

// Hook para análise de crescimento de lojas
interface UseStoreGrowthReturn {
  data: StoreGrowthData[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useStoreGrowth(
  filters: AnalyticsFilters = {},
  minGrowthRate: number = 5
): UseStoreGrowthReturn {
  const [data, setData] = useState<StoreGrowthData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (filters.start_date) params.append('start_date', filters.start_date)
      if (filters.end_date) params.append('end_date', filters.end_date)
      params.append('min_growth_rate', minGrowthRate.toString())
      
      const response = await analyticsApi.get(`/analytics/store-growth?${params.toString()}`)
      setData(response.data || response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch store growth')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [JSON.stringify(filters), minGrowthRate])

  const refetch = () => {
    void fetchData()
  }

  return { data, loading, error, refetch }
}

// Hook para análise de sazonalidade de produtos
interface UseProductSeasonalityReturn {
  data: ProductSeasonalityData[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useProductSeasonality(
  filters: AnalyticsFilters = {},
  minSeasonalityThreshold: number = 0.3
): UseProductSeasonalityReturn {
  const [data, setData] = useState<ProductSeasonalityData[]>([])
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
      params.append('min_seasonality_threshold', minSeasonalityThreshold.toString())
      
      const response = await analyticsApi.get(`/analytics/product-seasonality?${params.toString()}`)
      setData(response.data || response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch product seasonality')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [JSON.stringify(filters), minSeasonalityThreshold])

  const refetch = () => {
    void fetchData()
  }

  return { data, loading, error, refetch }
}
