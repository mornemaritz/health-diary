/**
 * Authentication service
 * Handles registration, login, logout, and token refresh
 */

import { apiRequest, setAuthTokens, clearAuthTokens } from './apiClient'
import type { components } from '../types/api'

export type User = {
  id: string
  email: string
  username?: string
  name?: string
}

export type AuthTokens = {
  accessToken: string
  refreshToken: string
  accessTokenExpiresAt: string
  refreshTokenExpiresAt: string
}

/**
 * Register a new user with an invite token
 */
export async function register(
  email: string,
  username: string,
  name: string,
  password: string,
  inviteToken: string
): Promise<{ user: User } | { error: string }> {
  const result = await apiRequest<components['schemas']['RegisterResponse']>(
    '/api/auth/register',
    {
      method: 'POST',
      body: {
        inviteToken,
        email,
        username,
        name,
        password,
      },
      requiresAuth: false,
    }
  )

  if (!result.ok || !result.data) {
    return { error: result.error || 'Registration failed' }
  }

  return {
    user: {
      id: result.data.id || '',
      email: result.data.email || email,
    },
  }
}

/**
 * Login with email and password
 */
export async function login(
  email: string,
  password: string
): Promise<{ tokens: AuthTokens; user: User } | { error: string }> {
  const result = await apiRequest<components['schemas']['LoginResponse']>(
    '/api/auth/login',
    {
      method: 'POST',
      body: { email, password },
      requiresAuth: false,
    }
  )

  if (!result.ok || !result.data) {
    return { error: result.error || 'Login failed' }
  }

  const {
    accessToken,
    refreshToken,
    accessTokenExpiresAt,
    refreshTokenExpiresAt,
  } = result.data

  if (!accessToken || !refreshToken) {
    return { error: 'Invalid token response' }
  }

  const tokens: AuthTokens = {
    accessToken,
    refreshToken,
    accessTokenExpiresAt: accessTokenExpiresAt || '',
    refreshTokenExpiresAt: refreshTokenExpiresAt || '',
  }

  // Store tokens
  setAuthTokens(
    accessToken,
    refreshToken,
    accessTokenExpiresAt,
    refreshTokenExpiresAt
  )

  return {
    tokens,
    user: {
      id: '',
      email,
    },
  }
}

/**
 * Logout and clear tokens
 */
export function logout(): void {
  clearAuthTokens()
}

/**
 * Validate an invite token
 */
export async function validateInviteToken(token: string): Promise<boolean> {
  const result = await apiRequest<{ valid: boolean }>(
    `/api/auth/invite/validate?token=${encodeURIComponent(token)}`,
    {
      method: 'GET',
      requiresAuth: false,
    }
  )

  return result.ok
}

/**
 * Get stored tokens from localStorage
 */
export function getStoredTokens(): AuthTokens | null {
  const accessToken = localStorage.getItem('accessToken')
  const refreshToken = localStorage.getItem('refreshToken')
  const accessTokenExpiresAt = localStorage.getItem('accessTokenExpiresAt') || ''
  const refreshTokenExpiresAt = localStorage.getItem('refreshTokenExpiresAt') || ''

  if (!accessToken || !refreshToken) {
    return null
  }

  return {
    accessToken,
    refreshToken,
    accessTokenExpiresAt,
    refreshTokenExpiresAt,
  }
}

/**
 * Check if access token is expired
 */
export function isTokenExpired(token: AuthTokens): boolean {
  if (!token.accessTokenExpiresAt) {
    return false
  }

  const expiresAt = new Date(token.accessTokenExpiresAt)
  return expiresAt <= new Date()
}
