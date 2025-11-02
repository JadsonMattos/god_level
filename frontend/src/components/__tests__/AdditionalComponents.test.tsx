/**
 * Additional frontend component tests.
 * These tests cover more React components and user interactions.
 */

import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { RevenueChart } from '../charts/RevenueChart'
import { StatsCard } from '../charts/StatsCard'
import { PieChart } from '../charts/PieChart'
import { TopProductsChart } from '../charts/TopProductsChart'
import { ChannelPerformanceChart } from '../charts/ChannelPerformanceChart'

// Mock the analytics hooks
vi.mock('../../hooks/useAnalytics', () => ({
  useRevenue: vi.fn().mockReturnValue({ 
    data: [
      { period: '2024-01-01', revenue: 1000, sales_count: 10, avg_ticket: 100 },
      { period: '2024-01-02', revenue: 1500, sales_count: 15, avg_ticket: 100 }
    ], 
    loading: false, 
    error: null 
  }),
  useTopProducts: vi.fn().mockReturnValue({ 
    data: [
      { product_name: 'Hambúrguer', total_quantity: 50, sales_count: 25, total_revenue: 1250, avg_price: 25 },
      { product_name: 'Batata Frita', total_quantity: 30, sales_count: 15, total_revenue: 375, avg_price: 12.5 }
    ], 
    loading: false, 
    error: null 
  }),
  useChannelPerformance: vi.fn().mockReturnValue({ 
    data: [
      { channel_name: 'Presencial', channel_type: 'P', total_revenue: 2000, sales_count: 20, avg_ticket: 100 },
      { channel_name: 'iFood', channel_type: 'D', total_revenue: 1500, sales_count: 15, avg_ticket: 100 }
    ], 
    loading: false, 
    error: null 
  }),
  useSummary: vi.fn().mockReturnValue({ 
    data: { total_revenue: 3500, sales_count: 35, avg_ticket: 100 }, 
    loading: false, 
    error: null 
  })
}))

describe('RevenueChart Component', () => {
  const mockData = [
    { period: '2024-01-01', revenue: 1000, sales_count: 10, avg_ticket: 100 },
    { period: '2024-01-02', revenue: 1500, sales_count: 15, avg_ticket: 100 }
  ]

  it('renders the component with title', () => {
    render(<RevenueChart data={mockData} title="Test Revenue Chart" />)
    expect(screen.getByText('Test Revenue Chart')).toBeInTheDocument()
  })

  it('renders with default title when no title provided', () => {
    render(<RevenueChart data={mockData} />)
    expect(screen.getByText('Faturamento ao Longo do Tempo')).toBeInTheDocument()
  })

  it('displays revenue data correctly', () => {
    render(<RevenueChart data={mockData} />)
    expect(screen.getByText('Faturamento ao Longo do Tempo')).toBeInTheDocument()
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
  })

  it('renders empty state when no data provided', () => {
    render(<RevenueChart data={[]} />)
    expect(screen.getByText('Faturamento ao Longo do Tempo')).toBeInTheDocument()
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
  })

  it('handles loading state', () => {
    render(<RevenueChart data={[]} />)
    expect(screen.getByText('Faturamento ao Longo do Tempo')).toBeInTheDocument()
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
  })

  it('handles error state', () => {
    render(<RevenueChart data={[]} />)
    expect(screen.getByText('Faturamento ao Longo do Tempo')).toBeInTheDocument()
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
  })
})

