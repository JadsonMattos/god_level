import { useState, useEffect } from 'react'
import { analyticsApi } from '../services/api'
import type { AnalyticsFilters } from '../types/api'

interface Alert {
  id: string
  type: 'warning' | 'error' | 'info' | 'success'
  title: string
  message: string
  timestamp: string
  severity: 'low' | 'medium' | 'high'
}

interface UseAnomalyAlertsReturn {
  data: Alert[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useAnomalyAlerts(
  filters: AnalyticsFilters = {}
): UseAnomalyAlertsReturn {
  const [data, setData] = useState<Alert[]>([])
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
      
      const response = await analyticsApi.get(`/analytics/anomaly-alerts?${params.toString()}`)
      setData(response.data || response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch anomaly alerts')
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
