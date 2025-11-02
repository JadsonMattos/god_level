import { useState, useEffect } from 'react'
import { Responsive, WidthProvider } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { Widget } from '../types/dashboard'
import { dashboardApi, Dashboard as DashboardType } from '../services/dashboardApi'
import { RevenueChart } from '../components/charts/RevenueChart'
import { StatsCard } from '../components/charts/StatsCard'
import { ProductsMarginChart } from '../components/charts/ProductsMarginChart'
import { DeliveryPerformanceChart } from '../components/charts/DeliveryPerformanceChart'
import { CustomerInsightsCard } from '../components/charts/CustomerInsightsCard'
import { PeakHoursHeatmap } from '../components/charts/PeakHoursHeatmap'
import { AnomalyAlerts } from '../components/charts/AnomalyAlerts'
import { TopItemsChart } from '../components/charts/TopItemsChart'
import { ProductsCustomizationsChart } from '../components/charts/ProductsCustomizationsChart'
import { PaymentMixChart } from '../components/charts/PaymentMixChart'
import { DeliveryRegionsChart } from '../components/charts/DeliveryRegionsChart'
import { useSummary, useRevenue } from '../hooks/useAnalytics'
import { useProductsMargin, useDeliveryPerformance, useCustomerInsights, usePeakHoursHeatmap } from '../hooks/useAnalyticsExtended'
import { useTopItems, useProductsCustomizations, usePaymentMix, useDeliveryRegions } from '../hooks/useAdvancedAnalytics'
import { useAnomalyAlerts } from '../hooks/useAnomalyAlerts'

const ResponsiveGridLayout = WidthProvider(Responsive)

