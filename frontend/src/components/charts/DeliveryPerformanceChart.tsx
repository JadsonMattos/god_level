import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface DeliveryData {
  period: string
  total_deliveries: number
  avg_delivery_time: number
  min_delivery_time: number
  max_delivery_time: number
}

interface DeliveryPerformanceChartProps {
  data: DeliveryData[]
  title?: string
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) {
    return null
  }
  
  const data = payload[0].payload
  return (
    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
      <p className="font-semibold text-gray-800">Período: {label}</p>
      <p className="text-sm text-gray-600">
        Tempo Médio: <span className="font-medium">{data.avgTime.toFixed(1)} min</span>
      </p>
      <p className="text-sm text-gray-600">
        Tempo Mínimo: <span className="font-medium">{data.minTime} min</span>
      </p>
      <p className="text-sm text-gray-600">
        Tempo Máximo: <span className="font-medium">{data.maxTime} min</span>
      </p>
      <p className="text-sm text-gray-600">
        Total Entregas: <span className="font-medium">{data.deliveries}</span>
      </p>
    </div>
  )
}

export function DeliveryPerformanceChart({ data, title = "Performance de Entrega" }: Readonly<DeliveryPerformanceChartProps>) {
  // Format data for chart
  const chartData = data.map(item => ({
    period: item.period,
    avgTime: item.avg_delivery_time,
    minTime: item.min_delivery_time,
    maxTime: item.max_delivery_time,
    deliveries: item.total_deliveries
  }))

  // Calculate average delivery time for reference
  const avgDeliveryTime = data.length > 0 
    ? data.reduce((sum, item) => sum + item.avg_delivery_time, 0) / data.length 
    : 0

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6 w-full">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-4">{title}</h3>
      
      {data.length === 0 ? (
        <div className="text-center py-6 sm:py-8 text-gray-500 text-sm">
          <p>Nenhum dado de entrega encontrado</p>
        </div>
      ) : (
        <>
          <div className="mb-4 sm:mb-4 p-3 sm:p-3 bg-blue-50 rounded-lg">
            <p className="text-sm sm:text-sm text-blue-800">
              <strong>Tempo médio geral:</strong> {avgDeliveryTime.toFixed(1)} minutos
            </p>
          </div>
          
          <div className="h-72 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="period" 
                  fontSize={10}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  label={{ value: 'Tempo (min)', angle: -90, position: 'insideLeft', fontSize: 10 }}
                  fontSize={10}
                  width={50}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="avgTime" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                  name="Tempo Médio"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
      
      <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600">
        <p>💡 <strong>Insight:</strong> Tempos de entrega acima de 45 minutos podem indicar problemas operacionais.</p>
      </div>
    </div>
  )
}
