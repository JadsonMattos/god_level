import { Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts'
import type { PromotionsData } from '../../types/api'

interface PromotionsChartProps {
  data: PromotionsData
  title?: string
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export function PromotionsChart({ data, title = 'Análise de Promoções e Descontos' }: Readonly<PromotionsChartProps>) {
  const chartData = [
    {
      name: 'Vendas com Desconto',
      value: data.sales_with_discount,
      percentage: data.discount_percentage,
      total_discount: data.total_discounts,
      uniqueKey: 'discount'
    },
    {
      name: 'Vendas com Aumento',
      value: data.sales_with_increase,
      percentage: data.increase_percentage,
      total_increase: data.total_increases,
      uniqueKey: 'increase'
    },
    {
      name: 'Vendas Sem Alteração',
      value: data.total_sales - data.sales_with_discount - data.sales_with_increase,
      percentage: 100 - data.discount_percentage - data.increase_percentage,
      total_normal: data.total_sales - data.sales_with_discount - data.sales_with_increase,
      uniqueKey: 'normal'
    }
  ]

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800">Total de Descontos</h4>
          <p className="text-2xl font-bold text-blue-900">
            R$ {data.total_discounts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-blue-600">
            {data.discount_percentage}% das vendas
          </p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-green-800">Total de Aumentos</h4>
          <p className="text-2xl font-bold text-green-900">
            R$ {data.total_increases.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-green-600">
            {data.increase_percentage}% das vendas
          </p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-800">Desconto Médio</h4>
          <p className="text-2xl font-bold text-gray-900">
            R$ {data.avg_discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-gray-600">
            Por venda com desconto
          </p>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-3">Distribuição de Vendas</h4>
        <ResponsiveContainer width="100%" height={300}>
          <RechartsPieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={entry.uniqueKey} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number, name: string) => [
                `${value.toLocaleString('pt-BR')} vendas`,
                name
              ]}
            />
            <Legend />
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>

      {/* Discount Reasons */}
      {data.discount_reasons.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold mb-3">Principais Motivos de Desconto</h4>
          <div className="space-y-2">
            {data.discount_reasons.slice(0, 5).map((reason) => (
              <div key={reason.reason} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">{reason.reason}</span>
                <div className="text-right">
                  <div className="font-semibold">{reason.count} vendas</div>
                  <div className="text-sm text-gray-600">
                    R$ {reason.total_discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
