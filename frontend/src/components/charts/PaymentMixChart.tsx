import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface PaymentMixData {
  channel_name: string
  payment_type: string
  payment_count: number
  total_value: number
  percentage: number
}

interface PaymentMixChartProps {
  data: PaymentMixData[]
  title?: string
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C']

const getProgressBarStyle = (percentage: number) => ({
  width: `${Math.min(percentage, 100)}%`
})

export function PaymentMixChart({ data, title = "Mix de Pagamentos por Canal" }: Readonly<PaymentMixChartProps>) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-3 sm:p-6 w-full">
        <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">{title}</h3>
        <div className="text-center py-6 sm:py-8 text-gray-500 text-sm">
          <p>Nenhum dado de pagamentos encontrado</p>
        </div>
      </div>
    )
  }

  // Agrupar dados por canal
  const channels = [...new Set(data.map(item => item.channel_name))]
  const totalPayments = data.reduce((sum, item) => sum + item.payment_count, 0)
  const totalValue = data.reduce((sum, item) => sum + item.total_value, 0)

  return (
    <div className="bg-white rounded-lg shadow p-3 sm:p-6 w-full">
      <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">{title}</h3>
      
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-blue-50 p-4 sm:p-4 rounded-lg">
          <div className="text-xl sm:text-2xl font-bold text-blue-600">
            {totalPayments.toLocaleString()}
          </div>
          <div className="text-sm sm:text-sm text-blue-800 mt-1">Total de Pagamentos</div>
        </div>
        <div className="bg-green-50 p-4 sm:p-4 rounded-lg">
          <div className="text-xl sm:text-2xl font-bold text-green-600">
            R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-sm sm:text-sm text-green-800 mt-1">Valor Total</div>
        </div>
        <div className="bg-purple-50 p-4 sm:p-4 rounded-lg">
          <div className="text-xl sm:text-2xl font-bold text-purple-600">
            {channels.length}
          </div>
          <div className="text-sm sm:text-sm text-purple-800 mt-1">Canais Analisados</div>
        </div>
      </div>

      {/* Gráficos por Canal */}
      {channels.map((channel, index) => {
        const channelData = data.filter(item => item.channel_name === channel)
        
        return (
          <div key={channel} className="mb-6 sm:mb-8">
            <h4 className="text-base sm:text-lg font-medium text-gray-700 mb-4 sm:mb-4">{channel}</h4>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Gráfico de Barras - Quantidade */}
              <div>
                <h5 className="text-sm sm:text-md font-medium text-gray-600 mb-3 sm:mb-3">Por Quantidade</h5>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={channelData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="payment_type" 
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      fontSize={11}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        `${value} pagamentos`,
                        'Quantidade'
                      ]}
                      labelFormatter={(label) => `Tipo: ${label}`}
                    />
                    <Bar dataKey="payment_count" fill={COLORS[index % COLORS.length]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfico de Pizza - Valor */}
              <div>
                <h5 className="text-md font-medium text-gray-600 mb-3">Por Valor</h5>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={channelData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ payment_type, total_value, percentage }) => 
                        `${payment_type}: R$ ${total_value.toFixed(2)} (${percentage.toFixed(1)}%)`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="total_value"
                    >
                      {channelData.map((entry, entryIndex) => (
                        <Cell key={`${channel}-${entry.payment_type}`} fill={COLORS[entryIndex % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Valor']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tabela do Canal */}
            <div className="mt-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo de Pagamento
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantidade
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor Total
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Percentual
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {channelData.map((payment, paymentIndex) => (
                      <tr key={payment.payment_type} className={paymentIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                          {payment.payment_type}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {payment.payment_count.toLocaleString()}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          R$ {payment.total_value.toFixed(2)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full" 
                                style={getProgressBarStyle(payment.percentage)}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">
                              {payment.percentage.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      })}

      {/* Insights Gerais */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">💡 Insights do Mix de Pagamentos</h4>
        <div className="text-sm text-gray-600 space-y-1">
          {channels.map(channel => {
            const channelData = data.filter(item => item.channel_name === channel)
            const topPayment = channelData.reduce((max, item) => 
              item.payment_count > max.payment_count ? item : max, channelData[0]
            )
            
            return (
              <div key={channel}>
                <strong>{channel}:</strong> {topPayment.payment_type} é o mais usado ({topPayment.percentage.toFixed(1)}%)
              </div>
            )
          })}
          <div>
            <strong>Valor médio por pagamento:</strong> R$ {(totalValue / totalPayments).toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  )
}
