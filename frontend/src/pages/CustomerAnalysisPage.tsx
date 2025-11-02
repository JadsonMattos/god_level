import React, { useState, useEffect } from 'react'
import { CustomerInsightsCard } from '../components/charts/CustomerInsightsCard'
import { apiClient } from '../services/axios'
import { storesApi } from '../services/api'
import type { Store } from '../types/api'

interface CustomerInsights {
  total_customers: number
  frequent_customers: number
  inactive_customers: number
  avg_purchases_per_customer: number
  frequent_customer_percentage: number
  inactive_customer_percentage: number
}

interface Filters {
  startDate: string
  endDate: string
  storeId: number | null
}

export function CustomerAnalysisPage() {
  const [insights, setInsights] = useState<CustomerInsights | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Stores for dropdown
  const [stores, setStores] = useState<Store[]>([])
  const [loadingStores, setLoadingStores] = useState(true)
  
  // Filtros ativos (aplicados à query)
  const [activeFilters, setActiveFilters] = useState<Filters>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    storeId: null
  })
  
  // Filtros locais (em edição, ainda não aplicados)
  const [localFilters, setLocalFilters] = useState<Filters>(activeFilters)

  // Load stores on mount
  useEffect(() => {
    const loadStores = async () => {
      try {
        setLoadingStores(true)
        const { data } = await storesApi.getStores()
        setStores(data)
      } catch (err) {
        console.error('Error loading stores:', err)
      } finally {
        setLoadingStores(false)
      }
    }
    loadStores()
  }, [])

  // Fetch data when activeFilters change
  useEffect(() => {
    fetchCustomerInsights()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilters])

  const fetchCustomerInsights = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (activeFilters.startDate) params.append('start_date', activeFilters.startDate)
      if (activeFilters.endDate) params.append('end_date', activeFilters.endDate)
      if (activeFilters.storeId) params.append('store_id', activeFilters.storeId.toString())
      
      const { data } = await apiClient.get<CustomerInsights>(
        `/api/v1/analytics/customer-insights?${params.toString()}`
      )
      
      setInsights(data)
    } catch (err) {
      console.error('Error fetching customer insights:', err)
      setError('Erro ao carregar insights de clientes')
    } finally {
      setLoading(false)
    }
  }

  const handleApplyFilters = () => {
    setActiveFilters(localFilters)
  }

  const handleClearFilters = () => {
    const cleared = {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      storeId: null
    }
    setLocalFilters(cleared)
    setActiveFilters(cleared)
  }

  const handleExport = () => {
    if (!insights) return
    
    const csvData = [
      ['Métrica', 'Valor'],
      ['Total de Clientes', insights.total_customers],
      ['Clientes Frequentes (3+ compras)', insights.frequent_customers],
      ['Clientes Inativos (30+ dias)', insights.inactive_customers],
      ['Compras por Cliente (média)', insights.avg_purchases_per_customer],
      ['% Clientes Frequentes', `${insights.frequent_customer_percentage}%`],
      ['% Clientes Inativos', `${insights.inactive_customer_percentage}%`]
    ]
    
    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = globalThis.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `customer-insights-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    globalThis.URL.revokeObjectURL(url)
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Carregando insights de clientes...</p>
        </div>
      )
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchCustomerInsights}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Tentar Novamente
          </button>
        </div>
      )
    }

    if (insights) {
      return <CustomerInsightsCard data={insights} />
    }

    return (
      <div className="text-center py-12 text-gray-500">
        <p>Nenhum dado de cliente encontrado</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">👥 Análise de Clientes</h2>
        <button
          onClick={handleExport}
          disabled={!insights}
          className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base flex items-center justify-center gap-2"
        >
          📊 Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Filtros</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
              Data Inicial
            </label>
            <input
              id="start-date"
              type="date"
              value={localFilters.startDate}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
              Data Final
            </label>
            <input
              id="end-date"
              type="date"
              value={localFilters.endDate}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="store-id" className="block text-sm font-medium text-gray-700 mb-1">
              Loja
            </label>
            <select
              id="store-id"
              value={localFilters.storeId || ''}
              onChange={(e) => setLocalFilters(prev => ({ 
                ...prev, 
                storeId: e.target.value ? Number.parseInt(e.target.value) : null 
              }))}
              disabled={loadingStores}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Todas as lojas</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                  {store.city && store.state ? ` (${store.city}, ${store.state})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
          <button
            onClick={handleApplyFilters}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          >
            Aplicar Filtros
          </button>
          <button
            onClick={handleClearFilters}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm sm:text-base"
          >
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  )
}
