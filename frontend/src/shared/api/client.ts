const BASE_URL = ''

export class ApiError extends Error {
  status: number
  detail: string

  constructor(status: number, detail: string) {
    super(detail)
    this.status = status
    this.detail = detail
  }
}

interface RequestOptions {
  method?: string
  body?: unknown
  headers?: Record<string, string>
  auth?: boolean
}

let getToken: () => string | null = () => localStorage.getItem('access_token')

export function setTokenGetter(fn: () => string | null) {
  getToken = fn
}

function getAuthToken(path?: string): string | null {
  if (path?.startsWith('/api/v1/admin')) {
    return null
  }
  return getToken()
}

async function tryRefreshToken(): Promise<boolean> {
  const refresh = localStorage.getItem('refresh_token')
  if (!refresh) return false
  try {
    const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refresh }),
      credentials: 'include',
    })
    if (!res.ok) return false
    const data = await res.json()
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
    if (data.patient) localStorage.setItem('patient', JSON.stringify(data.patient))
    return true
  } catch {
    return false
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, auth = true } = options

  const reqHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  }

  if (auth && !reqHeaders['Authorization']) {
    const token = getAuthToken(path)
    if (token) {
      reqHeaders['Authorization'] = `Bearer ${token}`
    }
  }

  let response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: reqHeaders,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  })

  if (response.status === 401 && auth) {
    const refreshed = await tryRefreshToken()
    if (refreshed) {
      const newToken = getAuthToken()
      if (newToken) reqHeaders['Authorization'] = `Bearer ${newToken}`
      response = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: reqHeaders,
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include',
      })
    } else {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('patient')
    }
  }

  if (!response.ok) {
    let detail = 'An error occurred'
    try {
      const err = await response.json()
      detail = err.detail || detail
    } catch {
      try {
        detail = await response.text()
      } catch {
        // keep default
      }
    }
    throw new ApiError(response.status, detail)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}
