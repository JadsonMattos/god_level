import { describe, it, expect } from 'vitest'
import { formatCurrency, formatDate, formatNumber } from '../formatters'

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('formats positive numbers', () => {
      // Use toContain instead of toBe to handle non-breaking spaces
      const result = formatCurrency(1234.56)
      expect(result).toContain('1.234,56')
      expect(result).toContain('R$')
    })

    it('formats zero', () => {
      const result = formatCurrency(0)
      expect(result).toContain('0,00')
      expect(result).toContain('R$')
    })

    it('formats large numbers', () => {
      const result = formatCurrency(1234567.89)
      expect(result).toContain('1.234.567,89')
      expect(result).toContain('R$')
    })

    it('formats negative numbers', () => {
      const result = formatCurrency(-100)
      expect(result).toContain('100,00')
      expect(result).toContain('R$')
      expect(result).toContain('-')
    })

    it('handles decimal precision', () => {
      const result = formatCurrency(100.5)
      expect(result).toContain('100,50')
      expect(result).toContain('R$')
    })
  })

  describe('formatDate', () => {
    it('formats date string', () => {
      // Use UTC date to avoid timezone issues
      const result = formatDate('2024-01-15T00:00:00Z')
      // Accept either 14 or 15 depending on timezone
      expect(result === '14/01/2024' || result === '15/01/2024').toBe(true)
    })

    it('formats Date object', () => {
      // Create date in local timezone
      const date = new Date(2024, 0, 15) // January 15, 2024
      const result = formatDate(date)
      expect(result).toBe('15/01/2024')
    })

    it('handles invalid date', () => {
      expect(formatDate('invalid')).toBe('Data inválida')
    })
  })

  describe('formatNumber', () => {
    it('formats integers', () => {
      expect(formatNumber(1234)).toBe('1.234')
    })

    it('formats decimals', () => {
      expect(formatNumber(1234.56)).toBe('1.234,56')
    })

    it('handles zero', () => {
      expect(formatNumber(0)).toBe('0')
    })

    it('handles large numbers', () => {
      expect(formatNumber(1234567)).toBe('1.234.567')
    })
  })
})


