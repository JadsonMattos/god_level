import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AdvancedFilters } from '../AdvancedFilters'

// Mock stores API
vi.mock('../../../services/api', () => ({
  storesApi: {
    getStores: vi.fn().mockResolvedValue({
      data: [
        { id: 1, name: 'Loja 1', city: 'SP', state: 'SP' },
        { id: 2, name: 'Loja 2', city: 'RJ', state: 'RJ' },
      ],
    }),
    getChannels: vi.fn().mockResolvedValue({
      data: [
        { id: 1, name: 'Presencial' },
        { id: 2, name: 'iFood' },
      ],
    }),
  },
}))

describe('AdvancedFilters', () => {
  const mockFilters = {
    start_date: '2024-01-01',
    end_date: '2024-01-31',
    store_id: undefined,
    channel_id: undefined,
  }

  const mockOnChange = vi.fn()
  const mockOnApply = vi.fn()
  const mockOnClear = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders filter inputs', () => {
    render(
      <AdvancedFilters
        filters={mockFilters}
        onChange={mockOnChange}
        onApply={mockOnApply}
        onClear={mockOnClear}
      />
    )

    // Open filters first
    const toggleButton = screen.getByText(/Filtros Avançados/i)
    fireEvent.click(toggleButton)

    expect(screen.getByLabelText(/Data Inicial/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Data Final/i)).toBeInTheDocument()
  })

  it('calls onChange when date is changed', () => {
    render(
      <AdvancedFilters
        filters={mockFilters}
        onChange={mockOnChange}
        onApply={mockOnApply}
        onClear={mockOnClear}
      />
    )

    // Open filters first
    const toggleButton = screen.getByText(/Filtros Avançados/i)
    fireEvent.click(toggleButton)

    const startDateInput = screen.getByLabelText(/Data Inicial/i)
    fireEvent.change(startDateInput, { target: { value: '2024-02-01' } })

    expect(mockOnChange).toHaveBeenCalled()
  })

  it('calls onApply when apply button is clicked', () => {
    render(
      <AdvancedFilters
        filters={mockFilters}
        onChange={mockOnChange}
        onApply={mockOnApply}
        onClear={mockOnClear}
      />
    )

    // Open filters first
    const toggleButton = screen.getByText(/Filtros Avançados/i)
    fireEvent.click(toggleButton)

    const applyButton = screen.getByRole('button', { name: /Aplicar Filtros/i })
    fireEvent.click(applyButton)

    expect(mockOnApply).toHaveBeenCalled()
  })

  it('calls onClear when clear button is clicked', () => {
    render(
      <AdvancedFilters
        filters={mockFilters}
        onChange={mockOnChange}
        onApply={mockOnApply}
        onClear={mockOnClear}
      />
    )

    // Open filters first
    const toggleButton = screen.getByText(/Filtros Avançados/i)
    fireEvent.click(toggleButton)

    const clearButton = screen.getByRole('button', { name: /Limpar/i })
    fireEvent.click(clearButton)

    expect(mockOnClear).toHaveBeenCalled()
  })

  it('renders stores dropdown when loaded', async () => {
    render(
      <AdvancedFilters
        filters={mockFilters}
        onChange={mockOnChange}
        onApply={mockOnApply}
        onClear={mockOnClear}
      />
    )

    // Open filters first
    const toggleButton = screen.getByText(/Filtros Avançados/i)
    fireEvent.click(toggleButton)

    // Wait for loading to complete and stores select to be available
    await waitFor(
      () => {
        const storeSelect = screen.getByLabelText(/Loja/i)
        expect(storeSelect).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
  })
})