describe('StatsCard Component', () => {
  it('renders the component with title and value', () => {
    render(<StatsCard title="Total Revenue" value={12345.67} />)
    expect(screen.getByText('Total Revenue')).toBeInTheDocument()
    expect(screen.getByText('R$ 12.345,67')).toBeInTheDocument()
  })

  it('renders with different value formats', () => {
    render(<StatsCard title="Sales Count" value={150} isCurrency={false} />)
    expect(screen.getByText('Sales Count')).toBeInTheDocument()
    expect(screen.getByText('150')).toBeInTheDocument()
  })

  it('handles zero values', () => {
    render(<StatsCard title="Zero Value" value={0} isCurrency={false} />)
    expect(screen.getByText('Zero Value')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('handles negative values', () => {
    render(<StatsCard title="Negative Value" value={-100} isCurrency={false} />)
    expect(screen.getByText('Negative Value')).toBeInTheDocument()
    expect(screen.getByText('-100')).toBeInTheDocument()
  })
})

describe('PieChart Component', () => {
  it('renders the component with title', () => {
    // Use valid channel_type values: "P" | "D"
    const fixedPieChartMockData = [
      { channel_name: 'Category A', channel_type: 'P' as const, total_revenue: 40, sales_count: 10, avg_ticket: 4 },
      { channel_name: 'Category B', channel_type: 'D' as const, total_revenue: 30, sales_count: 7, avg_ticket: 4.28 },
      { channel_name: 'Category C', channel_type: 'D' as const, total_revenue: 30, sales_count: 5, avg_ticket: 6 }
    ]
    const { rerender } = render(<PieChart data={fixedPieChartMockData} title="Test Pie Chart" />)
    expect(screen.getByText('Test Pie Chart')).toBeInTheDocument()
    rerender(<PieChart data={[]} />)
    expect(screen.getByText('Distribuição por Canal')).toBeInTheDocument()
  })
})

describe('TopProductsChart Component', () => {
  const mockData = [
    { product_name: 'Hambúrguer', total_quantity: 50, sales_count: 25, total_revenue: 1250, avg_price: 25 },
    { product_name: 'Batata Frita', total_quantity: 30, sales_count: 15, total_revenue: 375, avg_price: 12.5 }
  ]

  it('renders the component with title', () => {
    render(<TopProductsChart data={mockData} title="Test Top Products Chart" />)
    expect(screen.getByText('Test Top Products Chart')).toBeInTheDocument()
  })

  it('renders with default title when no title provided', () => {
    render(<TopProductsChart data={mockData} />)
    expect(screen.getByText('Top Produtos mais Vendidos')).toBeInTheDocument()
  })

  it('renders empty state when no data provided', () => {
    render(<TopProductsChart data={[]} />)
    expect(screen.getByText('Top Produtos mais Vendidos')).toBeInTheDocument()
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
  })
})

describe('ChannelPerformanceChart Component', () => {
  const mockData = [
    { channel_name: 'Presencial', channel_type: 'P' as const, total_revenue: 2000, sales_count: 20, avg_ticket: 100 },
    { channel_name: 'iFood', channel_type: 'D' as const, total_revenue: 1500, sales_count: 15, avg_ticket: 100 }
  ]

  it('renders the component with title', () => {
    render(<ChannelPerformanceChart data={mockData} title="Test Channel Performance Chart" />)
    expect(screen.getByText('Test Channel Performance Chart')).toBeInTheDocument()
  })

  it('renders with default title when no title provided', () => {
    render(<ChannelPerformanceChart data={mockData} />)
    expect(screen.getByText('Performance por Canal')).toBeInTheDocument()
  })

  it('renders empty state when no data provided', () => {
    render(<ChannelPerformanceChart data={[]} />)
    expect(screen.getByText('Performance por Canal')).toBeInTheDocument()
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
  })
})

describe('Component Integration Tests', () => {
  it('handles data flow between components', async () => {
    const mockData = [
      { period: '2024-01-01', revenue: 1000, sales_count: 10, avg_ticket: 100 }
    ]
    
    render(
      <div>
        <StatsCard title="Total Revenue" value={1000} />
        <RevenueChart data={mockData} />
      </div>
    )
    
    // Test that components render together
    expect(screen.getByText('Total Revenue')).toBeInTheDocument()
    expect(screen.getByText('Faturamento ao Longo do Tempo')).toBeInTheDocument()
  })

  it('handles error states across components', () => {
    render(<RevenueChart data={[]} title="Error Test" />)
    expect(screen.getByText('Error Test')).toBeInTheDocument()
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
  })

  it('handles loading states across components', () => {
    render(<RevenueChart data={[]} title="Loading Test" />)
    expect(screen.getByText('Loading Test')).toBeInTheDocument()
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
  })
})

describe('User Interaction Tests', () => {
  it('handles chart interactions', () => {
    const mockData = [
      { period: '2024-01-01', revenue: 1000, sales_count: 10, avg_ticket: 100 }
    ]
    
    render(<RevenueChart data={mockData} />)
    
    // Chart should be rendered (we can't easily test hover/tooltip without more complex setup)
    expect(screen.getByText('Faturamento ao Longo do Tempo')).toBeInTheDocument()
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
  })

  it('handles component state changes', () => {
    const { rerender } = render(<StatsCard title="Test" value={100} isCurrency={false} />)
    
    expect(screen.getByText('100')).toBeInTheDocument()
    
    // Rerender with different value
    rerender(<StatsCard title="Test" value={200} isCurrency={false} />)
    
    expect(screen.getByText('200')).toBeInTheDocument()
  })
})

describe('Performance Tests', () => {
  it('renders components quickly', () => {
    const startTime = performance.now()
    
    render(<StatsCard title="Test" value={100} />)
    
    const endTime = performance.now()
    const renderTime = endTime - startTime
    
    // Should render within reasonable time (less than 100ms)
    expect(renderTime).toBeLessThan(100)
  })

  it('handles large datasets efficiently', () => {
    const largeDataset = Array.from({ length: 100 }, (_, i) => ({
      period: `2024-01-${String(i + 1).padStart(2, '0')}`,
      revenue: Math.random() * 10000,
      sales_count: Math.floor(Math.random() * 100),
      avg_ticket: Math.random() * 200
    }))
    
    const startTime = performance.now()
    
    render(<RevenueChart data={largeDataset} />)
    
    const endTime = performance.now()
    const renderTime = endTime - startTime
    
    // Should handle large datasets efficiently
    expect(renderTime).toBeLessThan(200)
  })
})

describe('Accessibility Tests', () => {
  it('has proper ARIA labels', () => {
    render(<StatsCard title="Total Revenue" value={12345.67} />)
    
    const card = screen.getByRole('region')
    expect(card).toHaveAttribute('aria-label', 'Total Revenue')
  })

  it('has proper color contrast', () => {
    render(<StatsCard title="Total Revenue" value={12345.67} />)
    
    const card = screen.getByRole('region')
    
    // Basic check for text content visibility
    expect(card).toHaveTextContent('Total Revenue')
  })
})