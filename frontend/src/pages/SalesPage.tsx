import { useState, useEffect } from 'react'
import { useSales } from '../hooks/useSales'
import { formatCurrency, formatDate } from '../utils/formatters'
import { storesApi } from '../services/api'
import type { SalesFilters, Store, Channel } from '../types/api'

export function SalesPage() {
  const [localFilters, setLocalFilters] = useState<SalesFilters>({
    limit: 20,
    offset: 0,
  })
  const [activeFilters, setActiveFilters] = useState<SalesFilters>({
    limit: 20,
    offset: 0,
  })
  const [stores, setStores] = useState<Store[]>([])
  const [channels, setChannels] = useState<Channel[]>([])
  const [filtersLoading, setFiltersLoading] = useState(true)
  
  const { sales, loading, error, total, hasMore, refetch } = useSales(activeFilters)

  useEffect(() => {
    const loadData = async () => {
      try {
        setFiltersLoading(true)
        const [storesData, channelsData] = await Promise.all([
          storesApi.getStores(),
          storesApi.getChannels()
        ])
        setStores(storesData.data)
        setChannels(channelsData.data)
      } catch (error) {
        console.error('Failed to load stores or channels:', error)
      } finally {
        setFiltersLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando vendas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold mb-2">Erro ao carregar vendas</h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={refetch}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Vendas</h1>
        <p className="text-sm sm:text-base text-gray-600">
          Total: <span className="font-semibold">{total}</span> vendas
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-3 sm:p-4 mb-4 sm:mb-6">
        <h3 className="text-lg font-semibold mb-4">🔍 Filtros</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
              Data Inicial
            </label>
            <input
              id="start_date"
              type="date"
              value={localFilters.start_date || ''}
              onChange={(e) => setLocalFilters({ ...localFilters, start_date: e.target.value || undefined, offset: 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
              Data Final
            </label>
            <input
              id="end_date"
              type="date"
              value={localFilters.end_date || ''}
              onChange={(e) => setLocalFilters({ ...localFilters, end_date: e.target.value || undefined, offset: 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="store_id" className="block text-sm font-medium text-gray-700 mb-1">
              Loja
            </label>
            <select
              id="store_id"
              value={localFilters.store_id || ''}
              onChange={(e) => setLocalFilters({ ...localFilters, store_id: e.target.value ? Number.parseInt(e.target.value, 10) : undefined, offset: 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              disabled={filtersLoading}
            >
              <option value="">Todas as lojas</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name} {store.city && store.state ? `(${store.city}, ${store.state})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="channel_id" className="block text-sm font-medium text-gray-700 mb-1">
              Canal
            </label>
            <select
              id="channel_id"
              value={localFilters.channel_id || ''}
              onChange={(e) => setLocalFilters({ ...localFilters, channel_id: e.target.value ? Number.parseInt(e.target.value, 10) : undefined, offset: 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              disabled={filtersLoading}
            >
              <option value="">Todos os canais</option>
              {channels.map((channel) => (
                <option key={channel.id} value={channel.id}>
                  {channel.name} {channel.description ? `- ${channel.description}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="limit-select" className="block text-sm font-medium text-gray-700 mb-1">
              Limite por página
            </label>
            <select
              id="limit-select"
              value={localFilters.limit || 20}
              onChange={(e) => setLocalFilters({ ...localFilters, limit: Number.parseInt(e.target.value), offset: 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Selecione o número de vendas por página"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => setActiveFilters({ ...localFilters, offset: 0 })}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Aplicar Filtros
          </button>
          <button
            onClick={() => {
              const cleared = { limit: 20, offset: 0 }
              setLocalFilters(cleared)
              setActiveFilters(cleared)
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Data
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Loja
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Canal
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                    #{sale.id}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600 hidden sm:table-cell">
                    {formatDate(sale.created_at)}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-semibold text-gray-900">
                    {formatCurrency(sale.total_amount)}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${
                        sale.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {sale.status}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600 hidden md:table-cell">
                    Loja #{sale.store_id}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600 hidden lg:table-cell">
                    Canal #{sale.channel_id}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sales.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhuma venda encontrada</p>
          </div>
        )}

        {/* Pagination */}
        {hasMore && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <button
              onClick={() => setActiveFilters({ ...activeFilters, offset: (activeFilters.offset || 0) + (activeFilters.limit || 20) })}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Carregar mais
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

