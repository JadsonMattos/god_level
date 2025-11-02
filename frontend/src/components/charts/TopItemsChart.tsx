import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface ItemData {
  item_name: string
  times_added: number
  revenue_generated: number
  avg_price: number
  unique_products: number
}

interface TopItemsChartProps {
  data: ItemData[]
  title?: string
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C']

export function TopItemsChart({ data, title = "Itens Mais Vendidos" }: Readonly<TopItemsChartProps>) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="text-center py-8 text-gray-500">
          <p>Nenhum dado de itens encontrado</p>
        </div>
      </div>
    )
  }

  const topItems = data.slice(0, 10).map((item, index) => ({
    ...item,
    uniqueKey: `${item.item_name}-${index}`
  }))
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue_generated, 0)
  
  // Find item with highest revenue
  const highestRevenueItem = data.reduce((max, item) => 
    item.revenue_generated > max.revenue_generated ? item : max, data[0]
  )

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6 w-full">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-4">{title}</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Gráfico de Barras - Quantidade */}
        <div>
          <h4 className="text-sm sm:text-md font-medium text-gray-700 mb-3 sm:mb-3">Por Quantidade Vendida</h4>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topItems}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="item_name" 
                angle={-45}
                textAnchor="end"
                height={70}
                fontSize={11}
                interval="preserveStartEnd"
              />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'times_added' ? `${value} vezes` : `R$ ${Number(value).toFixed(2)}`,
                  name === 'times_added' ? 'Quantidade' : 'Receita'
                ]}
                labelFormatter={(label) => `Item: ${label}`}
              />
              <Bar dataKey="times_added" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Pizza - Receita */}
        <div>
          <h4 className="text-sm sm:text-md font-medium text-gray-700 mb-3 sm:mb-3">Por Receita Gerada</h4>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={topItems}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ item_name, revenue_generated, percent }) => 
                  `${item_name}: R$ ${revenue_generated.toFixed(2)} (${(percent * 100).toFixed(1)}%)`
                }
                outerRadius={70}
                fill="#8884d8"
                dataKey="revenue_generated"
              >
                {topItems.map((entry, index) => (
                  <Cell key={entry.uniqueKey} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Receita']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabela Detalhada */}
      <div className="mt-4 sm:mt-6">
        <h4 className="text-sm sm:text-md font-medium text-gray-700 mb-3 sm:mb-3">Detalhes dos Itens</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 sm:py-3 text-left text-xs sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantidade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Receita Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preço Médio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produtos Únicos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  % Receita
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((item, index) => (
                <tr key={item.item_name} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm sm:text-sm font-medium text-gray-900">
                    {item.item_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.times_added.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    R$ {item.revenue_generated.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    R$ {item.avg_price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.unique_products}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {((item.revenue_generated / totalRevenue) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-4 sm:mt-6 p-4 sm:p-4 bg-gray-50 rounded-lg">
        <h4 className="text-base sm:text-base font-semibold text-gray-800 mb-3">💡 Insights dos Itens</h4>
        <div className="text-sm sm:text-sm text-gray-600 space-y-2">
          <div>
            <strong>Item mais vendido:</strong> {data[0]?.item_name} ({data[0]?.times_added} vezes)
          </div>
          <div>
            <strong>Maior receita:</strong> {highestRevenueItem.item_name} (R$ {highestRevenueItem.revenue_generated.toFixed(2)})
          </div>
          <div>
            <strong>Receita total gerada:</strong> R$ {totalRevenue.toFixed(2)}
          </div>
          <div>
            <strong>Média de produtos únicos por item:</strong> {
              (data.reduce((sum, item) => sum + item.unique_products, 0) / data.length).toFixed(1)
            }
          </div>
        </div>
      </div>
    </div>
  )
}
