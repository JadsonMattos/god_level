import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

interface StoreGrowthData {
  store_id: number
  store_name: string
  city: string
  state: string
  total_growth_rate: number
  avg_monthly_growth: number
  growth_pattern: 'growing' | 'declining' | 'stable' | 'volatile'
  trend_strength: number
  growth_variance: number
  months_analyzed: number
  first_month_revenue: number
  last_month_revenue: number
  monthly_data: Array<{
    month: string
    revenue: number
    sales: number
  }>
}

interface StoreGrowthChartProps {
  data: StoreGrowthData[]
  title?: string
}

const GROWTH_COLORS = {
  growing: '#10B981',
  declining: '#EF4444',
  stable: '#6B7280',
  volatile: '#F59E0B'
}

const GROWTH_LABELS = {
  growing: 'Crescendo',
  declining: 'Declinando',
  stable: 'Estável',
  volatile: 'Volátil'
}

const getGrowthBadgeClass = (pattern: string) => {
  if (pattern === 'growing') return 'bg-green-100 text-green-800'
  if (pattern === 'declining') return 'bg-red-100 text-red-800'
  if (pattern === 'stable') return 'bg-gray-100 text-gray-800'
  return 'bg-yellow-100 text-yellow-800'
}

const getGrowthRateClass = (rate: number) => {
  if (rate > 0) return 'text-green-600'
  if (rate < 0) return 'text-red-600'
  return 'text-gray-600'
}

const getProgressBarStyle = (strength: number) => ({
  width: `${Math.min(strength * 100, 100)}%`
})

export function StoreGrowthChart({ data, title = "Análise de Crescimento das Lojas" }: Readonly<StoreGrowthChartProps>) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="text-center py-8 text-gray-500">
          <p>Nenhum dado de crescimento encontrado</p>
        </div>
      </div>
    )
  }

  const growingStores = data.filter(store => store.growth_pattern === 'growing')
  const decliningStores = data.filter(store => store.growth_pattern === 'declining')
  const stableStores = data.filter(store => store.growth_pattern === 'stable')
  const volatileStores = data.filter(store => store.growth_pattern === 'volatile')

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {growingStores.length}
          </div>
          <div className="text-sm text-green-800">Lojas Crescendo</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-red-600">
            {decliningStores.length}
          </div>
          <div className="text-sm text-red-800">Lojas Declinando</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-gray-600">
            {stableStores.length}
          </div>
          <div className="text-sm text-gray-800">Lojas Estáveis</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">
            {volatileStores.length}
          </div>
          <div className="text-sm text-yellow-800">Lojas Voláteis</div>
        </div>
      </div>

      {/* Gráfico de Crescimento Total */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 mb-3">Taxa de Crescimento Total por Loja</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.slice(0, 15)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="store_name" 
              angle={-45}
              textAnchor="end"
              height={80}
              fontSize={11}
            />
            <YAxis label={{ value: 'Taxa de Crescimento (%)', angle: -90, position: 'insideLeft' }} />
            <Tooltip 
              formatter={(value, name) => [`${value}%`, 'Taxa de Crescimento']}
              labelFormatter={(label) => `Loja: ${label}`}
            />
            <Bar 
              dataKey="total_growth_rate" 
              fill="#10B981"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de Tendência Mensal - Top 5 Lojas */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 mb-3">Tendência Mensal - Top 5 Lojas</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { month: 'short' })}
            />
            <YAxis label={{ value: 'Receita (R$)', angle: -90, position: 'insideLeft' }} />
            <Tooltip 
              formatter={(value) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Receita']}
              labelFormatter={(label) => `Mês: ${new Date(label).toLocaleDateString('pt-BR')}`}
            />
            {data.slice(0, 5).map((store, index) => (
              <Line
                key={store.store_id}
                type="monotone"
                dataKey="revenue"
                data={store.monthly_data}
                stroke={Object.values(GROWTH_COLORS)[index % 4]}
                strokeWidth={2}
                name={store.store_name}
                dot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Tabela Detalhada */}
      <div className="mt-6">
        <h4 className="text-md font-medium text-gray-700 mb-3">Detalhes das Lojas</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loja
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Padrão
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Crescimento Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Crescimento Mensal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Força da Tendência
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Receita Atual
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((store, index) => (
                <tr key={store.store_id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div>
                      <div className="font-medium">{store.store_name}</div>
                      <div className="text-xs text-gray-500">{store.city}, {store.state}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGrowthBadgeClass(store.growth_pattern)}`}>
                      {GROWTH_LABELS[store.growth_pattern]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className={`font-medium ${getGrowthRateClass(store.total_growth_rate)}`}>
                      {store.total_growth_rate > 0 ? '+' : ''}{store.total_growth_rate.toFixed(1)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className={`font-medium ${getGrowthRateClass(store.avg_monthly_growth)}`}>
                      {store.avg_monthly_growth > 0 ? '+' : ''}{store.avg_monthly_growth.toFixed(1)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={getProgressBarStyle(store.trend_strength)}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">
                        {(store.trend_strength * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    R$ {store.last_month_revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">💡 Insights de Crescimento</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <div>
            <strong>Loja com maior crescimento:</strong> {data[0]?.store_name} (+{data[0]?.total_growth_rate.toFixed(1)}%)
          </div>
          <div>
            <strong>Loja com maior declínio:</strong> {
              data.find(store => store.growth_pattern === 'declining')?.store_name || 'Nenhuma'
            } ({
              data.find(store => store.growth_pattern === 'declining')?.total_growth_rate.toFixed(1) || '0'
            }%)
          </div>
          <div>
            <strong>Crescimento médio das lojas:</strong> {
              (data.reduce((sum, store) => sum + store.total_growth_rate, 0) / data.length).toFixed(1)
            }%
          </div>
          <div>
            <strong>Lojas com crescimento consistente:</strong> {growingStores.length} de {data.length} lojas
          </div>
          <div>
            <strong>Força média da tendência:</strong> {
              (data.reduce((sum, store) => sum + store.trend_strength, 0) / data.length * 100).toFixed(0)
            }%
          </div>
        </div>
      </div>
    </div>
  )
}
