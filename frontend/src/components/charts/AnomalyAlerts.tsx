import React from 'react'

interface Alert {
  id: string
  type: 'warning' | 'error' | 'info' | 'success'
  title: string
  message: string
  timestamp: string
  severity: 'low' | 'medium' | 'high'
}

interface AnomalyAlertsProps {
  alerts: Alert[]
  title?: string
}

export function AnomalyAlerts({ alerts, title = "Alertas de Anomalias" }: Readonly<AnomalyAlertsProps>) {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return '⚠️'
      case 'error':
        return '🚨'
      case 'info':
        return 'ℹ️'
      case 'success':
        return '✅'
      default:
        return '📢'
    }
  }

  const getAlertColor = (type: string, severity: string) => {
    if (type === 'error' || severity === 'high') {
      return 'border-red-200 bg-red-50'
    }
    if (type === 'warning' || severity === 'medium') {
      return 'border-yellow-200 bg-yellow-50'
    }
    if (type === 'info' || severity === 'low') {
      return 'border-blue-200 bg-blue-50'
    }
    return 'border-green-200 bg-green-50'
  }

  const getTextColor = (type: string, severity: string) => {
    if (type === 'error' || severity === 'high') {
      return 'text-red-800'
    }
    if (type === 'warning' || severity === 'medium') {
      return 'text-yellow-800'
    }
    if (type === 'info' || severity === 'low') {
      return 'text-blue-800'
    }
    return 'text-green-800'
  }

  const getSeverityBadgeClass = (severity: string) => {
    if (severity === 'high') return 'bg-red-100 text-red-800'
    if (severity === 'medium') return 'bg-yellow-100 text-yellow-800'
    return 'bg-blue-100 text-blue-800'
  }

  const getSeverityLabel = (severity: string) => {
    if (severity === 'high') return 'Alta'
    if (severity === 'medium') return 'Média'
    return 'Baixa'
  }

  const getTypeBadgeClass = (type: string) => {
    if (type === 'error') return 'bg-red-100 text-red-800'
    if (type === 'warning') return 'bg-yellow-100 text-yellow-800'
    if (type === 'info') return 'bg-blue-100 text-blue-800'
    return 'bg-green-100 text-green-800'
  }

  const getTypeLabel = (type: string) => {
    if (type === 'error') return 'Erro'
    if (type === 'warning') return 'Aviso'
    if (type === 'info') return 'Informação'
    return 'Sucesso'
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6 w-full">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-4">{title}</h3>
      
      {alerts.length === 0 ? (
        <div className="text-center py-6 sm:py-8 text-gray-500">
          <div className="text-3xl sm:text-4xl mb-2">🎉</div>
          <p className="text-sm sm:text-base">Nenhuma anomalia detectada</p>
          <p className="text-xs sm:text-sm">Todos os indicadores estão dentro dos parâmetros normais</p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 sm:p-5 rounded-lg border ${getAlertColor(alert.type, alert.severity)}`}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl sm:text-2xl flex-shrink-0">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                    <h4 className={`text-base sm:text-base font-semibold ${getTextColor(alert.type, alert.severity)}`}>
                      {alert.title}
                    </h4>
                    <span className="text-xs sm:text-xs text-gray-500">
                      {new Date(alert.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className={`mt-2 text-sm sm:text-sm ${getTextColor(alert.type, alert.severity)} break-words`}>
                    {alert.message}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityBadgeClass(alert.severity)}`}>
                      {getSeverityLabel(alert.severity)} Prioridade
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadgeClass(alert.type)}`}>
                      {getTypeLabel(alert.type)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Summary */}
      {alerts.length > 0 && (
        <div className="mt-4 sm:mt-6 p-4 sm:p-4 bg-gray-50 rounded-lg">
          <h4 className="text-base sm:text-base font-semibold text-gray-800 mb-3">📊 Resumo dos Alertas</h4>
          <div className="grid grid-cols-2 gap-4 sm:gap-4 text-sm sm:text-sm">
            <div>
              <span className="text-gray-600">Total de alertas:</span>
              <span className="ml-2 font-medium">{alerts.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Alta prioridade:</span>
              <span className="ml-2 font-medium text-red-600">
                {alerts.filter(a => a.severity === 'high').length}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Média prioridade:</span>
              <span className="ml-2 font-medium text-yellow-600">
                {alerts.filter(a => a.severity === 'medium').length}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Baixa prioridade:</span>
              <span className="ml-2 font-medium text-blue-600">
                {alerts.filter(a => a.severity === 'low').length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
