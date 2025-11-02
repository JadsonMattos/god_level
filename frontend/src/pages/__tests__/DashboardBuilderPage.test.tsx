import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DashboardBuilderPage } from '../../pages/DashboardBuilderPage'

// Mock the ResponsiveGridLayout component
vi.mock('react-grid-layout', () => ({
  Responsive: ({ children }: { children: React.ReactNode }) => <div data-testid="grid-layout">{children}</div>,
  WidthProvider: (Component: any) => Component,
}))

// Mock the dashboard API
vi.mock('../../services/dashboardApi', () => ({
  dashboardApi: {
    list: vi.fn().mockResolvedValue({ items: [], total: 0 }),
    create: vi.fn().mockResolvedValue({ id: 1, name: 'Test Dashboard' }),
    get: vi.fn().mockResolvedValue({ id: 1, name: 'Test Dashboard' }),
  },
}))

// Mock the analytics hooks
vi.mock('../../hooks/useAnalyticsExtended', () => ({
  useProductsMargin: vi.fn().mockReturnValue({ data: [] }),
  useDeliveryPerformance: vi.fn().mockReturnValue({ data: [] }),
  useCustomerInsights: vi.fn().mockReturnValue({ data: {} }),
  usePeakHoursHeatmap: vi.fn().mockReturnValue({ data: [] }),
}))

vi.mock('../../hooks/useAdvancedAnalytics', () => ({
  useTopItems: vi.fn().mockReturnValue({ data: [] }),
  useProductsCustomizations: vi.fn().mockReturnValue({ data: [] }),
  usePaymentMix: vi.fn().mockReturnValue({ data: [] }),
  useDeliveryRegions: vi.fn().mockReturnValue({ data: [] }),
}))

vi.mock('../../hooks/useAnomalyAlerts', () => ({
  useAnomalyAlerts: vi.fn().mockReturnValue({ data: [] }),
}))

describe('DashboardBuilderPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the dashboard builder page', () => {
    render(<DashboardBuilderPage />)
    
    expect(screen.getByText('🛠️ Dashboard Builder')).toBeInTheDocument()
  })

  it('displays available widgets', () => {
    render(<DashboardBuilderPage />)
    
    // Check for some key widgets
    expect(screen.getByText('Horários de Pico')).toBeInTheDocument()
    expect(screen.getByText('Alertas de Anomalias')).toBeInTheDocument()
    expect(screen.getByText('Produtos com Menor Margem')).toBeInTheDocument()
  })

  it('shows save dashboard form', () => {
    render(<DashboardBuilderPage />)
    
    expect(screen.getByLabelText('Nome do Dashboard')).toBeInTheDocument()
    expect(screen.getByLabelText('Descrição')).toBeInTheDocument()
    expect(screen.getByText('Salvando...')).toBeInTheDocument()
  })

  it('shows saved dashboards list', () => {
    render(<DashboardBuilderPage />)
    
    expect(screen.getByText('Dashboards Salvos')).toBeInTheDocument()
  })

  it('displays filters section', () => {
    render(<DashboardBuilderPage />)
    
    expect(screen.getByText('Filtros')).toBeInTheDocument()
  })

  it('renders canvas area', () => {
    render(<DashboardBuilderPage />)
    
    expect(screen.getByText('Dashboard Canvas')).toBeInTheDocument()
  })
})