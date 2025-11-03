import { apiClient } from './axios'

export interface DashboardRequest {
  name: string
  description?: string
  config: {
    widgets: any[]
    layout?: any
    filters?: any
  }
  is_default?: boolean
}

export interface Dashboard {
  id: number
  name: string
  description?: string
  config: {
    widgets: any[]
    layout?: any
    filters?: any
  }
  is_default?: boolean
  user_id?: number
  share_token?: string | null
  is_shared?: boolean
  created_at: string
  updated_at: string
}

export const dashboardApi = {
  list: async () => {
    const { data } = await apiClient.get<{ items: Dashboard[], total: number }>('/api/v1/dashboards')
    return data
  },

  get: async (id: number) => {
    const { data } = await apiClient.get<Dashboard>(`/api/v1/dashboards/${id}`)
    return data
  },

  create: async (dashboard: DashboardRequest) => {
    const { data } = await apiClient.post<Dashboard>('/api/v1/dashboards', dashboard)
    return data
  },

  update: async (id: number, dashboard: Partial<DashboardRequest>) => {
    const { data } = await apiClient.put<Dashboard>(`/api/v1/dashboards/${id}`, dashboard)
    return data
  },

  delete: async (id: number) => {
    const { data } = await apiClient.delete(`/api/v1/dashboards/${id}`)
    return data
  },

  getDefault: async () => {
    try {
      const { data } = await apiClient.get<Dashboard | null>('/api/v1/dashboards/default', {
        timeout: 30000, // 30 seconds for Render cold starts
      })
      return data
    } catch (error: any) {
      // Handle timeout and 503 errors gracefully (no default dashboard exists)
      if (error.code === 'ECONNABORTED' || error.response?.status === 503 || error.response?.status === 404) {
        return null
      }
      throw error
    }
  },

  enableSharing: async (id: number) => {
    const { data } = await apiClient.post<Dashboard>(`/api/v1/dashboards/${id}/share`)
    return data
  },

  disableSharing: async (id: number) => {
    const { data } = await apiClient.delete<Dashboard>(`/api/v1/dashboards/${id}/share`)
    return data
  },

  getShared: async (shareToken: string) => {
    const { data } = await apiClient.get<Dashboard>(`/api/v1/dashboards/share/${shareToken}`)
    return data
  }
}

