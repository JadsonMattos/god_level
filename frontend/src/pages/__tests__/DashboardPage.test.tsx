import { render, screen, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DashboardPage } from '../DashboardPage'

// Mock hooks
const mockUseSummary = vi.fn()
const mockUseRevenue = vi.fn()
const mockUseTopProducts = vi.fn()
const mockUseChannelPerformance = vi.fn()

vi.mock('../../hooks/useAnalytics', () => ({
  useSummary: () => mockUseSummary(),
  useRevenue: () => mockUseRevenue(),
  useTopProducts: () => mockUseTopProducts(),
  useChannelPerformance: () => mockUseChannelPerformance(),
}))

// Mock dashboard API
vi.mock('../../services/dashboardApi', () => ({
  dashboardApi: {
    getDefault: vi.fn().mockResolvedValue(null),
  },
}))

// Mock components
vi.mock('../../components/filters/AdvancedFilters', () => ({
  AdvancedFilters: () => <div data-testid="advanced-filters">Filters</div>,
}))

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseSummary.mockReturnValue({
      data: { total_revenue: 1000, sales_count: 10, avg_ticket: 100 },
      loading: false,
      error: null,
    })
    mockUseRevenue.mockReturnValue({
      data: [{ period: '2024-01-01', revenue: 1000 }],
      loading: false,
      error: null,
    })
    mockUseTopProducts.mockReturnValue({
      data: [{ product_name: 'Product', total_quantity: 10 }],
      loading: false,
    })
    mockUseChannelPerformance.mockReturnValue({
      data: [{ channel_name: 'Channel', total_revenue: 500 }],
      loading: false,
    })
  })

  it('renders dashboard title', async () => {
    await act(async () => {
      render(<DashboardPage />)
    })
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })
  })

  it('renders export button', async () => {
    await act(async () => {
      render(<DashboardPage />)
    })
    await waitFor(() => {
      expect(screen.getByText('Exportar CSV')).toBeInTheDocument()
    })
  })

  it('renders advanced filters', async () => {
    await act(async () => {
      render(<DashboardPage />)
    })
    await waitFor(() => {
      expect(screen.getByTestId('advanced-filters')).toBeInTheDocument()
    })
  })

  it('renders summary cards when data is available', async () => {
    await act(async () => {
      render(<DashboardPage />)
    })
    await waitFor(() => {
      expect(screen.getByText('Faturamento Total')).toBeInTheDocument()
    })
  })

  it('handles loading state', async () => {
    mockUseSummary.mockReturnValue({ loading: true, data: null, error: null })
    mockUseRevenue.mockReturnValue({ loading: true, data: [], error: null })

    await act(async () => {
      render(<DashboardPage />)
    })
    await waitFor(() => {
      expect(screen.getByText('Carregando dashboard...')).toBeInTheDocument()
    })
  })

  it('handles error state', async () => {
    mockUseSummary.mockReturnValue({
      data: null,
      loading: false,
      error: 'Erro ao carregar dados',
    })
    mockUseRevenue.mockReturnValue({
      data: [],
      loading: false,
      error: null,
    })

    await act(async () => {
      render(<DashboardPage />)
    })
    
    // Error message appears multiple times (title and message) - use getAllByText
    const errorElements = screen.getAllByText('Erro ao carregar dados')
    expect(errorElements.length).toBeGreaterThan(0)
    expect(errorElements[0]).toBeInTheDocument()
  })
})


