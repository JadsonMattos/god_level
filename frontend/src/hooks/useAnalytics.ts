import { useState, useEffect } from 'react'
import { analyticsApi } from '../services/api'
import type { RevenueData, ProductData, ChannelData, MetricsSummary, AnalyticsFilters } from '../types/api'

interface UseRevenueReturn {
  data: RevenueData[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useRevenue(
  filters: AnalyticsFilters = {},
  groupBy: 'day' | 'week' | 'month' = 'day'
): UseRevenueReturn {
  const [data, setData] = useState<RevenueData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await analyticsApi.getRevenue(filters, groupBy)
      setData(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch revenue data')
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

interface UseTopProductsReturn {
  data: ProductData[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useTopProducts(
  filters: AnalyticsFilters = {},
  limit: number = 10
): UseTopProductsReturn {
  const [data, setData] = useState<ProductData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await analyticsApi.getTopProducts(filters, limit)
      setData(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch top products')
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

interface UseChannelPerformanceReturn {
  data: ChannelData[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useChannelPerformance(
  filters: AnalyticsFilters = {}
): UseChannelPerformanceReturn {
  const [data, setData] = useState<ChannelData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await analyticsApi.getChannelPerformance(filters)
      setData(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch channel performance')
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

interface UseSummaryReturn {
  data: MetricsSummary | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useSummary(
  filters: AnalyticsFilters = {}
): UseSummaryReturn {
  const [data, setData] = useState<MetricsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await analyticsApi.getSummary(filters)
      setData(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch summary')
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

