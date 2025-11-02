import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { TopProductsChart } from '../TopProductsChart'

// Mock Recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}))

describe('TopProductsChart', () => {
  const mockData = [
    { product_name: 'Hambúrguer', total_quantity: 50, total_revenue: 1250, sales_count: 50, avg_price: 25 },
    { product_name: 'Batata', total_quantity: 30, total_revenue: 375, sales_count: 30, avg_price: 12.5 },
  ]

  it('renders with title', () => {
    render(<TopProductsChart data={mockData} title="Top Products" />)
    expect(screen.getByText('Top Products')).toBeInTheDocument()
  })

  it('renders with default title', () => {
    render(<TopProductsChart data={mockData} />)
    expect(screen.getByText('Top Produtos mais Vendidos')).toBeInTheDocument()
  })

  it('renders chart', () => {
    render(<TopProductsChart data={mockData} />)
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
  })

  it('handles empty data', () => {
    render(<TopProductsChart data={[]} />)
    expect(screen.getByText('Top Produtos mais Vendidos')).toBeInTheDocument()
  })
})


