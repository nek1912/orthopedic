import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { apiRequest, setTokenGetter } from '@shared/api/client'
import type { AuthResponse, LoginRequest, RegisterRequest, PatientResponse } from '@shared/types'

interface AuthContextValue {
  patient: PatientResponse | null
  isAuthenticated: boolean
  loading: boolean
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => void
  refreshAuth: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function getStoredToken(): string | null {
  return localStorage.getItem('access_token')
}

function getStoredRefreshToken(): string | null {
  return localStorage.getItem('refresh_token')
}

function setStoredTokens(access: string, refresh: string) {
  localStorage.setItem('access_token', access)
  localStorage.setItem('refresh_token', refresh)
}

function clearStoredTokens() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('patient')
}

function getStoredPatient(): PatientResponse | null {
  try {
    const raw = localStorage.getItem('patient')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [patient, setPatient] = useState<PatientResponse | null>(getStoredPatient)
  const [loading, setLoading] = useState(false)

  setTokenGetter(getStoredToken)

  useEffect(() => {
    const token = getStoredToken()
    if (token && isTokenExpired(token)) {
      const refresh = getStoredRefreshToken()
      if (!refresh) {
        clearStoredTokens()
        setPatient(null)
        return
      }
      fetch('/api/v1/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refresh }),
        credentials: 'include',
      })
        .then((res) => res.ok ? res.json() : Promise.reject())
        .then((data: AuthResponse) => {
          setStoredTokens(data.access_token, data.refresh_token)
          localStorage.setItem('patient', JSON.stringify(data.patient))
          setPatient(data.patient)
        })
        .catch(() => {
          clearStoredTokens()
          setPatient(null)
        })
    }
  }, [])

  const refreshAuth = useCallback(async (): Promise<boolean> => {
    const refresh = getStoredRefreshToken()
    if (!refresh) return false
    try {
      const res = await fetch('/api/v1/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refresh }),
        credentials: 'include',
      })
      if (!res.ok) return false
      const data: AuthResponse = await res.json()
      setStoredTokens(data.access_token, data.refresh_token)
      localStorage.setItem('patient', JSON.stringify(data.patient))
      setPatient(data.patient)
      return true
    } catch {
      return false
    }
  }, [])

  const login = useCallback(async (data: LoginRequest) => {
    setLoading(true)
    try {
      const res = await apiRequest<AuthResponse>('/api/v1/auth/login', {
        method: 'POST',
        body: data,
        auth: false,
      })
      setStoredTokens(res.access_token, res.refresh_token)
      localStorage.setItem('patient', JSON.stringify(res.patient))
      setPatient(res.patient)
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (data: RegisterRequest) => {
    setLoading(true)
    try {
      const res = await apiRequest<AuthResponse>('/api/v1/auth/register', {
        method: 'POST',
        body: data,
        auth: false,
      })
      setStoredTokens(res.access_token, res.refresh_token)
      localStorage.setItem('patient', JSON.stringify(res.patient))
      setPatient(res.patient)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    clearStoredTokens()
    setPatient(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        patient,
        isAuthenticated: !!patient,
        loading,
        login,
        register,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
