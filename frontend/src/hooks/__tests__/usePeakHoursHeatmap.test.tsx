import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { usePeakHoursHeatmap } from '../useAnalyticsExtended'

// Mock the analytics API
vi.mock('../../services/api', () => ({
  analyticsApi: {
    get: vi.fn(),
  },
}))

describe('usePeakHoursHeatmap', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch peak hours heatmap data successfully', async () => {
    const mockData = [
      { day: 0, day_name: 'Dom', hour: 11, sales_count: 100, total_revenue: 5000 },
      { day: 0, day_name: 'Dom', hour: 12, sales_count: 150, total_revenue: 7500 },
    ]

    const { analyticsApi } = await import('../../services/api')
    vi.mocked(analyticsApi.get).mockResolvedValue({ data: mockData })

    const { result } = renderHook(() => usePeakHoursHeatmap())

    expect(result.current.loading).toBe(true)
    expect(result.current.data).toEqual([])
    expect(result.current.error).toBeNull()

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual(mockData)
    expect(result.current.error).toBeNull()
    expect(analyticsApi.get).toHaveBeenCalledWith('/analytics/peak-hours-heatmap?')
  })

  it('should handle API errors', async () => {
    const errorMessage = 'Failed to fetch data'
    const { analyticsApi } = await import('../../services/api')
    vi.mocked(analyticsApi.get).mockRejectedValue(new Error(errorMessage))

    const { result } = renderHook(() => usePeakHoursHeatmap())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual([])
    expect(result.current.error).toBe(errorMessage)
  })

  it('should apply filters correctly', async () => {
    const mockData = []
    const { analyticsApi } = await import('../../services/api')
    vi.mocked(analyticsApi.get).mockResolvedValue({ data: mockData })

    const filters = {
      start_date: '2024-01-01',
      end_date: '2024-01-31',
      store_id: 1,
      channel_id: 2,
    }

    renderHook(() => usePeakHoursHeatmap(filters))

    await waitFor(() => {
      expect(analyticsApi.get).toHaveBeenCalledWith(
        '/analytics/peak-hours-heatmap?start_date=2024-01-01&end_date=2024-01-31&store_id=1&channel_id=2'
      )
    })
  })

  it('should provide refetch function', async () => {
    const mockData = []
    const { analyticsApi } = await import('../../services/api')
    vi.mocked(analyticsApi.get).mockResolvedValue({ data: mockData })

    const { result } = renderHook(() => usePeakHoursHeatmap())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(typeof result.current.refetch).toBe('function')

    // Test refetch
    act(() => {
      result.current.refetch()
    })

    await waitFor(() => {
      expect(analyticsApi.get).toHaveBeenCalledTimes(2)
    })
  })

  it('should handle empty response', async () => {
    const { analyticsApi } = await import('../../services/api')
    vi.mocked(analyticsApi.get).mockResolvedValue({ data: [] })

    const { result } = renderHook(() => usePeakHoursHeatmap())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('should handle response without data property', async () => {
    const mockData = [{ day: 0, day_name: 'Dom', hour: 11, sales_count: 100, total_revenue: 5000 }]
    const { analyticsApi } = await import('../../services/api')
    vi.mocked(analyticsApi.get).mockResolvedValue(mockData)

    const { result } = renderHook(() => usePeakHoursHeatmap())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual(mockData)
    expect(result.current.error).toBeNull()
  })
})
