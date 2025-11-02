import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useRevenue } from '../useAnalytics'

// Mock the analytics API
vi.mock('../../services/api', () => ({
  analyticsApi: {
    getRevenue: vi.fn(),
  },
}))

describe('useRevenue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch revenue data successfully', async () => {
    const mockData = [
      { period: '2024-01-01', revenue: 1000, sales_count: 10, avg_ticket: 100 },
      { period: '2024-01-02', revenue: 1500, sales_count: 15, avg_ticket: 100 },
    ]

    const { analyticsApi } = await import('../../services/api')
    vi.mocked(analyticsApi.getRevenue).mockResolvedValue({ data: mockData, filters: {} })

    const { result } = renderHook(() => useRevenue())

    expect(result.current.loading).toBe(true)
    expect(result.current.data).toEqual([])
    expect(result.current.error).toBeNull()

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual(mockData)
    expect(result.current.error).toBeNull()
    expect(analyticsApi.getRevenue).toHaveBeenCalledWith({}, 'day')
  })

  it('should handle API errors', async () => {
    const errorMessage = 'Failed to fetch revenue data'
    const { analyticsApi } = await import('../../services/api')
    vi.mocked(analyticsApi.getRevenue).mockRejectedValue(new Error(errorMessage))

    const { result } = renderHook(() => useRevenue())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual([])
    expect(result.current.error).toBe(errorMessage)
  })

  it('should apply filters and groupBy correctly', async () => {
    const mockData = []
    const { analyticsApi } = await import('../../services/api')
    vi.mocked(analyticsApi.getRevenue).mockResolvedValue({ data: mockData, filters: {} })

    const filters = {
      start_date: '2024-01-01',
      end_date: '2024-01-31',
      store_id: 1,
    }

    renderHook(() => useRevenue(filters, 'week'))

    await waitFor(() => {
      expect(analyticsApi.getRevenue).toHaveBeenCalledWith(filters, 'week')
    })
  })

  it('should provide refetch function', async () => {
    const mockData = []
    const { analyticsApi } = await import('../../services/api')
    vi.mocked(analyticsApi.getRevenue).mockResolvedValue({ data: mockData, filters: {} })

    const { result } = renderHook(() => useRevenue())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(typeof result.current.refetch).toBe('function')

    // Test refetch
    act(() => {
      result.current.refetch()
    })

    await waitFor(() => {
      expect(analyticsApi.getRevenue).toHaveBeenCalledTimes(2)
    })
  })

  it('should handle empty response', async () => {
    const { analyticsApi } = await import('../../services/api')
    vi.mocked(analyticsApi.getRevenue).mockResolvedValue({ data: [], filters: {} })

    const { result } = renderHook(() => useRevenue())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('should use default groupBy when not provided', async () => {
    const mockData = []
    const { analyticsApi } = await import('../../services/api')
    vi.mocked(analyticsApi.getRevenue).mockResolvedValue({ data: mockData, filters: {} })

    renderHook(() => useRevenue({}))

    await waitFor(() => {
      expect(analyticsApi.getRevenue).toHaveBeenCalledWith({}, 'day')
    })
  })
})
