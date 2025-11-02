import { apiClient } from './axios'

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  username: string
  user_id: number
}

export interface UserInfo {
  username: string
  user_id: number
}

export const authApi = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>('/api/v1/auth/login', credentials)
    // Store token in localStorage
    localStorage.setItem('token', data.access_token)
    localStorage.setItem('user', JSON.stringify({ username: data.username, user_id: data.user_id }))
    return data
  },

  async getCurrentUser(): Promise<UserInfo> {
    const { data } = await apiClient.get<UserInfo>('/api/v1/auth/me')
    return data
  },

  logout(): void {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token')
  },

  getToken(): string | null {
    return localStorage.getItem('token')
  },

  getUser(): { username: string; user_id: number } | null {
    const userStr = localStorage.getItem('user')
    if (!userStr) return null
    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  }
}


