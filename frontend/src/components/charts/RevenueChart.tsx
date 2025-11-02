import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { RevenueData } from '../../types/api'

interface RevenueChartProps {
  data: RevenueData[]
  title?: string
}

export function RevenueChart({ data, title = 'Faturamento ao Longo do Tempo' }: Readonly<RevenueChartProps>) {
  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6 w-full">
      <h3 className="text-base sm:text-xl font-semibold mb-3 sm:mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="period" 
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
          <Line 
            type="monotone" 
            dataKey="revenue" 
            stroke="#3b82f6" 
            strokeWidth={2}
            name="Faturamento"
          />
          <Line 
            type="monotone" 
            dataKey="avg_ticket" 
            stroke="#10b981" 
            strokeWidth={2}
            name="Ticket Médio"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

