import { useState, useEffect } from 'react'
import { useSummary, useRevenue, useTopProducts, useChannelPerformance } from '../hooks/useAnalytics'
import { useProductsMargin, useDeliveryPerformance, useCustomerInsights, usePeakHoursHeatmap } from '../hooks/useAnalyticsExtended'
import { useTopItems, useProductsCustomizations, usePaymentMix, useDeliveryRegions } from '../hooks/useAdvancedAnalytics'
import { useAnomalyAlerts } from '../hooks/useAnomalyAlerts'
import { exportToCSV } from '../utils/export'
import { RevenueChart } from '../components/charts/RevenueChart'
import { TopProductsChart } from '../components/charts/TopProductsChart'
import { ChannelPerformanceChart } from '../components/charts/ChannelPerformanceChart'
import { PieChart } from '../components/charts/PieChart'
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
import { AdvancedFilters } from '../components/filters/AdvancedFilters'
import { dashboardApi } from '../services/dashboardApi'
import type { AnalyticsFilters } from '../types/api'
import type { Dashboard, Widget } from '../types/dashboard'

export function DashboardPage() {
  // Default dashboard state
  const [defaultDashboard, setDefaultDashboard] = useState<Dashboard | null>(null)
  const [loadingDashboard, setLoadingDashboard] = useState(true)

  // Filtros ativos (aplicados aos gráficos)
  const [activeFilters, setActiveFilters] = useState<AnalyticsFilters>({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  })
  
  // Filtros locais (em edição, não aplicados ainda)
  const [localFilters, setLocalFilters] = useState<AnalyticsFilters>(activeFilters)
  
  const { data: summary, loading: summaryLoading, error: summaryError } = useSummary(activeFilters)
  const { data: revenueData, loading: revenueLoading, error: revenueError } = useRevenue(activeFilters)
  const { data: topProducts, loading: productsLoading } = useTopProducts(activeFilters, 10)
  const { data: channels, loading: channelsLoading } = useChannelPerformance(activeFilters)
  const { data: marginData } = useProductsMargin(activeFilters, 10)
  const { data: deliveryData } = useDeliveryPerformance(activeFilters, 'day')
  const { data: customerData } = useCustomerInsights(activeFilters)
  const { data: heatmapData } = usePeakHoursHeatmap(activeFilters)
  const { data: alertsData } = useAnomalyAlerts(activeFilters)
  const { data: itemsData } = useTopItems(activeFilters, 20)
  const { data: customizationsData } = useProductsCustomizations(activeFilters, 20)
  const { data: paymentsData } = usePaymentMix(activeFilters)
  const { data: deliveryRegionsData } = useDeliveryRegions(activeFilters, 50)

  // Load default dashboard on mount
  useEffect(() => {
    const loadDefaultDashboard = async () => {
      try {
        setLoadingDashboard(true)
        const dashboard = await dashboardApi.getDefault()
        setDefaultDashboard(dashboard)
      } catch (error: any) {
        console.error('Error loading default dashboard:', error)
        // If no default dashboard (expected case) or error, continue with standard dashboard
        setDefaultDashboard(null)
      } finally {
        setLoadingDashboard(false)
      }
    }
    loadDefaultDashboard()
  }, [])

  const loading = summaryLoading || revenueLoading || productsLoading || channelsLoading || loadingDashboard

  const handleExport = () => {
    // Check if revenueData is available
    if (!revenueData || revenueData.length === 0) {
      alert('Nenhum dado disponível para exportar. Aguarde o carregamento dos dados.')
      return
    }
    
    // Build data from revenue data (which has proper period structure)
    // Use header names as keys so they match the headers array
    const allData = revenueData.map(r => ({
      'Período': r.period || '',
      'Faturamento': typeof r.revenue === 'number' ? r.revenue : 0,
      'Número de Vendas': typeof r.sales_count === 'number' ? r.sales_count : 0
    }))
    
    // Filter out any invalid entries (missing period or invalid values)
    const validData = allData.filter(item => 
      item['Período'] && 
      item['Período'].trim() !== '' &&
      item['Faturamento'] != null && 
      !isNaN(item['Faturamento']) &&
      item['Número de Vendas'] != null &&
      !isNaN(item['Número de Vendas'])
    )
    
    // Only export if we have valid data
    if (validData.length === 0) {
      alert('Nenhum dado válido disponível para exportar. Verifique se há dados no período selecionado.')
      return
    }
    
    // Export CSV with matching headers
    exportToCSV(validData, `analytics-dashboard-${new Date().toISOString().split('T')[0]}`, [
      'Período',
      'Faturamento',
      'Número de Vendas'
    ])
  }

  const handleRemoveDefault = async () => {
    if (!defaultDashboard?.id) return
    
    if (!confirm('Deseja voltar ao dashboard padrão original? O dashboard customizado continuará salvo.')) {
      return
    }

    try {
      // Remove is_default flag from the current dashboard
      await dashboardApi.update(defaultDashboard.id, { is_default: false })
      
      // Reload to show standard dashboard
      setDefaultDashboard(null)
      
      alert('Dashboard padrão restaurado com sucesso!')
    } catch (error: any) {
      let errorMessage = 'Erro ao remover dashboard padrão'
      if (error?.response?.data?.error) {
        errorMessage = `Erro: ${error.response.data.error}`
        if (error.response.data.message) {
          errorMessage += ` - ${error.response.data.message}`
        }
      } else if (error?.response?.data?.detail) {
        errorMessage = `Erro: ${error.response.data.detail}`
      } else if (error?.message) {
        errorMessage = `Erro: ${error.message}`
      }
      
      alert(errorMessage)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  if (summaryError || revenueError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold">Erro ao carregar dados</h3>
          <p className="text-red-600">{summaryError || revenueError}</p>
        </div>
      </div>
    )
  }

  // Helper function to render custom widgets
  const renderCustomWidget = (widget: Widget) => {
    const widgetTitle = widget.title || 'Widget'
    
    // Revenue Chart
    if (widget.dataSource === 'revenue') {
      return <RevenueChart data={revenueData || []} title={widgetTitle} />
    }
    
    // Summary Stats Cards
    if (widget.dataSource === 'summary') {
      const metric = widget.config?.metric
      if (metric === 'total_revenue' && summary) {
        return <StatsCard title={widgetTitle} value={summary.total_revenue} color="blue" />
      }
      if (metric === 'sales_count' && summary) {
        return <StatsCard title={widgetTitle} value={summary.sales_count} format="number" color="green" />
      }
      if (metric === 'avg_ticket' && summary) {
        return <StatsCard title={widgetTitle} value={summary.avg_ticket} color="purple" />
      }
      return <StatsCard title={widgetTitle} value={0} color="blue" />
    }

    // Products Margin Chart
    if (widget.dataSource === 'margin') {
      return <ProductsMarginChart data={marginData || []} title={widgetTitle} />
    }

    // Delivery Performance Chart
    if (widget.dataSource === 'delivery') {
      return <DeliveryPerformanceChart data={deliveryData || []} title={widgetTitle} />
    }

    // Customer Insights Card
    if (widget.dataSource === 'customers') {
      return <CustomerInsightsCard data={customerData || null} title={widgetTitle} />
    }

    // Peak Hours Heatmap
    if (widget.dataSource === 'heatmap') {
      return <PeakHoursHeatmap data={heatmapData || null} title={widgetTitle} />
    }

    // Anomaly Alerts
    if (widget.dataSource === 'alerts') {
      return <AnomalyAlerts alerts={alertsData || []} title={widgetTitle} />
    }

    // Top Items Chart
    if (widget.dataSource === 'items') {
      return <TopItemsChart data={itemsData || []} title={widgetTitle} />
    }

    // Products Customizations Chart
    if (widget.dataSource === 'customizations') {
      // Transform data to match component interface
      const transformedData = (customizationsData || []).map(item => ({
        product_name: item.product_name,
        total_customizations: item.total_customizations,
        // Calculate sales with customizations based on customization rate
        sales_with_customizations: Math.round(item.total_sales * (item.customization_rate / 100)),
        total_sales: item.total_sales,
        customization_rate: item.customization_rate
      }))
      return <ProductsCustomizationsChart data={transformedData} title={widgetTitle} />
    }

    // Payment Mix Chart
    if (widget.dataSource === 'payments') {
      // Transform data to match component interface
      const transformedData = (paymentsData || []).map(item => ({
        channel_name: item.channel_name,
        payment_type: item.payment_type_name,
        payment_count: item.payment_count,
        total_value: item.total_value,
        percentage: item.percentage
      }))
      return <PaymentMixChart data={transformedData} title={widgetTitle} />
    }

    // Delivery Regions Chart
    if (widget.dataSource === 'delivery_regions') {
      // Transform data to match component interface
      const transformedData = (deliveryRegionsData || []).map(item => ({
        neighborhood: item.neighborhood,
        city: item.city,
        state: item.city, // Use city as state fallback if not available
        delivery_count: item.delivery_count,
        avg_delivery_time: item.avg_delivery_time,
        min_delivery_time: Math.max(0, item.avg_delivery_time - 10), // Approximate min
        max_delivery_time: item.avg_delivery_time + 10, // Approximate max
        total_revenue: item.total_revenue
      }))
      return <DeliveryRegionsChart data={transformedData} title={widgetTitle} />
    }

    // Fallback for unknown widget types
    return (
      <div className="p-4 bg-gray-50 rounded">
        <h4 className="font-semibold mb-2">{widgetTitle}</h4>
        <p className="text-sm text-gray-500">
          Widget tipo: {widget.type} | DataSource: {widget.dataSource || 'N/A'}
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Tipo de widget não suportado ainda
        </p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <button
            onClick={handleExport}
            className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Exportar CSV</span>
          </button>
        </div>
        
        {/* Advanced Filters */}
        <AdvancedFilters 
          filters={localFilters} 
          onChange={setLocalFilters}
          onApply={() => setActiveFilters(localFilters)}
          onClear={() => {
            const cleared = {
              start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              end_date: new Date().toISOString().split('T')[0],
            }
            setLocalFilters(cleared)
            setActiveFilters(cleared)
          }}
        />
      </div>

      {/* Render Custom Dashboard or Default */}
      {defaultDashboard && defaultDashboard.config.widgets.length > 0 ? (
        // Custom Dashboard from Builder
        <div>
          {defaultDashboard.name && (
            <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="text-sm text-gray-600">
                Dashboard: <span className="font-semibold">{defaultDashboard.name}</span>
                {defaultDashboard.description && (
                  <span className="ml-2">- {defaultDashboard.description}</span>
                )}
              </div>
              <button
                onClick={handleRemoveDefault}
                className="w-full sm:w-auto text-xs sm:text-sm bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-300 transition-colors flex items-center gap-2"
                title="Voltar ao dashboard padrão original"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Voltar ao Dashboard Padrão
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {defaultDashboard.config.widgets.map((widget) => {
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
                  className={`bg-white rounded-lg shadow p-3 sm:p-4 ${colSpanClass}`}
                >
                  {renderCustomWidget(widget)}
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        // Default Dashboard
        <>
          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <StatsCard
                title="Faturamento Total"
                value={summary.total_revenue}
                icon={
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                color="blue"
              />
              
              <StatsCard
                title="Total de Vendas"
                value={summary.sales_count}
                format="number"
                icon={
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
                color="green"
              />
              
              <StatsCard
                title="Ticket Médio"
                value={summary.avg_ticket}
                icon={
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                }
                color="purple"
              />
            </div>
          )}

          {/* Charts */}
          <div className="space-y-4 sm:space-y-6">
            {/* Revenue Chart */}
            <RevenueChart 
              data={revenueData} 
              title="📈 Faturamento ao Longo do Tempo"
            />
            
            {/* Two column layout for other charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Top Products */}
              <TopProductsChart 
                data={topProducts}
                title="🏆 Top 10 Produtos mais Vendidos"
              />
              
              {/* Channel Performance */}
              <ChannelPerformanceChart 
                data={channels}
                title="📊 Performance por Canal"
              />
            </div>
            
            {/* Channel Distribution Pie Chart */}
            {channels.length > 0 && (
              <PieChart 
                data={channels}
                title="🥧 Distribuição por Canal"
              />
            )}
          </div>
        </>
      )}
    </div>
  )
}

