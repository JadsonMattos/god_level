import React from 'react'

interface HeatmapData {
  day: number
  day_name: string
  hour: number
  sales_count: number
  total_revenue: number
}

interface PeakHoursHeatmapProps {
  data: HeatmapData[]
  title?: string
}

const getIntensity = (value: number, max: number) => {
  return Math.min(value / max, 1)
}

const getColor = (intensity: number) => {
  // Color scale from light blue to dark red
  const hue = intensity * 240 // Blue to red
  const saturation = 70 + (intensity * 30) // 70% to 100%
  const lightness = 90 - (intensity * 40) // 90% to 50%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

export function PeakHoursHeatmap({ data, title = "Horários de Pico" }: Readonly<PeakHoursHeatmapProps>) {
  // Create a matrix for the heatmap
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const hours = Array.from({ length: 24 }, (_, i) => i)
  
  // Initialize matrix with zeros
  const matrix = days.map(() => hours.map(() => ({ sales: 0, revenue: 0 })))
  
  // Fill matrix with data
  for (const item of data) {
    if (item.day >= 0 && item.day < 7 && item.hour >= 0 && item.hour < 24) {
      matrix[item.day][item.hour] = {
        sales: item.sales_count,
        revenue: item.total_revenue
      }
    }
  }
  
  // Find max values for normalization
  const maxSales = Math.max(...data.map(d => d.sales_count), 1)

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6 w-full">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-4">{title}</h3>
      
      {data.length === 0 ? (
        <div className="text-center py-6 sm:py-8 text-gray-500 text-sm">
          <p>Nenhum dado de horários encontrado</p>
        </div>
      ) : (
        <>
          {/* Legend */}
          <div className="mb-4 sm:mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="flex items-center space-x-2 sm:space-x-2">
                <div className="w-4 h-4 sm:w-4 sm:h-4 bg-blue-200 rounded"></div>
                <span className="text-sm sm:text-sm text-gray-600">Baixo</span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-2">
                <div className="w-4 h-4 sm:w-4 sm:h-4 bg-yellow-200 rounded"></div>
                <span className="text-sm sm:text-sm text-gray-600">Médio</span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-2">
                <div className="w-4 h-4 sm:w-4 sm:h-4 bg-red-200 rounded"></div>
                <span className="text-sm sm:text-sm text-gray-600">Alto</span>
              </div>
            </div>
            <div className="text-sm sm:text-sm text-gray-500">
              Máximo: {maxSales} vendas
            </div>
          </div>
          
          {/* Heatmap Grid */}
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              {/* Header with hours */}
              <div className="flex">
                <div className="w-14 sm:w-16 flex-shrink-0"></div>
                {hours.map(hour => (
                  <div key={hour} className="w-7 sm:w-8 text-xs sm:text-xs text-center text-gray-600 font-medium">
                    {hour.toString().padStart(2, '0')}
                  </div>
                ))}
              </div>
              
              {/* Heatmap rows */}
              {days.map((day, dayIndex) => (
                <div key={day} className="flex items-center">
                  <div className="w-14 sm:w-16 flex-shrink-0 text-sm sm:text-sm font-medium text-gray-700 pr-2 sm:pr-2">
                    {day}
                  </div>
                  {hours.map(hour => {
                    const cellData = matrix[dayIndex][hour]
                    const intensity = getIntensity(cellData.sales, maxSales)
                    const color = getColor(intensity)
                    
                    return (
                      <div
                        key={`${dayIndex}-${hour}`}
                        className="w-7 h-7 sm:w-8 sm:h-8 border border-gray-200 cursor-pointer hover:border-gray-400 transition-colors"
                        style={{ backgroundColor: color }}
                        title={`${day} ${hour}:00 - ${cellData.sales} vendas - R$ ${cellData.revenue.toFixed(2)}`}
                      >
                        {cellData.sales > 0 && (
                          <div className="w-full h-full flex items-center justify-center text-[10px] sm:text-xs font-bold text-white">
                            {cellData.sales > 99 ? '99+' : cellData.sales}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
          
          {/* Insights */}
          <div className="mt-3 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm sm:text-base font-semibold text-gray-800 mb-2">💡 Insights dos Horários de Pico</h4>
            <div className="text-xs sm:text-sm text-gray-600 space-y-1">
              {(() => {
                const sortedData = [...data].sort((a, b) => b.sales_count - a.sales_count)
                const peakData = sortedData.slice(0, 3)
                return peakData.map((item) => (
                  <div key={`${item.day}-${item.hour}`}>
                    <strong>{item.day_name} às {item.hour}:00</strong> - {item.sales_count} vendas
                  </div>
                ))
              })()}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
