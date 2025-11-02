import { apiClient } from './axios'
import type { 
  ApiResponse, 
  Sale, 
  SalesFilters, 
  RevenueData, 
  ProductData, 
  ChannelData,
  MetricsSummary,
  AnalyticsFilters,
  PromotionsData,
  InventoryData,
  Store,
  Channel
} from '../types/api'

export const salesApi = {
  /**
   * Get list of sales with pagination and filters
   */
  async getSales(filters: SalesFilters = {}): Promise<ApiResponse<Sale[]>> {
    const params = new URLSearchParams()
    
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.offset) params.append('offset', filters.offset.toString())
    if (filters.start_date) params.append('start_date', filters.start_date)
    if (filters.end_date) params.append('end_date', filters.end_date)
    if (filters.store_id) params.append('store_id', filters.store_id.toString())
    if (filters.channel_id) params.append('channel_id', filters.channel_id.toString())
    
    const { data } = await apiClient.get<ApiResponse<Sale[]>>(
      `/api/v1/sales?${params.toString()}`
    )
    return data
  },
}

export const analyticsApi = {
  /**
   * Get revenue aggregated by time period
   */
  async getRevenue(
    filters: AnalyticsFilters = {},
    groupBy: 'day' | 'week' | 'month' = 'day'
  ): Promise<{ data: RevenueData[]; filters: any }> {
    const params = new URLSearchParams()
    params.append('group_by', groupBy)
    
    if (filters.start_date) params.append('start_date', filters.start_date)
    if (filters.end_date) params.append('end_date', filters.end_date)
    if (filters.store_id) params.append('store_id', filters.store_id.toString())
    if (filters.channel_id) params.append('channel_id', filters.channel_id.toString())
    
    const { data } = await apiClient.get(`/api/v1/analytics/revenue?${params.toString()}`)
    return data
  },

  /**
   * Get top products by quantity
   */
  async getTopProducts(
    filters: AnalyticsFilters = {},
    limit: number = 10
  ): Promise<{ data: ProductData[] }> {
    const params = new URLSearchParams()
    params.append('limit', limit.toString())
    
    if (filters.start_date) params.append('start_date', filters.start_date)
    if (filters.end_date) params.append('end_date', filters.end_date)
    if (filters.store_id) params.append('store_id', filters.store_id.toString())
    if (filters.channel_id) params.append('channel_id', filters.channel_id.toString())
    if (filters.day_of_week !== undefined) params.append('day_of_week', filters.day_of_week.toString())
    if (filters.hour_start !== undefined) params.append('hour_start', filters.hour_start.toString())
    if (filters.hour_end !== undefined) params.append('hour_end', filters.hour_end.toString())
    
    const { data } = await apiClient.get(`/api/v1/analytics/products?${params.toString()}`)
    return data
  },

  /**
   * Get channel performance
   */
  async getChannelPerformance(
    filters: AnalyticsFilters = {}
  ): Promise<{ data: ChannelData[] }> {
    const params = new URLSearchParams()
    
    if (filters.start_date) params.append('start_date', filters.start_date)
    if (filters.end_date) params.append('end_date', filters.end_date)
    if (filters.store_id) params.append('store_id', filters.store_id.toString())
    
    const { data } = await apiClient.get(`/api/v1/analytics/channels?${params.toString()}`)
    return data
  },

  /**
   * Get summary metrics
   */
  async getSummary(
    filters: AnalyticsFilters = {}
  ): Promise<MetricsSummary> {
    const params = new URLSearchParams()
    
    if (filters.start_date) params.append('start_date', filters.start_date)
    if (filters.end_date) params.append('end_date', filters.end_date)
    if (filters.store_id) params.append('store_id', filters.store_id.toString())
    if (filters.channel_id) params.append('channel_id', filters.channel_id.toString())
    
    const { data } = await apiClient.get(`/api/v1/analytics/summary?${params.toString()}`)
    return data
  },

  /**
   * Get promotions and discounts analysis
   */
  async getPromotionsAnalysis(filters: AnalyticsFilters = {}): Promise<PromotionsData> {
    const params = new URLSearchParams()
    
    if (filters.start_date) params.append('start_date', filters.start_date)
    if (filters.end_date) params.append('end_date', filters.end_date)
    if (filters.store_id) params.append('store_id', filters.store_id.toString())
    if (filters.channel_id) params.append('channel_id', filters.channel_id.toString())
    
    const { data } = await apiClient.get<PromotionsData>(`/api/v1/analytics/promotions?${params.toString()}`)
    return data
  },

  /**
   * Get inventory turnover analysis
   */
  async getInventoryTurnover(
    filters: AnalyticsFilters = {},
    limit: number = 20
  ): Promise<{ data: InventoryData[] }> {
    const params = new URLSearchParams()
    
    if (filters.start_date) params.append('start_date', filters.start_date)
    if (filters.end_date) params.append('end_date', filters.end_date)
    if (filters.store_id) params.append('store_id', filters.store_id.toString())
    if (filters.channel_id) params.append('channel_id', filters.channel_id.toString())
    if (limit) params.append('limit', limit.toString())
    
    const { data } = await apiClient.get<{ data: InventoryData[] }>(`/api/v1/analytics/inventory?${params.toString()}`)
    return data
  },

  /**
   * Generic GET method for analytics endpoints
   */
  async get(endpoint: string): Promise<any> {
    const { data } = await apiClient.get(`/api/v1${endpoint}`)
    return data
  },
}

export const storesApi = {
  /**
   * Get list of all stores
   */
  async getStores(): Promise<{ data: Store[] }> {
    const { data } = await apiClient.get<{ data: Store[] }>('/api/v1/stores')
    return data
  },

  /**
   * Get list of all channels
   */
  async getChannels(): Promise<{ data: Channel[] }> {
    const { data } = await apiClient.get<{ data: Channel[] }>('/api/v1/channels')
    return data
  },
}

