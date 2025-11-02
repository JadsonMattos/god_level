import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface MarginData {
  product_id: number
  product_name: string
  avg_price: number
  avg_cost: number
  margin: number
  margin_percentage: number
  total_quantity: number
  total_revenue: number
}

interface ProductsMarginChartProps {
  data: MarginData[]
  title?: string
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) {
    return null
  }
  
  const data = payload[0].payload
  return (
    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
      <p className="font-semibold text-gray-800">{data.fullName}</p>
      <p className="text-sm text-gray-600">
        Margem: <span className="font-medium">R$ {data.margin.toFixed(2)}</span>
      </p>
      <p className="text-sm text-gray-600">
        Margem %: <span className="font-medium">{data.marginPercentage.toFixed(1)}%</span>
      </p>
      <p className="text-sm text-gray-600">
        Preço Médio: <span className="font-medium">R$ {data.avgPrice.toFixed(2)}</span>
      </p>
      <p className="text-sm text-gray-600">
        Custo Médio: <span className="font-medium">R$ {data.avgCost.toFixed(2)}</span>
      </p>
      <p className="text-sm text-gray-600">
        Quantidade: <span className="font-medium">{data.quantity.toFixed(0)}</span>
      </p>
    </div>
  )
}

export function ProductsMarginChart({ data, title = "Produtos com Menor Margem" }: Readonly<ProductsMarginChartProps>) {
  // Format data for chart
  const chartData = data.map(item => ({
    name: item.product_name.length > 20 
      ? item.product_name.substring(0, 20) + '...' 
      : item.product_name,
    fullName: item.product_name,
    margin: item.margin,
    marginPercentage: item.margin_percentage,
    avgPrice: item.avg_price,
    avgCost: item.avg_cost,
    quantity: item.total_quantity,
    revenue: item.total_revenue
  }))

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6 w-full">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-4">{title}</h3>
      
      {data.length === 0 ? (
        <div className="text-center py-6 sm:py-8 text-gray-500 text-sm">
          <p>Nenhum produto encontrado com dados de margem</p>
        </div>
      ) : (
        <div className="h-72 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={10}
                interval="preserveStartEnd"
              />
              <YAxis 
                label={{ value: 'Margem (R$)', angle: -90, position: 'insideLeft', fontSize: 10 }}
                fontSize={10}
                width={50}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="margin" 
                fill="#ef4444" 
                radius={[4, 4, 0, 0]}
                name="Margem"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      
      <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600">
        <p>💡 <strong>Insight:</strong> Produtos com margem baixa podem precisar de ajuste de preço ou redução de custos.</p>
      </div>
    </div>
  )
}
