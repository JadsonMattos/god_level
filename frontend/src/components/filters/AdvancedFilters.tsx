import { useState, useEffect } from 'react'
import type { AnalyticsFilters, Store, Channel } from '../../types/api'
import { storesApi } from '../../services/api'

interface AdvancedFiltersProps {
  readonly filters: AnalyticsFilters
  readonly onChange: (filters: AnalyticsFilters) => void
  readonly onApply: () => void
  readonly onClear: () => void
}

export function AdvancedFilters({ filters, onChange, onApply, onClear }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [stores, setStores] = useState<Store[]>([])
  const [channels, setChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [storesData, channelsData] = await Promise.all([
          storesApi.getStores(),
          storesApi.getChannels()
        ])
        setStores(storesData.data)
        setChannels(channelsData.data)
      } catch (error) {
        // Log error for debugging (do not silently swallow)
        console.error('Failed to load stores or channels:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleChange = (key: keyof AnalyticsFilters, value: string | number | undefined) => {
    onChange({ ...filters, [key]: value })
  }

  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <div className="p-4 border-b">
        <button
          onClick={(e) => {
            // Prevent text selection and extension interference
            e.preventDefault()
            e.stopPropagation()
            
            // Clear any text selection that might cause extension issues
            // Prefer globalThis over window for broader JS environments
            if (typeof globalThis.getSelection === 'function') {
              const selection = globalThis.getSelection()
              if (selection) {
                selection.removeAllRanges()
              }
            }
            
            setIsOpen(!isOpen)
          }}
          onMouseDown={(e) => {
            // Prevent text selection on click
            e.preventDefault()
          }}
          className="flex items-center justify-between w-full text-left select-none cursor-pointer"
          type="button"
        >
          <h3 className="text-lg font-semibold select-none">🔍 Filtros Avançados</h3>
          <svg
            className={`w-5 h-5 transform transition-transform ${isOpen ? 'rotate-180' : ''} pointer-events-none`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
              Data Inicial
            </label>
            <input
              id="start_date"
              type="date"
              value={filters.start_date || ''}
              onChange={(e) => handleChange('start_date', e.target.value || undefined)}
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
              value={filters.end_date || ''}
              onChange={(e) => handleChange('end_date', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="store_id" className="block text-sm font-medium text-gray-700 mb-1">
              Loja
            </label>
            <select
              id="store_id"
              value={filters.store_id || ''}
              onChange={(e) => handleChange('store_id', e.target.value ? Number.parseInt(e.target.value, 10) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              disabled={loading}
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
                value={filters.channel_id || ''}
                onChange={(e) => handleChange('channel_id', e.target.value ? Number.parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                disabled={loading}
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
            <label htmlFor="day_of_week" className="block text-sm font-medium text-gray-700 mb-1">
              Dia da Semana
            </label>
            <select
              id="day_of_week"
              value={filters.day_of_week ?? ''}
              onChange={(e) => handleChange('day_of_week', e.target.value ? Number.parseInt(e.target.value, 10) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Todos os dias</option>
              <option value="0">Segunda-feira</option>
              <option value="1">Terça-feira</option>
              <option value="2">Quarta-feira</option>
              <option value="3">Quinta-feira</option>
              <option value="4">Sexta-feira</option>
              <option value="5">Sábado</option>
              <option value="6">Domingo</option>
            </select>
          </div>

          <div>
            <label htmlFor="hour_start" className="block text-sm font-medium text-gray-700 mb-1">
              Horário Inicial
            </label>
            <input
              id="hour_start"
              type="number"
              min="0"
              max="23"
              value={filters.hour_start ?? ''}
              onChange={(e) => handleChange('hour_start', e.target.value ? Number.parseInt(e.target.value, 10) : undefined)}
              placeholder="0-23"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="hour_end" className="block text-sm font-medium text-gray-700 mb-1">
              Horário Final
            </label>
            <input
              id="hour_end"
              type="number"
              min="0"
              max="23"
              value={filters.hour_end ?? ''}
              onChange={(e) => handleChange('hour_end', e.target.value ? Number.parseInt(e.target.value, 10) : undefined)}
              placeholder="0-23"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-end col-span-1 sm:col-span-2 lg:col-span-3">
            <button
              onClick={onApply}
              className="flex-1 w-full sm:w-auto px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Aplicar Filtros
            </button>
            <button
              onClick={onClear}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm sm:text-base"
            >
              Limpar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

