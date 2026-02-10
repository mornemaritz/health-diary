/**
 * API Client wrapper with JWT token injection and 401 interception
 * Handles authentication token management and automatic refresh on 401 responses
 */

import type { components } from '../types/api'

export type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: unknown
  requiresAuth?: boolean
}

export type ApiResponse<T> = {
  ok: boolean
  status: number
  data?: T
  error?: string
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

/**
 * Get stored access token from localStorage
 */
function getAccessToken(): string | null {
  return localStorage.getItem('accessToken')
}

/**
 * Get stored refresh token from localStorage
 */
function getRefreshToken(): string | null {
  return localStorage.getItem('refreshToken')
}

/**
 * Store tokens in localStorage
 */
function storeTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem('accessToken', accessToken)
  localStorage.setItem('refreshToken', refreshToken)
}

/**
 * Clear tokens from localStorage
 */
function clearTokens(): void {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('accessTokenExpiresAt')
  localStorage.removeItem('refreshTokenExpiresAt')
}

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    clearTokens()
    return false
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/token/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      clearTokens()
      return false
    }

    const data = (await response.json()) as components['schemas']['RefreshTokenResponse']
    if (data.accessToken && data.expiresAt) {
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('accessTokenExpiresAt', data.expiresAt)
      return true
    }

    clearTokens()
    return false
  } catch (error) {
    console.error('Token refresh failed:', error)
    clearTokens()
    return false
  }
}

/**
 * Make an API request with JWT token injection and automatic refresh on 401
 */
export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', headers = {}, body, requiresAuth = true } = options

  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  }

  // Inject access token if authentication is required
  if (requiresAuth) {
    const token = getAccessToken()
    if (!token) {
      return {
        ok: false,
        status: 401,
        error: 'No authentication token available',
      }
    }
    finalHeaders['Authorization'] = `Bearer ${token}`
  }

  const url = `${API_BASE_URL}${path}`
  let response = await fetch(url, {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined,
  })

  // If 401, attempt to refresh token and retry
  if (response.status === 401 && requiresAuth) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      const newToken = getAccessToken()
      if (newToken) {
        finalHeaders['Authorization'] = `Bearer ${newToken}`
        response = await fetch(url, {
          method,
          headers: finalHeaders,
          body: body ? JSON.stringify(body) : undefined,
        })
      }
    }
  }

  // If still 401 after refresh, clear tokens and return error
  if (response.status === 401) {
    clearTokens()
    return {
      ok: false,
      status: 401,
      error: 'Authentication failed',
    }
  }

  try {
    const data = await response.json()
    return {
      ok: response.ok,
      status: response.status,
      data: response.ok ? data : undefined,
      error: !response.ok ? data?.error || 'Request failed' : undefined,
    }
  } catch {
    return {
      ok: response.ok,
      status: response.status,
      error: `HTTP ${response.status}`,
    }
  }
}

/**
 * Public API for storing tokens (called by authService after login/register)
 */
export function setAuthTokens(
  accessToken: string,
  refreshToken: string,
  accessTokenExpiresAt?: string,
  refreshTokenExpiresAt?: string
): void {
  storeTokens(accessToken, refreshToken)
  if (accessTokenExpiresAt) {
    localStorage.setItem('accessTokenExpiresAt', accessTokenExpiresAt)
  }
  if (refreshTokenExpiresAt) {
    localStorage.setItem('refreshTokenExpiresAt', refreshTokenExpiresAt)
  }
}

/**
 * Public API for clearing tokens (called by authService on logout)
 */
export function clearAuthTokens(): void {
  clearTokens()
}
