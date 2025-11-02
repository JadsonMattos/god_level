import { useState, useEffect } from 'react'
import { salesApi } from '../services/api'
import type { Sale, SalesFilters } from '../types/api'

interface UseSalesReturn {
  sales: Sale[]
  loading: boolean
  error: string | null
  total: number
  hasMore: boolean
  refetch: () => void
}

export function useSales(filters: SalesFilters = {}): UseSalesReturn {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  const fetchSales = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await salesApi.getSales(filters)
      
      setSales(response.data)
      setTotal(response.total)
      setHasMore(response.has_more)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sales')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSales()
  }, [JSON.stringify(filters)])

  const refetch = () => {
    void fetchSales()
  }

  return {
    sales,
    loading,
    error,
    total,
    hasMore,
    refetch,
  }
}

