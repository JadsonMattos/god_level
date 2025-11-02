import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ComparisonPage } from '../ComparisonPage'

// Mock hooks
vi.mock('../../hooks/useAnalytics', () => ({
  useRevenue: vi.fn().mockReturnValue({
    data: [{ period: '2024-01-01', revenue: 1000 }],
    loading: false,
    error: null,
  }),
}))

describe('ComparisonPage', () => {
  it('renders comparison title', () => {
    render(<ComparisonPage />)
    // "Comparação" appears in title and button, use getAllByText
    const comparisonTexts = screen.getAllByText(/Comparação/i)
    expect(comparisonTexts.length).toBeGreaterThan(0)
  })

  it('renders period inputs', () => {
    render(<ComparisonPage />)
    // "Período 1" appears multiple times (label and section), use getAllByText
    const period1Texts = screen.getAllByText(/Período 1/i)
    expect(period1Texts.length).toBeGreaterThan(0)
    
    const period2Texts = screen.getAllByText(/Período 2/i)
    expect(period2Texts.length).toBeGreaterThan(0)
  })

  it('renders apply button', () => {
    render(<ComparisonPage />)
    expect(screen.getByText('Aplicar Comparação')).toBeInTheDocument()
  })

  it('renders clear filters button', () => {
    render(<ComparisonPage />)
    expect(screen.getByText('Limpar Filtros')).toBeInTheDocument()
  })
})


