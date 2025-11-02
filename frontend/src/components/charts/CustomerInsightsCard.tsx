import React from 'react'

interface CustomerInsights {
  total_customers: number
  frequent_customers: number
  inactive_customers: number
  avg_purchases_per_customer: number
  frequent_customer_percentage: number
  inactive_customer_percentage: number
}

interface CustomerInsightsCardProps {
  data: CustomerInsights
  title?: string
}

export function CustomerInsightsCard({ data, title = "Insights de Clientes" }: Readonly<CustomerInsightsCardProps>) {
  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6 w-full">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">{title}</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Total Customers */}
        <div className="bg-blue-50 p-4 sm:p-5 rounded-lg">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-blue-100 rounded-lg flex-shrink-0">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-sm sm:text-base font-medium text-blue-600">Total de Clientes</p>
              <p className="text-2xl sm:text-3xl font-bold text-blue-900 mt-1">{data.total_customers.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Frequent Customers */}
        <div className="bg-green-50 p-4 sm:p-5 rounded-lg">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-green-100 rounded-lg flex-shrink-0">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-sm sm:text-base font-medium text-green-600">Clientes Frequentes (3+ compras)</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-900 mt-1">{data.frequent_customers.toLocaleString()}</p>
              <p className="text-xs sm:text-sm text-green-700 mt-1">{data.frequent_customer_percentage}% do total</p>
            </div>
          </div>
        </div>

        {/* Inactive Customers */}
        <div className="bg-red-50 p-4 sm:p-5 rounded-lg">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-red-100 rounded-lg flex-shrink-0">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-sm sm:text-base font-medium text-red-600">Clientes Inativos (30+ dias)</p>
              <p className="text-2xl sm:text-3xl font-bold text-red-900 mt-1">{data.inactive_customers.toLocaleString()}</p>
              <p className="text-xs sm:text-sm text-red-700 mt-1">{data.inactive_customer_percentage}% do total</p>
            </div>
          </div>
        </div>

        {/* Average Purchases */}
        <div className="bg-purple-50 p-4 sm:p-5 rounded-lg">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-purple-100 rounded-lg flex-shrink-0">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-sm sm:text-base font-medium text-purple-600">Compras por Cliente</p>
              <p className="text-2xl sm:text-3xl font-bold text-purple-900 mt-1">{data.avg_purchases_per_customer}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-4 sm:mt-6 p-4 sm:p-4 bg-gray-50 rounded-lg">
        <h4 className="text-base sm:text-base font-semibold text-gray-800 mb-3">💡 Insights Acionáveis</h4>
        <ul className="text-sm sm:text-sm text-gray-600 space-y-2">
          <li>• <strong>{data.frequent_customer_percentage}%</strong> dos clientes são frequentes - mantenha-os engajados</li>
          <li>• <strong>{data.inactive_customer_percentage}%</strong> estão inativos há 30+ dias - considere campanhas de reativação</li>
          <li>• Clientes fazem em média <strong>{data.avg_purchases_per_customer}</strong> compras</li>
          {data.inactive_customer_percentage > 30 && (
            <li className="text-red-600">⚠️ <strong>Alerta:</strong> Taxa de inatividade alta - ação necessária!</li>
          )}
        </ul>
      </div>
    </div>
  )
}
