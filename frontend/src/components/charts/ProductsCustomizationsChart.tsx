import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ProductCustomizationData {
  product_name: string
  total_customizations: number
  sales_with_customizations: number
  total_sales: number
  customization_rate: number
}

interface ProductsCustomizationsChartProps {
  data: ProductCustomizationData[]
  title?: string
}

const getProgressBarStyle = (percentage: number) => ({
  width: `${Math.min(percentage, 100)}%`
})

export function ProductsCustomizationsChart({ data, title = "Produtos com Mais Customizações" }: Readonly<ProductsCustomizationsChartProps>) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="text-center py-8 text-gray-500">
          <p>Nenhum dado de customizações encontrado</p>
        </div>
      </div>
    )
  }

  const topProducts = data.slice(0, 15)

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6 w-full">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-4">{title}</h3>
      
      {/* Gráfico de Taxa de Customização */}
      <div className="mb-4 sm:mb-6">
        <h4 className="text-sm sm:text-md font-medium text-gray-700 mb-3 sm:mb-3">Taxa de Customização por Produto</h4>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={topProducts} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 100]} />
            <YAxis 
              dataKey="product_name" 
              type="category" 
              width={140}
              fontSize={10}
            />
            <Tooltip 
              formatter={(value, name) => [
                `${value}%`,
                name === 'customization_rate' ? 'Taxa de Customização' : 'Vendas'
              ]}
              labelFormatter={(label) => `Produto: ${label}`}
            />
            <Bar dataKey="customization_rate" fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
          <div className="text-lg sm:text-2xl font-bold text-blue-600">
            {data.reduce((sum, item) => sum + item.total_customizations, 0).toLocaleString()}
          </div>
          <div className="text-sm text-blue-800">Total de Customizações</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {(data.reduce((sum, item) => sum + item.sales_with_customizations, 0) / 
              data.reduce((sum, item) => sum + item.total_sales, 0) * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-green-800">Taxa Média de Customização</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {data.length}
          </div>
          <div className="text-sm text-purple-800">Produtos Analisados</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">
            {data.reduce((sum, item) => sum + item.total_sales, 0).toLocaleString()}
          </div>
          <div className="text-sm text-orange-800">Total de Vendas</div>
        </div>
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
                  Taxa de Customização
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendas com Customização
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total de Vendas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total de Customizações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((product, index) => (
                <tr key={product.product_name} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.product_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={getProgressBarStyle(product.customization_rate)}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">
                        {product.customization_rate.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.sales_with_customizations.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.total_sales.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.total_customizations.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">💡 Insights de Customização</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <div>
            <strong>Produto mais customizado:</strong> {data[0]?.product_name} ({data[0]?.customization_rate.toFixed(1)}%)
          </div>
          <div>
            <strong>Produto menos customizado:</strong> {data[data.length - 1]?.product_name} ({data[data.length - 1]?.customization_rate.toFixed(1)}%)
          </div>
          <div>
            <strong>Taxa média de customização:</strong> {
              (data.reduce((sum, item) => sum + item.customization_rate, 0) / data.length).toFixed(1)
            }%
          </div>
          <div>
            <strong>Produtos com alta customização (&gt;50%):</strong> {
              data.filter(item => item.customization_rate > 50).length
            } produtos
          </div>
        </div>
      </div>
    </div>
  )
}
