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

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getStoredAdminToken())

  const login = useCallback(async (password: string, rememberMe: boolean) => {
    const res = await apiRequest<{ message: string; access_token: string }>('/api/v1/admin/login', {
      method: 'POST',
      body: { password, remember_me: rememberMe },
      auth: false,
    })
    localStorage.setItem('admin_token', res.access_token)
    setIsAuthenticated(true)
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiRequest('/api/v1/admin/logout', {
        method: 'POST',
        auth: true,
        headers: { 'Authorization': `Bearer ${getStoredAdminToken()}` },
      })
    } catch {
      // ignore
    }
    localStorage.removeItem('admin_token')
    setIsAuthenticated(false)
  }, [])

  const checkAuth = useCallback(async (): Promise<boolean> => {
    const token = getStoredAdminToken()
    if (!token) {
      setIsAuthenticated(false)
      return false
    }
    try {
      await apiRequest('/api/v1/admin/settings', {
        auth: true,
        headers: { 'Authorization': `Bearer ${token}` },
      })
      setIsAuthenticated(true)
      return true
    } catch {
      localStorage.removeItem('admin_token')
      setIsAuthenticated(false)
      return false
    }
  }, [])

  return (
    <AdminAuthContext.Provider
      value={{ isAuthenticated, loading: false, login, logout, checkAuth }}
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
