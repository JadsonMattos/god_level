import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

interface ProductSeasonalityData {
  product_id: number
  product_name: string
  seasonality_score: number
  seasonality_pattern: 'highly_seasonal' | 'moderately_seasonal' | 'slightly_seasonal' | 'stable'
  peak_month: string
  low_month: string
  peak_quantity: number
  low_quantity: number
  peak_low_ratio: number
  avg_monthly_quantity: number
  avg_monthly_revenue: number
  trend_direction: 'growing' | 'declining' | 'stable'
  months_analyzed: number
  monthly_data: Array<{
    month: string
    quantity: number
    revenue: number
    sales: number
  }>
}

interface ProductSeasonalityChartProps {
  data: ProductSeasonalityData[]
  title?: string
}

const SEASONALITY_COLORS = {
  highly_seasonal: '#EF4444',
  moderately_seasonal: '#F59E0B',
  slightly_seasonal: '#10B981',
  stable: '#6B7280'
}

const SEASONALITY_LABELS = {
  highly_seasonal: 'Altamente Sazonal',
  moderately_seasonal: 'Moderadamente Sazonal',
  slightly_seasonal: 'Levemente Sazonal',
  stable: 'Estável'
}

const TREND_COLORS = {
  growing: '#10B981',
  declining: '#EF4444',
  stable: '#6B7280'
}

const TREND_LABELS = {
  growing: 'Crescendo',
  declining: 'Declinando',
  stable: 'Estável'
}

const getSeasonalityBadgeClass = (pattern: string) => {
  if (pattern === 'highly_seasonal') return 'bg-red-100 text-red-800'
  if (pattern === 'moderately_seasonal') return 'bg-yellow-100 text-yellow-800'
  if (pattern === 'slightly_seasonal') return 'bg-green-100 text-green-800'
  return 'bg-gray-100 text-gray-800'
}

const getTrendBadgeClass = (direction: string) => {
  if (direction === 'growing') return 'bg-green-100 text-green-800'
  if (direction === 'declining') return 'bg-red-100 text-red-800'
  return 'bg-gray-100 text-gray-800'
}

const getProgressBarStyle = (score: number) => ({
  width: `${Math.min(score * 100, 100)}%`
})

export function ProductSeasonalityChart({ data, title = "Análise de Sazonalidade de Produtos" }: Readonly<ProductSeasonalityChartProps>) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="text-center py-8 text-gray-500">
          <p>Nenhum dado de sazonalidade encontrado</p>
        </div>
      </div>
    )
  }

  const highlySeasonal = data.filter(product => product.seasonality_pattern === 'highly_seasonal')
  const moderatelySeasonal = data.filter(product => product.seasonality_pattern === 'moderately_seasonal')
  const slightlySeasonal = data.filter(product => product.seasonality_pattern === 'slightly_seasonal')
  const stable = data.filter(product => product.seasonality_pattern === 'stable')

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-red-600">
            {highlySeasonal.length}
          </div>
          <div className="text-sm text-red-800">Altamente Sazonais</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">
            {moderatelySeasonal.length}
          </div>
          <div className="text-sm text-yellow-800">Moderadamente Sazonais</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {slightlySeasonal.length}
          </div>
          <div className="text-sm text-green-800">Levemente Sazonais</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-gray-600">
            {stable.length}
          </div>
          <div className="text-sm text-gray-800">Estáveis</div>
        </div>
      </div>

      {/* Gráfico de Score de Sazonalidade */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 mb-3">Score de Sazonalidade por Produto</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.slice(0, 20)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="product_name" 
              angle={-45}
              textAnchor="end"
              height={80}
              fontSize={11}
            />
            <YAxis label={{ value: 'Score de Sazonalidade', angle: -90, position: 'insideLeft' }} />
            <Tooltip 
              formatter={(value, name) => [value, 'Score de Sazonalidade']}
              labelFormatter={(label) => `Produto: ${label}`}
            />
            <Bar 
              dataKey="seasonality_score" 
              fill="#3B82F6"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de Tendência Mensal - Top 5 Produtos Sazonais */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 mb-3">Tendência Mensal - Top 5 Produtos Sazonais</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { month: 'short' })}
            />
            <YAxis label={{ value: 'Quantidade', angle: -90, position: 'insideLeft' }} />
            <Tooltip 
              formatter={(value) => [value, 'Quantidade']}
              labelFormatter={(label) => `Mês: ${new Date(label).toLocaleDateString('pt-BR')}`}
            />
            {data.slice(0, 5).map((product, index) => (
              <Line
                key={product.product_id}
                type="monotone"
                dataKey="quantity"
                data={product.monthly_data}
                stroke={Object.values(SEASONALITY_COLORS)[index % 4]}
                strokeWidth={2}
                name={product.product_name}
                dot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Tabela Detalhada */}
      <div className="mt-6">
        <h4 className="text-md font-medium text-gray-700 mb-3">Detalhes dos Produtos</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Padrão
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pico/Baixa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Razão Pico/Baixa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tendência
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantidade Média
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((product, index) => (
                <tr key={product.product_id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.product_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeasonalityBadgeClass(product.seasonality_pattern)}`}>
                      {SEASONALITY_LABELS[product.seasonality_pattern]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={getProgressBarStyle(product.seasonality_score)}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">
                        {product.seasonality_score.toFixed(2)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      <div className="text-xs text-gray-500">Pico: {new Date(product.peak_month).toLocaleDateString('pt-BR', { month: 'short' })}</div>
                      <div className="text-xs text-gray-500">Baixa: {new Date(product.low_month).toLocaleDateString('pt-BR', { month: 'short' })}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="font-medium">
                      {product.peak_low_ratio.toFixed(1)}x
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTrendBadgeClass(product.trend_direction)}`}>
                      {TREND_LABELS[product.trend_direction]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.avg_monthly_quantity.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">💡 Insights de Sazonalidade</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <div>
            <strong>Produto mais sazonal:</strong> {data[0]?.product_name} (score: {data[0]?.seasonality_score.toFixed(2)})
          </div>
          <div>
            <strong>Produto mais estável:</strong> {
              data.find(product => product.seasonality_pattern === 'stable')?.product_name || 'Nenhum'
            } (score: {
              data.find(product => product.seasonality_pattern === 'stable')?.seasonality_score.toFixed(2) || '0'
            })
          </div>
          <div>
            <strong>Score médio de sazonalidade:</strong> {
              (data.reduce((sum, product) => sum + product.seasonality_score, 0) / data.length).toFixed(2)
            }
          </div>
          <div>
            <strong>Produtos altamente sazonais:</strong> {highlySeasonal.length} de {data.length} produtos
          </div>
          <div>
            <strong>Razão média pico/baixa:</strong> {
              (data.reduce((sum, product) => sum + product.peak_low_ratio, 0) / data.length).toFixed(1)
            }x
          </div>
        </div>
      </div>
    </div>
  )
}
