import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { dashboardApi } from '../services/dashboardApi'
import { Dashboard } from '../types/dashboard'
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
import { useProductsMargin, useDeliveryPerformance, useCustomerInsights, usePeakHoursHeatmap } from '../hooks/useAnalyticsExtended'
import { useTopItems, useProductsCustomizations, usePaymentMix, useDeliveryRegions } from '../hooks/useAdvancedAnalytics'
import { useAnomalyAlerts } from '../hooks/useAnomalyAlerts'
import { useSummary, useRevenue } from '../hooks/useAnalytics'

export function SharedDashboardPage() {
  const { shareToken } = useParams<{ shareToken: string }>()
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const filters = dashboard?.config?.filters || {
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  }

  useEffect(() => {
    const loadDashboard = async () => {
      if (!shareToken) {
        setError('Token de compartilhamento não fornecido')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const data = await dashboardApi.getShared(shareToken)
        setDashboard({
          id: data.id,
          name: data.name,
          description: data.description,
          config: data.config,
          is_default: data.is_default,
          user_id: data.user_id,
          created_at: data.created_at,
          updated_at: data.updated_at
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dashboard compartilhado')
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [shareToken])

  // Fetch data for widgets
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
      component: RevenueChart,
      data: revenueData,
    },
    {
      id: 'widget_stats_revenue',
      component: StatsCard,
      data: summary,
      config: { metric: 'total_revenue', title: 'Faturamento Total' }
    },
    {
      id: 'widget_stats_sales',
      component: StatsCard,
      data: summary,
      config: { metric: 'sales_count', title: 'Total de Vendas' }
    },
    {
      id: 'widget_stats_avg_ticket',
      component: StatsCard,
      data: summary,
      config: { metric: 'avg_ticket', title: 'Ticket Médio' }
    },
    {
      id: 'widget_margin',
      component: ProductsMarginChart,
      data: marginData,
    },
    {
      id: 'widget_delivery',
      component: DeliveryPerformanceChart,
      data: deliveryData,
    },
    {
      id: 'widget_customers',
      component: CustomerInsightsCard,
      data: customerData,
    },
    {
      id: 'widget_heatmap',
      component: PeakHoursHeatmap,
      data: heatmapData,
    },
    {
      id: 'widget_alerts',
      component: AnomalyAlerts,
      data: alertsData,
    },
    {
      id: 'widget_items',
      component: TopItemsChart,
      data: itemsData,
    },
    {
      id: 'widget_customizations',
      component: ProductsCustomizationsChart,
      data: customizationsData,
    },
    {
      id: 'widget_payments',
      component: PaymentMixChart,
      data: paymentsData,
    },
    {
      id: 'widget_delivery_regions',
      component: DeliveryRegionsChart,
      data: deliveryRegionsData,
    },
  ]

  const renderWidget = (widget: any) => {
    const widgetTemplate = availableWidgets.find(w => w.id === widget.id)
    
    if (!widgetTemplate) {
      return <div className="p-4 bg-gray-100 rounded">Widget não encontrado: {widget.id}</div>
    }

    const Component = widgetTemplate.component
    const widgetData = widgetTemplate.data || (widget.dataSource === 'summary' ? summary : null)

    return <Component data={widgetData} title={widget.title} {...(widget.config || widgetTemplate.config || {})} />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard compartilhado...</p>
        </div>
      </div>
    )
  }

  if (error || !dashboard) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow">
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erro ao carregar dashboard</h2>
          <p className="text-gray-600 mb-4">{error || 'Dashboard não encontrado ou não está mais compartilhado'}</p>
          <a
            href="/"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Voltar para o início
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {dashboard.name}
              </h1>
              {dashboard.description && (
                <p className="text-sm text-gray-600 mt-1">{dashboard.description}</p>
              )}
            </div>
            <div className="text-sm text-gray-500">
              📊 Dashboard Compartilhado
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {dashboard.config?.widgets?.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">Este dashboard não possui widgets.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {dashboard.config?.widgets?.map((widget: any) => {
              const widgetWidth = widget.w || 6
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
                  className={`bg-white rounded-lg shadow p-4 ${colSpanClass}`}
                >
                  {renderWidget(widget)}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

