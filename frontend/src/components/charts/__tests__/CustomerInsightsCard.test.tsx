import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { CustomerInsightsCard } from '../CustomerInsightsCard'

describe('CustomerInsightsCard', () => {
  const mockData = {
    total_customers: 1000,
    frequent_customers: 150,
    inactive_customers: 50,
    avg_purchases_per_customer: 2.5,
    frequent_customer_percentage: 15,
    inactive_customer_percentage: 5,
  }

  it('renders all metrics', () => {
    render(<CustomerInsightsCard data={mockData} />)

    expect(screen.getByText(/Total de Clientes/i)).toBeInTheDocument()
    expect(screen.getByText(/Clientes Frequentes/i)).toBeInTheDocument()
    expect(screen.getByText(/Clientes Inativos/i)).toBeInTheDocument()
  })

  it('displays correct values', () => {
    render(<CustomerInsightsCard data={mockData} />)

    // Check for formatted values (1.000 instead of 1000)
    expect(screen.getByText('1.000')).toBeInTheDocument()
    expect(screen.getByText('150')).toBeInTheDocument()
    
    // "50" appears multiple times (value and percentage), use getAllByText
    const fiftyTexts = screen.getAllByText('50')
    expect(fiftyTexts.length).toBeGreaterThan(0)
  })

  it('handles zero values', () => {
    const zeroData = {
      total_customers: 0,
      frequent_customers: 0,
      inactive_customers: 0,
      avg_purchases_per_customer: 0,
      frequent_customer_percentage: 0,
      inactive_customer_percentage: 0,
    }

    render(<CustomerInsightsCard data={zeroData} />)

    // Zero appears multiple times, so check that at least one exists
    const zeros = screen.getAllByText(/^0$/i)
    expect(zeros.length).toBeGreaterThan(0)
  })
})


