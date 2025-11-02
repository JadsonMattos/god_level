import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { RevenueChart } from '../RevenueChart'

// Mock Recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}))

describe('RevenueChart', () => {
  const mockData = [
    { period: '2024-01-01', revenue: 1000, sales_count: 10, avg_ticket: 100 },
    { period: '2024-01-02', revenue: 1500, sales_count: 15, avg_ticket: 100 },
  ]

  it('renders with title', () => {
    render(<RevenueChart data={mockData} title="Test Chart" />)
    expect(screen.getByText('Test Chart')).toBeInTheDocument()
  })

  it('renders with default title', () => {
    render(<RevenueChart data={mockData} />)
    expect(screen.getByText('Faturamento ao Longo do Tempo')).toBeInTheDocument()
  })

  it('renders chart with data', () => {
    render(<RevenueChart data={mockData} />)
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
  })

  it('handles empty data', () => {
    render(<RevenueChart data={[]} />)
    expect(screen.getByText('Faturamento ao Longo do Tempo')).toBeInTheDocument()
  })

  it('handles null data', () => {
    render(<RevenueChart data={null as any} />)
    expect(screen.getByText('Faturamento ao Longo do Tempo')).toBeInTheDocument()
  })
})


