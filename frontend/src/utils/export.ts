/**
 * Export utilities for CSV and JSON.
 */

/**
 * Convert data to CSV format and download
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  headers?: string[]
): void {
  if (!data || data.length === 0) {
    alert('Nenhum dado para exportar')
    return
  }

  // Use provided headers or generate from first item keys
  const csvHeaders = headers || Object.keys(data[0])
  
  // Create CSV content
  const csvRows = [
    csvHeaders.join(','), // Header row
    ...data.map(row => 
      csvHeaders.map(header => {
        const value = row[header]
        // Escape commas and quotes in values
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replaceAll('"', '""')}"`
        }
        return value
      }).join(',')
    )
  ]

  const csvContent = csvRows.join('\n')
  
  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    link.remove()
  }
}

/**
 * Export data to JSON
 */
export function exportToJSON<T>(data: T, filename: string): void {
  const jsonContent = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.json`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    link.remove()
  }
}

/**
 * Format data for CSV export with human-friendly column names
 */
export function formatForExport<T extends Record<string, any>>(
  data: T[],
  columnMap?: Record<string, string>
): { data: T[], headers: string[] } {
  if (!data || data.length === 0) {
    return { data: [], headers: [] }
  }

  const headers = columnMap
    ? Object.keys(data[0]).map(key => columnMap[key] || key)
    : Object.keys(data[0])

  return { data, headers }
}