export function DashboardBuilderPage() {
  const [dashboard, setDashboard] = useState<Partial<DashboardType>>({
    name: '',
    description: '',
    config: {
      widgets: [],
      layout: { columns: 12, rows: 12 }
    },
    is_default: false
  })
  const [saveAsDefault, setSaveAsDefault] = useState(false)

  const [isEditing, setIsEditing] = useState(false)
  const [savedDashboards, setSavedDashboards] = useState<DashboardType[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Filters for widgets
  const [filters, setFilters] = useState({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  })

  // Fetch data for widgets (with filters applied)
  const { data: summary } = useSummary(filters)
  const { data: revenueData } = useRevenue(filters)
  const { data: marginData } = useProductsMargin(filters, 10)
  const { data: deliveryData } = useDeliveryPerformance(filters, 'day')
  const { data: customerData } = useCustomerInsights(filters)
  const { data: heatmapData } = usePeakHoursHeatmap(filters)
  const { data: alertsData } = useAnomalyAlerts(filters)
  const { data: itemsData } = useTopItems(filters, 20)
  const { data: customizationsData } = useProductsCustomizations(filters, 20)
  const { data: paymentsData } = usePaymentMix(filters)
  const { data: deliveryRegionsData } = useDeliveryRegions(filters, 50)

  const availableWidgets = [
    {
      id: 'widget_revenue',
      type: 'chart' as const,
      title: 'Faturamento por Período',
      dataSource: 'revenue',
      component: RevenueChart,
      config: { groupBy: 'day' }
    },
    {
      id: 'widget_stats_revenue',
      type: 'card' as const,
      title: 'Faturamento Total',
      dataSource: 'summary',
      component: StatsCard,
      config: { metric: 'total_revenue', title: 'Faturamento Total' }
    },
    {
      id: 'widget_stats_sales',
      type: 'card' as const,
      title: 'Total de Vendas',
      dataSource: 'summary',
      component: StatsCard,
      config: { metric: 'sales_count', title: 'Total de Vendas' }
    },
    {
      id: 'widget_stats_avg_ticket',
      type: 'card' as const,
      title: 'Ticket Médio',
      dataSource: 'summary',
      component: StatsCard,
      config: { metric: 'avg_ticket', title: 'Ticket Médio' }
    },
    {
      id: 'widget_margin',
      type: 'chart' as const,
      title: 'Produtos com Menor Margem',
      dataSource: 'margin',
      component: ProductsMarginChart,
      config: { limit: 10 }
    },
    {
      id: 'widget_delivery',
      type: 'chart' as const,
      title: 'Performance de Entrega',
      dataSource: 'delivery',
      component: DeliveryPerformanceChart,
      config: { groupBy: 'day' }
    },
    {
      id: 'widget_customers',
      type: 'card' as const,
      title: 'Insights de Clientes',
      dataSource: 'customers',
      component: CustomerInsightsCard,
      config: {}
    },
    {
      id: 'widget_heatmap',
      type: 'chart' as const,
      title: 'Horários de Pico',
      dataSource: 'heatmap',
      component: PeakHoursHeatmap,
      config: {}
    },
    {
      id: 'widget_alerts',
      type: 'card' as const,
      title: 'Alertas de Anomalias',
      dataSource: 'alerts',
      component: AnomalyAlerts,
      config: {}
    },
    {
      id: 'widget_items',
      type: 'chart' as const,
      title: 'Itens Mais Vendidos',
      dataSource: 'items',
      component: TopItemsChart,
      config: {}
    },
    {
      id: 'widget_customizations',
      type: 'chart' as const,
      title: 'Produtos com Mais Customizações',
      dataSource: 'customizations',
      component: ProductsCustomizationsChart,
      config: {}
    },
    {
      id: 'widget_payments',
      type: 'chart' as const,
      title: 'Mix de Pagamentos',
      dataSource: 'payments',
      component: PaymentMixChart,
      config: {}
    },
    {
      id: 'widget_delivery_regions',
      type: 'chart' as const,
      title: 'Delivery por Região',
      dataSource: 'delivery_regions',
      component: DeliveryRegionsChart,
      config: {}
    },
  ]

  const addWidget = (widgetTemplate: any) => {
    const existingWidgets = dashboard.config.widgets
    const defaultWidth = 6
    const defaultHeight = 4
    const gridCols = 12
    
    let newX = 0
    let newY = 0
    
    if (existingWidgets.length === 0) {
      // First widget at top-left
      // newX and newY already initialized to 0
    } else {
      // Find the topmost row (lowest y value) and check if there's space
      const topRow = Math.min(...existingWidgets.map(w => w.y ?? 0))
      const topRowWidgets = existingWidgets.filter(w => (w.y ?? 0) === topRow)
      
      // Calculate total width used in top row
      const topRowWidth = topRowWidgets.reduce((sum, w) => {
        return sum + (w.w ?? defaultWidth)
      }, 0)
      
      // If there's space in the top row, place widget there
      if (topRowWidth + defaultWidth <= gridCols) {
        // Find rightmost position in top row
        const rightmostX = Math.max(...topRowWidgets.map(w => (w.x ?? 0) + (w.w ?? defaultWidth)))
        if (rightmostX + defaultWidth <= gridCols) {
          newX = rightmostX
          newY = topRow
        } else {
          // Find any gap in top row
          const sortedTopWidgets = [...topRowWidgets].sort((a, b) => (a.x ?? 0) - (b.x ?? 0))
          let foundGap = false
          
          // Check space at start
          if ((sortedTopWidgets[0].x ?? 0) >= defaultWidth) {
            // newX already 0, only update newY
            newY = topRow
            foundGap = true
          } else {
            // Check gaps between widgets
            for (let i = 0; i < sortedTopWidgets.length - 1 && !foundGap; i++) {
              const currentEnd = (sortedTopWidgets[i].x ?? 0) + (sortedTopWidgets[i].w ?? defaultWidth)
              const nextStart = sortedTopWidgets[i + 1].x ?? 0
              if (nextStart - currentEnd >= defaultWidth) {
                newX = currentEnd
                newY = topRow
                foundGap = true
              }
            }
          }
          
          // If no gap found, place below
          if (!foundGap) {
            const maxY = Math.max(...existingWidgets.map(w => (w.y ?? 0) + (w.h ?? defaultHeight)))
            // newX already 0, only update newY
            newY = maxY
          }
        }
      } else {
        // Top row is full, place below
        const maxY = Math.max(...existingWidgets.map(w => (w.y ?? 0) + (w.h ?? defaultHeight)))
        // newX already 0, only update newY
        newY = maxY
      }
    }
    
    const newWidget: Widget = {
      ...widgetTemplate,
      id: `${widgetTemplate.id}_${Date.now()}`,
      x: newX, 
      y: newY, 
      w: defaultWidth, 
      h: defaultHeight
    }
    
    setDashboard(prev => ({
      ...prev,
      config: {
        ...prev.config,
        widgets: [...prev.config.widgets, newWidget]
      }
    }))
  }

  const removeWidget = (widgetId: string) => {
    setDashboard(prev => ({
      ...prev,
      config: {
        ...prev.config,
        widgets: prev.config.widgets.filter(w => w.id !== widgetId)
      }
    }))
  }

  const updateWidgetPosition = (widget: Widget, layoutItem: any) => {
    return {
      ...widget,
      x: layoutItem.x,
      y: layoutItem.y,
      w: layoutItem.w,
      h: layoutItem.h
    }
  }

  const onLayoutChange = (layout: any) => {
    setDashboard(prev => {
      const updatedWidgets = prev.config.widgets.map(widget => {
        const layoutItem = layout.find((item: any) => item.i === widget.id)
        return layoutItem ? updateWidgetPosition(widget, layoutItem) : widget
      })

      return {
        ...prev,
        config: {
          ...prev.config,
          widgets: updatedWidgets
        }
      }
    })
  }

  useEffect(() => {
    loadDashboards()
  }, [])

  const loadDashboards = async () => {
    try {
      setIsLoading(true)
      const response = await dashboardApi.list()
      setSavedDashboards(response.items || [])
    } catch (error: any) {
      console.error('Error loading dashboards:', error)
      // If error loading, set empty list - user can still create new dashboards
      setSavedDashboards([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!dashboard.name) {
      alert('Por favor, digite um nome para o dashboard')
      return
    }

    try {
      setIsLoading(true)
      
      // Clean widgets before saving - remove non-serializable properties like 'component'
      const cleanWidgets = dashboard.config.widgets.map(widget => {
        const { component, ...cleanWidget } = widget
        return cleanWidget
      })
      
      await dashboardApi.create({
        name: dashboard.name,
        description: dashboard.description,
        config: {
          widgets: cleanWidgets,
          layout: dashboard.config.layout,
          filters: filters
        },
        is_default: saveAsDefault
      })
      
      const message = saveAsDefault 
        ? 'Dashboard salvo e definido como Dashboard Principal com sucesso!'
        : 'Dashboard salvo com sucesso!'
      alert(message)
      setSaveAsDefault(false)
      loadDashboards()
    } catch (error: any) {
      // Show more detailed error message
      let errorMessage = 'Erro ao salvar dashboard'
      
      // Check for specific error types
      if (error?.response?.status === 503) {
        errorMessage = 'Erro de conexão com o banco de dados. Verifique:\n'
        errorMessage += '1. Se o banco de dados está rodando\n'
        errorMessage += '2. Se as migrações foram executadas\n'
        errorMessage += '3. Se a tabela "dashboards" existe'
        
        if (error?.response?.data?.message) {
          errorMessage += `\n\nDetalhes: ${error.response.data.message}`
        }
      } else if (error?.response?.data?.error) {
        errorMessage = `Erro: ${error.response.data.error}`
        if (error.response.data.message) {
          errorMessage += `\n\n${error.response.data.message}`
        }
      } else if (error?.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          // Validation errors
          const validationErrors = error.response.data.detail
            .map((err: any) => `${err.loc?.join('.')}: ${err.msg}`)
            .join('\n')
          errorMessage = `Erro de validação:\n${validationErrors}`
        } else {
          errorMessage = `Erro: ${error.response.data.detail}`
        }
      } else if (error?.message) {
        errorMessage = `Erro: ${error.message}`
      }
      
      alert(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoad = async (savedDashboard: DashboardType) => {
    if (!savedDashboard.id) return

    try {
      const loaded = await dashboardApi.get(savedDashboard.id)
      
      // Restore component references from availableWidgets when loading
      const widgetsWithComponents = (loaded.config.widgets || []).map((widget: Widget) => {
        // Find the widget template by matching the base ID (remove timestamp suffix)
        const baseId = widget.id.replace(/_\d+$/, '')
        const widgetTemplate = availableWidgets.find(w => w.id === baseId)
        
        if (widgetTemplate) {
          return {
            ...widget,
            component: widgetTemplate.component
          }
        }
        
        return widget
      })
      
      setDashboard({
        ...loaded,
        config: {
          ...loaded.config,
          widgets: widgetsWithComponents
        }
      })
      
      // Restore filters if saved
      if (loaded.config.filters) {
        setFilters({
          start_date: loaded.config.filters.start_date || filters.start_date,
          end_date: loaded.config.filters.end_date || filters.end_date
        })
      }
      
      alert('Dashboard carregado com sucesso!')
    } catch (error: any) {
      let errorMessage = 'Erro ao carregar dashboard'
      if (error?.response?.data?.error) {
        errorMessage = `Erro: ${error.response.data.error}`
      } else if (error?.response?.data?.detail) {
        errorMessage = `Erro: ${error.response.data.detail}`
      } else if (error?.message) {
        errorMessage = `Erro: ${error.message}`
      }
      
      alert(errorMessage)
    }
  }

  const handleShare = async () => {
    if (!dashboard.id) {
      alert('Por favor, salve o dashboard antes de compartilhar')
      return
    }

    try {
      setIsLoading(true)
      let shareToken = dashboard.share_token

      // Enable sharing if not already shared
      if (!dashboard.is_shared || !shareToken) {
        const updated = await dashboardApi.enableSharing(dashboard.id)
        shareToken = updated.share_token
        setDashboard(updated)
      }

      if (shareToken) {
        // Generate share URL
        const shareUrl = `${globalThis.location.origin}/share/${shareToken}`
        
        // Copy to clipboard
        await navigator.clipboard.writeText(shareUrl)
        alert(`Link copiado! Compartilhe este link:\n\n${shareUrl}`)
      } else {
        alert('Erro ao gerar link de compartilhamento')
      }
    } catch (error) {
      console.error('Error sharing dashboard:', error)
      alert('Erro ao compartilhar dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (dashboardId: number, dashboardName: string) => {
    if (!confirm(`Tem certeza que deseja excluir o dashboard "${dashboardName}"?`)) {
      return
    }

    try {
      setIsLoading(true)
      await dashboardApi.delete(dashboardId)
      alert('Dashboard excluído com sucesso!')
      
      // Reload dashboards list
      loadDashboards()
      
      // If deleted dashboard was the current one, clear it
      if (dashboard.id === dashboardId) {
        setDashboard({
          name: '',
          description: '',
          config: {
            widgets: [],
            layout: { columns: 12, rows: 12 }
          },
          is_default: false
        })
      }
    } catch (error) {
      console.error('Error deleting dashboard:', error)
      alert('Erro ao excluir dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const renderWidget = (widget: Widget) => {
    // Find the widget template by matching the base ID
    const widgetTemplate = availableWidgets.find(w => {
      // Extract the base ID from the widget ID (remove timestamp suffix)
      const baseId = widget.id.replace(/_\d+$/, '')
      return w.id === baseId
    })
    
    if (!widgetTemplate) {
      return <div className="p-4 bg-gray-100 rounded">Widget não encontrado: {widget.id}</div>
    }
    const Component = widgetTemplate.component as any

    switch (widget.dataSource) {
      case 'revenue':
        return <Component data={revenueData || []} title={widget.title} />
      case 'summary': {
        // Get the metric from widget config and map to summary data
        const metric = widget.config?.metric
        let summaryValue = 0
        let summaryFormat: 'currency' | 'number' = 'currency'
        let summaryColor: 'blue' | 'green' | 'purple' | 'orange' = 'blue'
        
        if (summary) {
          if (metric === 'total_revenue') {
            summaryValue = summary.total_revenue || 0
            // summaryFormat already 'currency', summaryColor already 'blue'
          } else if (metric === 'sales_count') {
            summaryValue = summary.sales_count || 0
            summaryFormat = 'number'
            summaryColor = 'green'
          } else if (metric === 'avg_ticket') {
            summaryValue = summary.avg_ticket || 0
            // summaryFormat already 'currency', only update color
            summaryColor = 'purple'
          }
        }
        
        return (
          <Component 
            title={widget.config?.title || widget.title} 
            value={summaryValue}
            format={summaryFormat}
            color={summaryColor}
            isCurrency={summaryFormat === 'currency'}
          />
        )
      }
      case 'margin':
        return <Component data={marginData || []} title={widget.title} />
      case 'delivery':
        return <Component data={deliveryData || []} title={widget.title} />
      case 'customers':
        return <Component data={customerData || {}} title={widget.title} />
      case 'heatmap':
        return <Component data={heatmapData || []} title={widget.title} />
      case 'alerts':
        return <Component alerts={alertsData || []} title={widget.title} />
      case 'items':
        return <Component data={itemsData || []} title={widget.title} />
      case 'customizations':
        return <Component data={customizationsData || []} title={widget.title} />
      case 'payments':
        return <Component data={paymentsData || []} title={widget.title} />
      case 'delivery_regions':
        return <Component data={deliveryRegionsData || []} title={widget.title} />
      default:
        return <div className="p-4 bg-gray-100 rounded">Widget: {widget.title} (DataSource: {widget.dataSource})</div>
    }
  }

  // Convert widgets to grid layout format
  const layout = dashboard.config.widgets.map(widget => ({
    i: widget.id,
    x: widget.x ?? 0,
    y: widget.y ?? 0,
    w: widget.w ?? 6,
    h: widget.h ?? 4,
    minW: 2,
    minH: 2,
    maxW: 12,
    maxH: 12
  }))

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 overflow-x-hidden max-w-full">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">🛠️ Dashboard Builder</h2>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-semibold">
          {dashboard.name || 'Novo Dashboard'}
          {isEditing && <span className="ml-2 text-gray-500 text-xs sm:text-sm">(Editando)</span>}
        </h3>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm sm:text-base"
          >
            {isEditing ? 'Visualizar' : 'Editar'}
          </button>
          <button
            className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm sm:text-base"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? 'Salvando...' : '💾 Salvar Dashboard'}
          </button>
          {!!dashboard.id && (
            <button
              className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base flex items-center gap-2"
              onClick={handleShare}
              disabled={isLoading}
            >
              {dashboard.is_shared ? '🔗 Link Copiado!' : '🔗 Compartilhar'}
            </button>
          )}
        </div>
      </div>

      {/* Dashboard Info */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 sm:mb-6">
        <div>
          <label htmlFor="dashboard-name" className="block text-sm font-medium text-gray-700 mb-1">Nome do Dashboard</label>
          <input
            id="dashboard-name"
            type="text"
            value={dashboard.name}
            onChange={(e) => setDashboard(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            disabled={!isEditing}
          />
        </div>
        <div>
          <label htmlFor="dashboard-description" className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
          <input
            id="dashboard-description"
            type="text"
            value={dashboard.description || ''}
            onChange={(e) => setDashboard(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            disabled={!isEditing}
          />
        </div>
      </div>

      {/* Save as Default Option */}
      {isEditing && dashboard.name && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={saveAsDefault}
              onChange={(e) => setSaveAsDefault(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Usar como Dashboard Principal
            </span>
            <span className="text-xs text-gray-500">
              (Substitui o dashboard padrão na página Dashboard)
            </span>
          </label>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-3 sm:p-4 mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold mb-4">Filtros</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">Data Inicial</label>
            <input
              id="start-date"
              type="date"
              value={filters.start_date}
              onChange={(e) => setFilters(prev => ({ ...prev, start_date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">Data Final</label>
            <input
              id="end-date"
              type="date"
              value={filters.end_date}
              onChange={(e) => setFilters(prev => ({ ...prev, end_date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-4 gap-4 sm:gap-6 w-full max-w-full">
        {/* Sidebar - Available Widgets */}
        <div className="w-full lg:col-span-1 space-y-4 min-w-0">
          <div className="bg-white rounded-lg shadow p-4 sm:p-5 w-full">
            <h3 className="text-base sm:text-lg font-semibold mb-4 truncate">Widgets Disponíveis</h3>
            <div className="space-y-2">
              {availableWidgets.map((widget) => (
                <button
                  key={widget.id}
                  onClick={() => addWidget(widget)}
                  className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 rounded-md border border-blue-200 transition-colors min-w-0"
                >
                  <div className="font-medium text-sm sm:text-base break-words">{widget.title}</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1 break-words">{widget.type}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Saved Dashboards */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-5 w-full">
            <h3 className="text-base sm:text-lg font-semibold mb-4 truncate">Dashboards Salvos</h3>
            <div className="space-y-2 max-h-[300px] sm:max-h-[400px] overflow-y-auto">
              {savedDashboards.length === 0 ? (
                <p className="text-sm text-gray-500">Nenhum dashboard salvo</p>
              ) : (
                savedDashboards.map((saved) => (
                  <div
                    key={saved.id}
                    className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 rounded-md border border-gray-200 transition-colors"
                  >
                    <button
                      onClick={() => handleLoad(saved)}
                      className="flex-1 text-left px-4 py-3"
                    >
                      <div className="font-medium text-sm">{saved.name}</div>
                      <div className="text-xs text-gray-500">
                        {saved.config?.widgets?.length || 0} widgets
                      </div>
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleDelete(saved.id, saved.name)
                      }}
                      className="mr-3 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                      title="Excluir dashboard"
                      disabled={isLoading}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Dashboard Canvas with Drag-and-Drop */}
        <div className="w-full lg:col-span-3 bg-gray-50 rounded-lg shadow p-4 sm:p-5 lg:p-6 min-h-[400px] sm:min-h-[500px] lg:min-h-[700px] min-w-0">
          <h3 className="text-base sm:text-lg font-semibold mb-4 truncate">Dashboard Canvas</h3>
          
          {renderDashboardContent()}
        </div>
      </div>
    </div>
  )

  function renderDashboardContent() {
    if (dashboard.config.widgets.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] text-center px-4 py-8">
          <div className="text-5xl sm:text-6xl mb-4">📊</div>
          <h4 className="text-base sm:text-xl font-semibold text-gray-700 mb-2">Canvas Vazio</h4>
          <p className="text-xs sm:text-base text-gray-500 mb-4 sm:mb-6 max-w-md">
            Adicione widgets do painel acima para começar a construir seu dashboard
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 max-w-md w-full">
            <p className="text-xs sm:text-sm text-blue-800">
              💡 <strong>Dica:</strong> Clique em "Editar" acima e depois clique nos widgets disponíveis
            </p>
          </div>
        </div>
      )
    }

    if (isEditing) {
      return (
            <div className="w-full" style={{ overflow: 'visible' }}>
              <ResponsiveGridLayout
                key={`grid-${isEditing}-${dashboard.config.widgets.length}`}
                className="layout"
                layouts={{ lg: layout, md: layout, sm: layout, xs: layout, xxs: layout }}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 12, sm: 6, xs: 2, xxs: 1 }}
                rowHeight={80}
                onLayoutChange={onLayoutChange}
                isDraggable={isEditing}
                isResizable={isEditing}
                margin={[8, 8]}
                draggableCancel=".remove-widget-btn"
                resizeHandles={['se', 'sw', 'ne', 'nw', 'e', 'w', 's', 'n']}
                compactType="vertical"
                style={{ width: '100%', maxWidth: '100%', overflow: 'visible' }}
              >
              {dashboard.config.widgets.map((widget) => {
                const layoutItem = layout.find(l => l.i === widget.id)
                
                if (!layoutItem) {
                  return null
                }
                
                return (
                  <div
                    key={widget.id}
                    className="bg-white rounded-lg shadow p-4 sm:p-4 relative"
                    data-grid={layoutItem}
                    style={{ minWidth: 0 }}
                  >
                    {isEditing && (
                      <button
                        onMouseDown={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          // Prevent grid layout from capturing this event
                          const target = e.target as HTMLElement
                          target.closest('.react-grid-item')?.classList.add('dragging-disabled')
                        }}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          removeWidget(widget.id)
                        }}
                        onMouseUp={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                        style={{ 
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          zIndex: 1000,
                          pointerEvents: 'auto'
                        }}
                        className="remove-widget-btn bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-base sm:text-lg font-bold cursor-pointer shadow-md transition-colors"
                        title="Remover widget"
                        type="button"
                        draggable={false}
                      >
                        ×
                      </button>
                    )}
                    <div className="overflow-auto" style={{ maxHeight: '100%' }}>
                      {renderWidget(widget)}
                    </div>
                  </div>
                )
              })}
              </ResponsiveGridLayout>
            </div>
      )
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full max-w-full overflow-x-hidden">
        {dashboard.config.widgets.map((widget) => {
                const widgetWidth = widget.w || 6
                // Convert grid-12 to responsive columns
                let colSpanClass: string
                if (widgetWidth <= 3) {
                  colSpanClass = 'col-span-1'
                } else if (widgetWidth <= 6) {
                  colSpanClass = 'sm:col-span-2'
                } else if (widgetWidth <= 9) {
                  colSpanClass = 'sm:col-span-2 lg:col-span-3'
                } else {
                  colSpanClass = 'sm:col-span-2 lg:col-span-3 xl:col-span-4'
                }
                return (
                  <div
                    key={widget.id}
                    className={`bg-white rounded-lg shadow p-4 sm:p-4 ${colSpanClass} overflow-auto`}
                  >
                    {renderWidget(widget)}
                  </div>
                )
              })}
      </div>
    )
  }
}