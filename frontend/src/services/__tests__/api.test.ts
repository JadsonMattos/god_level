import { describe, it, expect, vi, beforeEach } from 'vitest'
import { analyticsApi } from '../api'

// Mock axios
vi.mock('../axios', () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

describe('analyticsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getRevenue', () => {
    it('should fetch revenue data with default parameters', async () => {
      const mockResponse = {
        data: {
          data: [
            { period: '2024-01-01', revenue: 1000, sales_count: 10, avg_ticket: 100 },
          ],
        },
      }

      const { apiClient } = await import('../axios')
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await analyticsApi.getRevenue()

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/analytics/revenue?group_by=day')
      expect(result).toEqual(mockResponse.data)
    })

    it('should fetch revenue data with filters', async () => {
      const mockResponse = {
        data: {
          data: [
            { period: '2024-01-01', revenue: 1000, sales_count: 10, avg_ticket: 100 },
          ],
        },
      }

      const { apiClient } = await import('../axios')
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const filters = {
        start_date: '2024-01-01',
        end_date: '2024-01-31',
        store_id: 1,
        channel_id: 2,
      }

      const result = await analyticsApi.getRevenue(filters, 'week')

      expect(apiClient.get).toHaveBeenCalledWith(
        '/api/v1/analytics/revenue?group_by=week&start_date=2024-01-01&end_date=2024-01-31&store_id=1&channel_id=2'
      )
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle API errors', async () => {
      const error = new Error('Network error')
      const { apiClient } = await import('../axios')
      vi.mocked(apiClient.get).mockRejectedValue(error)

      await expect(analyticsApi.getRevenue()).rejects.toThrow('Network error')
    })
  })

  describe('getTopProducts', () => {
    it('should fetch top products with default limit', async () => {
      const mockResponse = {
        data: {
          data: [
            { product_name: 'Product 1', total_quantity: 100, sales_count: 10, total_revenue: 1000, avg_price: 10 },
          ],
        },
      }

      const { apiClient } = await import('../axios')
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await analyticsApi.getTopProducts()

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/analytics/products?limit=10')
      expect(result).toEqual(mockResponse.data)
    })

    it('should fetch top products with custom limit and filters', async () => {
      const mockResponse = {
        data: {
          data: [
            { product_name: 'Product 1', total_quantity: 100, sales_count: 10, total_revenue: 1000, avg_price: 10 },
          ],
        },
      }

      const { apiClient } = await import('../axios')
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const filters = {
        start_date: '2024-01-01',
        end_date: '2024-01-31',
        store_id: 1,
      }

      const result = await analyticsApi.getTopProducts(filters, 20)

      expect(apiClient.get).toHaveBeenCalledWith(
        '/api/v1/analytics/products?limit=20&start_date=2024-01-01&end_date=2024-01-31&store_id=1'
      )
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('getChannelPerformance', () => {
    it('should fetch channel performance data', async () => {
      const mockResponse = {
        data: {
          data: [
            { channel_name: 'Channel 1', channel_type: 'P', total_revenue: 1000, sales_count: 10, avg_ticket: 100 },
          ],
        },
      }

      const { apiClient } = await import('../axios')
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await analyticsApi.getChannelPerformance()

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/analytics/channels?')
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('getSummary', () => {
    it('should fetch summary data', async () => {
      const mockResponse = {
        data: {
          total_revenue: 10000,
          sales_count: 100,
          avg_ticket: 100,
          first_sale: '2024-01-01',
          last_sale: '2024-01-31',
        },
      }

      const { apiClient } = await import('../axios')
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await analyticsApi.getSummary()

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/analytics/summary?')
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('getPromotionsAnalysis', () => {
    it('should fetch promotions analysis data', async () => {
      const mockResponse = {
        data: {
          total_discounts: 1000,
          total_increases: 500,
          total_sales: 100,
          sales_with_discount: 50,
          sales_with_increase: 10,
          avg_discount: 20,
          avg_increase: 50,
          discount_percentage: 50,
          increase_percentage: 10,
          discount_reasons: [
            { reason: 'Promoção', count: 30, total_discount: 600 },
          ],
        },
      }

      const { apiClient } = await import('../axios')
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await analyticsApi.getPromotionsAnalysis()

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/analytics/promotions?')
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('getInventoryTurnover', () => {
    it('should fetch inventory turnover data', async () => {
      const mockResponse = {
        data: {
          data: [
            {
              product_id: 1,
              product_name: 'Product 1',
              total_quantity_sold: 100,
              sales_count: 10,
              avg_quantity_per_sale: 10,
              total_revenue: 1000,
              avg_price: 10,
              daily_velocity: 5,
              turnover_score: 0.8,
            },
          ],
        },
      }

      const { apiClient } = await import('../axios')
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await analyticsApi.getInventoryTurnover()

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/analytics/inventory?limit=20')
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('get (generic method)', () => {
    it('should make generic GET requests', async () => {
      const mockResponse = {
        data: { test: 'data' },
      }

      const { apiClient } = await import('../axios')
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await analyticsApi.get('/test-endpoint')

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/test-endpoint')
      expect(result).toEqual(mockResponse.data)
    })
  })
})
