import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts'

interface DeliveryRegionData {
  neighborhood: string
  city: string
  state: string
  delivery_count: number
  avg_delivery_time: number
  min_delivery_time: number
  max_delivery_time: number
  total_revenue: number
}

interface DeliveryRegionsChartProps {
  data: DeliveryRegionData[]
  title?: string
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C']

const getStatusColor = (time: number) => {
  if (time < 30) return 'bg-green-500'
  if (time < 45) return 'bg-yellow-500'
  return 'bg-red-500'
}

export function DeliveryRegionsChart({ data, title = "Performance de Entrega por Região" }: Readonly<DeliveryRegionsChartProps>) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-3 sm:p-6 w-full">
        <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">{title}</h3>
        <div className="text-center py-6 sm:py-8 text-gray-500 text-sm">
          <p>Nenhum dado de entrega por região encontrado</p>
        </div>
      </div>
    )
  }

  const topRegions = data.slice(0, 20)
  const totalDeliveries = data.reduce((sum, item) => sum + item.delivery_count, 0)
  const totalRevenue = data.reduce((sum, item) => sum + item.total_revenue, 0)
  const avgDeliveryTime = data.reduce((sum, item) => sum + item.avg_delivery_time, 0) / data.length
  
  // Find fastest and slowest regions
  const fastestRegion = data.reduce((min, item) => 
    item.avg_delivery_time < min.avg_delivery_time ? item : min, data[0]
  )
  const slowestRegion = data.reduce((max, item) => 
    item.avg_delivery_time > max.avg_delivery_time ? item : max, data[0]
  )

  return (
    <div className="bg-white rounded-lg shadow p-3 sm:p-6 w-full">
      <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">{title}</h3>
      
      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-blue-50 p-4 sm:p-4 rounded-lg">
          <div className="text-xl sm:text-2xl font-bold text-blue-600">
            {totalDeliveries.toLocaleString()}
          </div>
          <div className="text-sm sm:text-sm text-blue-800 mt-1">Total de Entregas</div>
        </div>
        <div className="bg-green-50 p-4 sm:p-4 rounded-lg">
          <div className="text-xl sm:text-2xl font-bold text-green-600">
            {avgDeliveryTime.toFixed(1)} min
          </div>
          <div className="text-sm sm:text-sm text-green-800 mt-1">Tempo Médio</div>
        </div>
        <div className="bg-purple-50 p-4 sm:p-4 rounded-lg">
          <div className="text-xl sm:text-2xl font-bold text-purple-600">
            R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-sm sm:text-sm text-purple-800 mt-1">Receita Total</div>
        </div>
        <div className="bg-orange-50 p-4 sm:p-4 rounded-lg">
          <div className="text-xl sm:text-2xl font-bold text-orange-600">
            {data.length}
          </div>
          <div className="text-sm sm:text-sm text-orange-800 mt-1">Regiões Atendidas</div>
        </div>
      </div>

      {/* Gráfico de Tempo Médio por Região */}
      <div className="mb-4 sm:mb-6">
        <h4 className="text-sm sm:text-md font-medium text-gray-700 mb-3 sm:mb-3">Tempo Médio de Entrega por Região</h4>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={topRegions}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="neighborhood" 
              angle={-45}
              textAnchor="end"
              height={80}
              fontSize={11}
            />
            <YAxis label={{ value: 'Minutos', angle: -90, position: 'insideLeft' }} />
            <Tooltip 
              formatter={(value, name) => [
                `${value} min`,
                'Tempo Médio'
              ]}
              labelFormatter={(label, payload) => 
                payload?.[0]?.payload ? 
                `${payload[0].payload.neighborhood}, ${payload[0].payload.city}` : 
                label
              }
            />
            <Bar dataKey="avg_delivery_time" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de Scatter: Tempo vs Quantidade */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 mb-3">Relação: Tempo de Entrega vs Quantidade de Entregas</h4>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart data={topRegions}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="delivery_count" 
              name="Entregas"
              label={{ value: 'Quantidade de Entregas', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              dataKey="avg_delivery_time" 
              name="Tempo"
              label={{ value: 'Tempo Médio (min)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              formatter={(value, name) => [
                name === 'avg_delivery_time' ? `${value} min` : `${value} entregas`,
                name === 'avg_delivery_time' ? 'Tempo Médio' : 'Quantidade'
              ]}
              labelFormatter={(label, payload) => 
                payload?.[0]?.payload ? 
                `${payload[0].payload.neighborhood}, ${payload[0].payload.city}` : 
                label
              }
            />
            <Scatter dataKey="avg_delivery_time" fill="#8884d8" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Tabela Detalhada */}
      <div className="mt-6">
        <h4 className="text-md font-medium text-gray-700 mb-3">Detalhes por Região</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Região
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entregas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tempo Médio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tempo Min/Max
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Receita Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Receita/Entrega
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((region, index) => (
                <tr key={`${region.neighborhood}-${region.city}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div>
                      <div className="font-medium">{region.neighborhood}</div>
                      <div className="text-xs text-gray-500">{region.city}, {region.state}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {region.delivery_count.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${getStatusColor(region.avg_delivery_time)}`}></div>
                      {region.avg_delivery_time.toFixed(1)} min
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {region.min_delivery_time} - {region.max_delivery_time} min
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    R$ {region.total_revenue.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    R$ {(region.total_revenue / region.delivery_count).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">💡 Insights de Entrega por Região</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <div>
            <strong>Região com mais entregas:</strong> {data[0]?.neighborhood}, {data[0]?.city} ({data[0]?.delivery_count} entregas)
          </div>
          <div>
            <strong>Região mais rápida:</strong> {fastestRegion.neighborhood} ({fastestRegion.avg_delivery_time.toFixed(1)} min)
          </div>
          <div>
            <strong>Região mais lenta:</strong> {slowestRegion.neighborhood} ({slowestRegion.avg_delivery_time.toFixed(1)} min)
          </div>
          <div>
            <strong>Regiões com tempo excelente (&lt;30min):</strong> {
              data.filter(item => item.avg_delivery_time < 30).length
            } regiões
          </div>
          <div>
            <strong>Regiões com tempo crítico (&gt;45min):</strong> {
              data.filter(item => item.avg_delivery_time > 45).length
            } regiões
          </div>
        </div>
      </div>
    </div>
  )
}
