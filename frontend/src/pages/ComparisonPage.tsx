import { useState } from 'react'
import { useRevenue } from '../hooks/useAnalytics'
import { RevenueChart } from '../components/charts/RevenueChart'
import { StatsCard } from '../components/charts/StatsCard'
import type { AnalyticsFilters } from '../types/api'

interface ComparisonState {
  period1: AnalyticsFilters
  period2: AnalyticsFilters
}

export function ComparisonPage() {
  // Default: last month vs this month
  const now = new Date()
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
  
  // Estados ativos (aplicados nos gráficos)
  const [activeComparison, setActiveComparison] = useState<ComparisonState>({
    period1: {
      start_date: lastMonth.toISOString().split('T')[0],
      end_date: lastMonthEnd.toISOString().split('T')[0],
    },
    period2: {
      start_date: thisMonth.toISOString().split('T')[0],
      end_date: now.toISOString().split('T')[0],
    }
  })

  // Estados locais (em edição, não aplicados ainda)
  const [localComparison, setLocalComparison] = useState<ComparisonState>(activeComparison)

  const { data: revenue1, loading: loading1 } = useRevenue(activeComparison.period1)
  const { data: revenue2, loading: loading2 } = useRevenue(activeComparison.period2)

  const totalRevenue1 = revenue1.reduce((sum, r) => sum + r.revenue, 0)
  const totalRevenue2 = revenue2.reduce((sum, r) => sum + r.revenue, 0)
  const variance = totalRevenue2 - totalRevenue1
  const variancePercent = totalRevenue1 > 0 ? ((totalRevenue2 / totalRevenue1) - 1) * 100 : 0

  if (loading1 || loading2) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando comparação...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">📊 Comparação de Períodos</h1>

      {/* Period Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
        {/* Period 1 */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-4">Período 1</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="period1-start" className="block text-sm font-medium text-gray-700 mb-1">Data Inicial</label>
              <input
                id="period1-start"
                type="date"
                value={localComparison.period1.start_date || ''}
                onChange={(e) => setLocalComparison({
                  ...localComparison,
                  period1: { ...localComparison.period1, start_date: e.target.value || undefined }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="period1-end" className="block text-sm font-medium text-gray-700 mb-1">Data Final</label>
              <input
                id="period1-end"
                type="date"
                value={localComparison.period1.end_date || ''}
                onChange={(e) => setLocalComparison({
                  ...localComparison,
                  period1: { ...localComparison.period1, end_date: e.target.value || undefined }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Period 2 */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-4">Período 2</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="period2-start" className="block text-sm font-medium text-gray-700 mb-1">Data Inicial</label>
              <input
                id="period2-start"
                type="date"
                value={localComparison.period2.start_date || ''}
                onChange={(e) => setLocalComparison({
                  ...localComparison,
                  period2: { ...localComparison.period2, start_date: e.target.value || undefined }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="period2-end" className="block text-sm font-medium text-gray-700 mb-1">Data Final</label>
              <input
                id="period2-end"
                type="date"
                value={localComparison.period2.end_date || ''}
                onChange={(e) => setLocalComparison({
                  ...localComparison,
                  period2: { ...localComparison.period2, end_date: e.target.value || undefined }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Apply and Clear Buttons */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
        <button
          onClick={() => setActiveComparison(localComparison)}
          className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 shadow-md text-sm sm:text-base"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Aplicar Comparação
        </button>
        <button
          onClick={() => {
            const now = new Date()
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
            const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
            const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
            const cleared = {
              period1: {
                start_date: lastMonth.toISOString().split('T')[0],
                end_date: lastMonthEnd.toISOString().split('T')[0],
              },
              period2: {
                start_date: thisMonth.toISOString().split('T')[0],
                end_date: now.toISOString().split('T')[0],
              }
            }
            setLocalComparison(cleared)
            setActiveComparison(cleared)
          }}
          className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Limpar Filtros
        </button>
      </div>

      {/* Comparison Results */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <StatsCard
          title="Período 1 - Faturamento"
          value={totalRevenue1}
          color="blue"
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        
        <StatsCard
          title="Período 2 - Faturamento"
          value={totalRevenue2}
          color="green"
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <div className={`rounded-lg shadow p-6 ${
          variance >= 0 ? 'bg-green-50' : 'bg-red-50'
        }`}>
          <p className="text-sm text-gray-600 mb-1">Variação</p>
          <p className={`text-3xl font-bold ${
            variance >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {variance >= 0 ? '+' : ''}{variancePercent.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {variance >= 0 ? 'Aumento' : 'Redução'}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Período 1</h3>
            <RevenueChart 
              data={revenue1}
              title={`Faturamento ${activeComparison.period1.start_date} a ${activeComparison.period1.end_date}`}
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Período 2</h3>
            <RevenueChart 
              data={revenue2}
              title={`Faturamento ${activeComparison.period2.start_date} a ${activeComparison.period2.end_date}`}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

