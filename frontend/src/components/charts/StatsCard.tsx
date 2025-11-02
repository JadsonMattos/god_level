import { formatCurrency } from '../../utils/formatters'

interface StatsCardProps {
  title: string
  value: number
  icon?: React.ReactNode
  color?: 'blue' | 'green' | 'purple' | 'orange'
  format?: 'currency' | 'number'
  isCurrency?: boolean
}

const colorClasses = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  purple: 'bg-purple-100 text-purple-600',
  orange: 'bg-orange-100 text-orange-600',
}

const getDisplayValue = (value: number, isCurrency?: boolean, format?: string): string => {
  if (isCurrency === false) return value.toLocaleString('pt-BR')
  if (isCurrency === true || format === 'currency') return formatCurrency(value)
  return value.toLocaleString('pt-BR')
}

export function StatsCard({ title, value, icon, color = 'blue', format = 'currency', isCurrency }: Readonly<StatsCardProps>) {
  const displayValue = getDisplayValue(value, isCurrency, format)
  
  return (
    <section 
      className="bg-white rounded-lg shadow p-4 sm:p-6 hover:shadow-lg transition-shadow w-full"
      aria-label={title}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm sm:text-base text-gray-600 mb-2 sm:mb-1">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 break-words" aria-label={`${title}: ${displayValue}`}>{displayValue}</p>
        </div>
        {icon && (
          <div className={`${colorClasses[color]} rounded-full p-3 sm:p-4 flex-shrink-0`} aria-hidden="true">
            <div className="w-6 h-6 sm:w-8 sm:h-8">{icon}</div>
          </div>
        )}
      </div>
    </section>
  )
}

