import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { apiRequest } from '@shared/api/client'

interface AdminAuthContextValue {
  isAuthenticated: boolean
  loading: boolean
  login: (password: string, rememberMe: boolean) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<boolean>
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null)

function getStoredAdminToken(): string | null {
  return localStorage.getItem('admin_token')
}

function setStoredAdminToken(token: string) {
  localStorage.setItem('admin_token', token)
}

function clearStoredAdminToken() {
  localStorage.removeItem('admin_token')
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getStoredAdminToken())
  const [loading, setLoading] = useState(false)

  const login = useCallback(async (password: string, rememberMe: boolean) => {
    setLoading(true)
    try {
      const res = await apiRequest<{ message: string; access_token: string }>('/api/v1/admin/login', {
        method: 'POST',
        body: { password, remember_me: rememberMe },
        auth: false,
      })
      setStoredAdminToken(res.access_token)
      setIsAuthenticated(true)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiRequest('/api/v1/admin/logout', { method: 'POST' })
    } catch {
      // ignore
    }
    clearStoredAdminToken()
    setIsAuthenticated(false)
  }, [])

  const checkAuth = useCallback(async (): Promise<boolean> => {
    const token = getStoredAdminToken()
    if (!token) {
      setIsAuthenticated(false)
      return false
    }
    try {
      await apiRequest('/api/v1/admin/settings')
      setIsAuthenticated(true)
      return true
    } catch {
      clearStoredAdminToken()
      setIsAuthenticated(false)
      return false
    }
  }, [])

  return (
    <AdminAuthContext.Provider
      value={{ isAuthenticated, loading, login, logout, checkAuth }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider')
  return ctx
}
