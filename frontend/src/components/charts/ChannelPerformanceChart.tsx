import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import type { ChannelData } from '../../types/api'

interface ChannelPerformanceChartProps {
  data: ChannelData[]
  title?: string
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export function ChannelPerformanceChart({ data, title = 'Performance por Canal' }: Readonly<ChannelPerformanceChartProps>) {
  const chartData = data.map((item, index) => ({
    ...item,
    display_name: item.channel_name,
    uniqueKey: `${item.channel_name}-${index}`
  }))

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6 w-full">
      <h3 className="text-base sm:text-xl font-semibold mb-3 sm:mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="display_name" 
            tick={{ fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            height={70}
            interval="preserveStartEnd"
          />
          <YAxis 
            tick={{ fontSize: 11 }}
            width={55}
            tickFormatter={(value) => `R$${value.toLocaleString('pt-BR')}`}
          />
          <Tooltip 
            formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <Legend />
          <Bar dataKey="total_revenue" name="Receita Total">
            {chartData.map((entry, index) => (
              <Cell key={entry.uniqueKey} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

