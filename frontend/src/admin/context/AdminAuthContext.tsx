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

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)

  const login = useCallback(async (password: string, rememberMe: boolean) => {
    setLoading(true)
    try {
      await apiRequest<{ message: string }>('/api/v1/admin/login', {
        method: 'POST',
        body: { password, remember_me: rememberMe },
        auth: false,
      })
      setIsAuthenticated(true)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiRequest('/api/v1/admin/logout', { method: 'POST', auth: false })
    } catch {
      // ignore
    }
    setIsAuthenticated(false)
  }, [])

  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      await apiRequest('/api/v1/admin/settings', { auth: false })
      setIsAuthenticated(true)
      return true
    } catch {
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
