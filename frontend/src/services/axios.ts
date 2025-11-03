import axios from 'axios'

// Configure API URL based on environment
const API_URL = import.meta.env.VITE_API_URL || 
                (import.meta.env.MODE === 'production' 
                  ? 'https://godlevel-backend.onrender.com'  // Default Render URL (substitua pela sua)
                  : 'http://localhost:8001')

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds for Render cold starts
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('token')
    }
    
    // Don't log 503 errors for endpoints that can legitimately return 503 when resource doesn't exist
    // (like /dashboards/default when no default dashboard is set, or /dashboards when table doesn't exist)
    const url = error.config?.url || ''
    if (error.response?.status === 503 && (
      url.includes('/dashboards/default') || 
      url.includes('/dashboards') && !url.includes('/dashboards/')
    )) {
      // Silently handle - this is expected when no dashboards exist or table doesn't exist
      // Return a custom error that can be caught and ignored
      const silentError: any = new Error('No dashboards available')
      silentError.isExpected = true
      silentError.response = error.response
      return Promise.reject(silentError)
    }
    
    return Promise.reject(error)
  }
)

