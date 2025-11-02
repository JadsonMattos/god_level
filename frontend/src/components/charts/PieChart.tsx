import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import type { ChannelData } from '../../types/api'

interface PieChartProps {
  data: ChannelData[]
  title?: string
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']

export function PieChart({ data, title = 'Distribuição por Canal' }: Readonly<PieChartProps>) {
  const chartData = data.map((item, index) => ({
    name: item.channel_name,
    value: item.total_revenue,
    type: item.channel_type === 'P' ? 'Presencial' : 'Delivery',
    uniqueKey: `${item.channel_name}-${index}`
  }))

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6 w-full">
      <h3 className="text-base sm:text-xl font-semibold mb-3 sm:mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <RechartsPieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={90}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={entry.uniqueKey} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          />
          <Legend />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  )
}

