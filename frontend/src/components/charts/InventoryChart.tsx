import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { InventoryData } from '../../types/api'

interface InventoryChartProps {
  data: InventoryData[]
  title?: string
}

export function InventoryChart({ data, title = 'Análise de Giro de Estoque' }: Readonly<InventoryChartProps>) {
  const chartData = data.map((item, index) => ({
    name: item.product_name.length > 20 ? item.product_name.substring(0, 20) + '...' : item.product_name,
    fullName: item.product_name,
    daily_velocity: item.daily_velocity,
    turnover_score: item.turnover_score,
    total_quantity_sold: item.total_quantity_sold,
    avg_price: item.avg_price,
    total_revenue: item.total_revenue,
    uniqueKey: `${item.product_name}-${index}`
  }))

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800">Produto Mais Vendido</h4>
          <p className="text-lg font-bold text-blue-900">
            {data[0]?.product_name.substring(0, 30)}...
          </p>
          <p className="text-sm text-blue-600">
            {data[0]?.daily_velocity.toFixed(1)} unidades/dia
          </p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-green-800">Velocidade Média</h4>
          <p className="text-2xl font-bold text-green-900">
            {data.reduce((acc, item) => acc + item.daily_velocity, 0) / data.length || 0}
          </p>
          <p className="text-sm text-green-600">
            unidades/dia
          </p>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-yellow-800">Total Vendido</h4>
          <p className="text-2xl font-bold text-yellow-900">
            {data.reduce((acc, item) => acc + item.total_quantity_sold, 0).toLocaleString('pt-BR')}
          </p>
          <p className="text-sm text-yellow-600">
            unidades no período
          </p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-purple-800">Receita Total</h4>
          <p className="text-2xl font-bold text-purple-900">
            R$ {data.reduce((acc, item) => acc + item.total_revenue, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-purple-600">
            dos produtos analisados
          </p>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-3">Velocidade de Venda por Produto</h4>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              label={{ value: 'Unidades/Dia', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={(value: number, name: string) => [
                `${value.toFixed(1)} unidades/dia`,
                name === 'daily_velocity' ? 'Velocidade' : 'Score'
              ]}
              labelFormatter={(label, payload) => {
                const data = payload?.[0]?.payload
                return data ? data.fullName : label
              }}
              contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <Legend />
            <Bar 
              dataKey="daily_velocity" 
              fill="#3b82f6" 
              name="Velocidade (unidades/dia)"
            />
            <Bar 
              dataKey="turnover_score" 
              fill="#10b981" 
              name="Score de Giro"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Products Table */}
      <div>
        <h4 className="text-lg font-semibold mb-3">Top 10 Produtos por Giro</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Velocidade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Vendido
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preço Médio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Receita
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.slice(0, 10).map((item, index) => (
                <tr key={`${item.product_name}-${item.total_quantity_sold}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.product_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {item.daily_velocity.toFixed(1)}/dia
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.total_quantity_sold.toLocaleString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    R$ {item.avg_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    R$ {item.total_revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
