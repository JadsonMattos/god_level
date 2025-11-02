import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authApi } from '../authApi'
import { apiClient } from '../axios'

// Mock axios
vi.mock('../axios', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
}

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
})

describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  describe('login', () => {
    it('should login successfully and store token', async () => {
      const mockResponse = {
        access_token: 'token123',
        token_type: 'bearer',
        username: 'admin',
        user_id: 1,
      }

      vi.mocked(apiClient.post).mockResolvedValue({ data: mockResponse })

      const result = await authApi.login({
        username: 'admin',
        password: 'admin123',
      })

      expect(result).toEqual(mockResponse)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'token123')
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'user',
        JSON.stringify({ username: 'admin', user_id: 1 })
      )
    })

    it('should handle login errors', async () => {
      vi.mocked(apiClient.post).mockRejectedValue(new Error('Invalid credentials'))

      await expect(
        authApi.login({ username: 'admin', password: 'wrong' })
      ).rejects.toThrow()
    })
  })

  describe('getCurrentUser', () => {
    it('should get current user', async () => {
      const mockUser = { username: 'admin', user_id: 1 }
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockUser })

      const result = await authApi.getCurrentUser()

      expect(result).toEqual(mockUser)
      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/auth/me')
    })
  })

  describe('logout', () => {
    it('should clear localStorage', () => {
      authApi.logout()

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user')
    })
  })

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      localStorageMock.getItem.mockReturnValue('token123')

      expect(authApi.isAuthenticated()).toBe(true)
    })

    it('should return false when token does not exist', () => {
      localStorageMock.getItem.mockReturnValue(null)

      expect(authApi.isAuthenticated()).toBe(false)
    })
  })

  describe('getToken', () => {
    it('should return token from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('token123')

      expect(authApi.getToken()).toBe('token123')
    })
  })

  describe('getUser', () => {
    it('should return user from localStorage', () => {
      const user = { username: 'admin', user_id: 1 }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(user))

      expect(authApi.getUser()).toEqual(user)
    })

    it('should return null when user does not exist', () => {
      localStorageMock.getItem.mockReturnValue(null)

      expect(authApi.getUser()).toBeNull()
    })

    it('should handle invalid JSON', () => {
      localStorageMock.getItem.mockReturnValue('invalid json')

      expect(authApi.getUser()).toBeNull()
    })
  })
})


