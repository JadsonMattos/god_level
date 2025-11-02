import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { ProductData } from '../../types/api'

interface TopProductsChartProps {
  data: ProductData[]
  title?: string
}

export function TopProductsChart({ data, title = 'Top Produtos mais Vendidos' }: Readonly<TopProductsChartProps>) {
  // Truncar nomes de produtos muito longos
  const chartData = data.map(item => ({
    ...item,
    short_name: item.product_name.length > 25 
      ? item.product_name.substring(0, 25) + '...' 
      : item.product_name
  }))

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6 w-full">
      <h3 className="text-base sm:text-xl font-semibold mb-3 sm:mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" tick={{ fontSize: 12 }} />
          <YAxis 
            type="category" 
            dataKey="short_name" 
            tick={{ fontSize: 10 }}
            width={120}
          />
          <Tooltip 
            formatter={(value: number) => value.toLocaleString('pt-BR')}
            contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <Legend />
          <Bar 
            dataKey="total_quantity" 
            fill="#3b82f6" 
            name="Quantidade Vendida"
            radius={[0, 4, 4, 0]}
          />
          <Bar 
            dataKey="total_revenue" 
            fill="#10b981" 
            name="Receita (R$)"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

