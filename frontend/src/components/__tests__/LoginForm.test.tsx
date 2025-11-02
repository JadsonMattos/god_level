import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LoginForm } from '../LoginForm'

// Mock authApi
vi.mock('../../services/authApi', () => ({
  authApi: {
    login: vi.fn(),
  },
}))

describe('LoginForm', () => {
  const mockOnLoginSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders login form', () => {
    render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />)

    expect(screen.getByText(/Analytics para Restaurantes/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Usuário/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Senha/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Entrar/i })).toBeInTheDocument()
  })

  it('shows test user credentials', () => {
    render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />)

    // "admin" and "maria" appear multiple times, use getAllByText
    const adminTexts = screen.getAllByText(/admin/i)
    expect(adminTexts.length).toBeGreaterThan(0)
    
    const mariaTexts = screen.getAllByText(/maria/i)
    expect(mariaTexts.length).toBeGreaterThan(0)
  })

  it('handles form submission', async () => {
    const { authApi } = await import('../../services/authApi')
    vi.mocked(authApi.login).mockResolvedValue({
      access_token: 'token123',
      token_type: 'bearer',
      username: 'admin',
      user_id: 1,
    })

    render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />)

    const usernameInput = screen.getByLabelText(/Usuário/i)
    const passwordInput = screen.getByLabelText(/Senha/i)
    const submitButton = screen.getByRole('button', { name: /Entrar/i })

    fireEvent.change(usernameInput, { target: { value: 'admin' } })
    fireEvent.change(passwordInput, { target: { value: 'admin123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith({
        username: 'admin',
        password: 'admin123',
      })
    })

    expect(mockOnLoginSuccess).toHaveBeenCalled()
  })

  it('handles login errors', async () => {
    const { authApi } = await import('../../services/authApi')
    vi.mocked(authApi.login).mockRejectedValue({
      response: { data: { detail: 'Credenciais inválidas' } },
    })

    render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />)

    const usernameInput = screen.getByLabelText(/Usuário/i)
    const passwordInput = screen.getByLabelText(/Senha/i)
    const submitButton = screen.getByRole('button', { name: /Entrar/i })

    fireEvent.change(usernameInput, { target: { value: 'admin' } })
    fireEvent.change(passwordInput, { target: { value: 'wrong' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/Credenciais inválidas/i)).toBeInTheDocument()
    })

    expect(mockOnLoginSuccess).not.toHaveBeenCalled()
  })

  it('shows loading state during login', async () => {
    const { authApi } = await import('../../services/authApi')
    let resolveLogin: any
    const loginPromise = new Promise((resolve) => {
      resolveLogin = resolve
    })
    vi.mocked(authApi.login).mockReturnValue(loginPromise as any)

    render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />)

    const submitButton = screen.getByRole('button', { name: /Entrar/i })
    fireEvent.change(screen.getByLabelText(/Usuário/i), { target: { value: 'admin' } })
    fireEvent.change(screen.getByLabelText(/Senha/i), { target: { value: 'admin123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/Entrando.../i)).toBeInTheDocument()
    })

    resolveLogin({
      access_token: 'token',
      token_type: 'bearer',
      username: 'admin',
      user_id: 1,
    })

    await waitFor(() => {
      expect(screen.queryByText(/Entrando.../i)).not.toBeInTheDocument()
    })
  })

  it('requires username and password', () => {
    render(<LoginForm onLoginSuccess={mockOnLoginSuccess} />)

    const submitButton = screen.getByRole('button', { name: /Entrar/i })
    fireEvent.click(submitButton)

    const usernameInput = screen.getByLabelText(/Usuário/i)
    const passwordInput = screen.getByLabelText(/Senha/i)

    expect(usernameInput).toBeRequired()
    expect(passwordInput).toBeRequired()
  })
})


