import { useState, useEffect } from 'react'
import { analyticsApi } from '../services/api'
import type { AnalyticsFilters, PromotionsData, InventoryData } from '../types/api'

interface UsePromotionsAnalysisReturn {
  data: PromotionsData | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function usePromotionsAnalysis(
  filters: AnalyticsFilters = {}
): UsePromotionsAnalysisReturn {
  const [data, setData] = useState<PromotionsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await analyticsApi.getPromotionsAnalysis(filters)
      setData(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch promotions analysis')
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

interface UseInventoryTurnoverReturn {
  data: InventoryData[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useInventoryTurnover(
  filters: AnalyticsFilters = {},
  limit: number = 20
): UseInventoryTurnoverReturn {
  const [data, setData] = useState<InventoryData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await analyticsApi.getInventoryTurnover(filters, limit)
      setData(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch inventory turnover')
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
