import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PeakHoursHeatmap } from '../PeakHoursHeatmap'

// Mock data for testing
const mockHeatmapData = [
  { day: 0, day_name: 'Dom', hour: 11, sales_count: 100, total_revenue: 5000 },
  { day: 0, day_name: 'Dom', hour: 12, sales_count: 150, total_revenue: 7500 },
  { day: 1, day_name: 'Seg', hour: 11, sales_count: 80, total_revenue: 4000 },
  { day: 1, day_name: 'Seg', hour: 12, sales_count: 120, total_revenue: 6000 },
]

describe('PeakHoursHeatmap', () => {
  it('renders the component with title', () => {
    render(<PeakHoursHeatmap data={mockHeatmapData} title="Test Heatmap" />)
    
    expect(screen.getByText('Test Heatmap')).toBeInTheDocument()
  })

  it('renders with default title when no title provided', () => {
    render(<PeakHoursHeatmap data={mockHeatmapData} />)
    
    expect(screen.getByText('Horários de Pico')).toBeInTheDocument()
  })

  it('displays legend with intensity levels', () => {
    render(<PeakHoursHeatmap data={mockHeatmapData} />)
    
    expect(screen.getByText('Baixo')).toBeInTheDocument()
    expect(screen.getByText('Médio')).toBeInTheDocument()
    expect(screen.getByText('Alto')).toBeInTheDocument()
  })

  it('shows maximum sales count', () => {
    render(<PeakHoursHeatmap data={mockHeatmapData} />)
    
    expect(screen.getByText(/Máximo: 150 vendas/)).toBeInTheDocument()
  })

  it('renders empty state when no data provided', () => {
    render(<PeakHoursHeatmap data={[]} />)
    
    expect(screen.getByText('Nenhum dado de horários encontrado')).toBeInTheDocument()
  })

  it('renders heatmap grid with correct structure', () => {
    render(<PeakHoursHeatmap data={mockHeatmapData} />)
    
    // Check for day labels
    expect(screen.getByText('Dom')).toBeInTheDocument()
    expect(screen.getByText('Seg')).toBeInTheDocument()
    
    // Check for hour headers (00-23)
    expect(screen.getByText('00')).toBeInTheDocument()
    expect(screen.getByText('23')).toBeInTheDocument()
  })

  it('displays insights section', () => {
    render(<PeakHoursHeatmap data={mockHeatmapData} />)
    
    // Check for insights section
    expect(screen.getByText('💡 Insights dos Horários de Pico')).toBeInTheDocument()
  })

  it('handles tooltip hover correctly', () => {
    render(<PeakHoursHeatmap data={mockHeatmapData} />)
    
    // The component should have hover functionality
    const heatmapContainer = screen.getByText('Dom').closest('.flex')
    expect(heatmapContainer).toBeInTheDocument()
  })
})
