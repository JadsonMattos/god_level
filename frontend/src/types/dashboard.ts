export interface Widget {
  id: string
  type: 'chart' | 'card' | 'table'
  title: string
  dataSource?: string
  config?: Record<string, any>
  component?: any
  x?: number
  y?: number
  w?: number
  h?: number
}

export interface Dashboard {
  id?: number
  name: string
  description?: string
  config: {
    widgets: Widget[]
    layout?: {
      columns?: number
      rows?: number
    }
    filters?: Record<string, any>
  }
  is_default?: boolean
  user_id?: number
  created_at?: string
  updated_at?: string
}

export type DashboardConfig = Dashboard['config']

