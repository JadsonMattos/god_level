import { useState } from 'react'
import { usePromotionsAnalysis, useInventoryTurnover } from '../hooks/useNewAnalytics'
import { PromotionsChart } from '../components/charts/PromotionsChart'
import { InventoryChart } from '../components/charts/InventoryChart'
import { AdvancedFilters } from '../components/filters/AdvancedFilters'
import type { AnalyticsFilters } from '../types/api'

export function AdvancedAnalyticsPage() {
  const [filters, setFilters] = useState<AnalyticsFilters>({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  })
  
  const { data: promotionsData, loading: promotionsLoading, error: promotionsError } = usePromotionsAnalysis(filters)
  const { data: inventoryData, loading: inventoryLoading, error: inventoryError } = useInventoryTurnover(filters, 20)

  const loading = promotionsLoading || inventoryLoading

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando análises avançadas...</p>
        </div>
      </div>
    )
  }

  if (promotionsError || inventoryError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold">Erro ao carregar dados</h3>
          <p className="text-red-600">{promotionsError || inventoryError}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Análises Avançadas</h1>
        </div>
        
        {/* Advanced Filters */}
        <AdvancedFilters
          filters={filters}
          onChange={setFilters}
          onApply={() => {}}
          onClear={() => setFilters({
            start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            end_date: new Date().toISOString().split('T')[0],
          })}
        />
      </div>

      {/* Promotions Analysis */}
      {promotionsData && (
        <div className="mb-8">
          <PromotionsChart data={promotionsData} />
        </div>
      )}

      {/* Inventory Analysis */}
      {inventoryData && inventoryData.length > 0 && (
        <div className="mb-8">
          <InventoryChart data={inventoryData} />
        </div>
      )}

      {/* Insights Section */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-blue-900 mb-4">💡 Insights Acionáveis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">📊 Promoções</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• {promotionsData?.discount_percentage.toFixed(1)}% das vendas têm desconto</li>
              <li>• Desconto médio de R$ {promotionsData?.avg_discount.toFixed(2)} por venda</li>
              <li>• Total de R$ {promotionsData?.total_discounts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em descontos</li>
              <li>• Principais motivos: {promotionsData?.discount_reasons.slice(0, 3).map(r => r.reason).join(', ')}</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">📦 Estoque</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Produto mais vendido: {inventoryData?.[0]?.product_name}</li>
              <li>• Velocidade média: {(inventoryData?.reduce((acc, item) => acc + item.daily_velocity, 0) / inventoryData?.length || 0).toFixed(1)} unidades/dia</li>
              <li>• Total vendido: {inventoryData?.reduce((acc, item) => acc + item.total_quantity_sold, 0).toLocaleString('pt-BR')} unidades</li>
              <li>• Receita total: R$ {inventoryData?.reduce((acc, item) => acc + item.total_revenue, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}