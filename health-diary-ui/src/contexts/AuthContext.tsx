/**
 * Authentication Context
 * Manages global authentication state: user, tokens, and login/register/logout actions
 * Additionally supports session restoration from localStorage on mount
 * Includes token expiration checking and automatic refresh warnings
 */

import React, { createContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import * as authService from '../services/authService'
import type { User, AuthTokens } from '../services/authService'

// Token expiration warning threshold (5 minutes)
const TOKEN_EXPIRATION_WARNING_MS = 5 * 60 * 1000

export type AuthContextType = {
  user: User | null
  tokens: AuthTokens | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  tokenExpiresIn: number | null // Remaining time in ms until token expires

  // Auth actions
  register: (
    email: string,
    username: string,
    name: string,
    password: string,
    inviteToken: string
  ) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  clearError: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export type AuthProviderProps = {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [tokens, setTokens] = useState<AuthTokens | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tokenExpiresIn, setTokenExpiresIn] = useState<number | null>(null)

  /**
   * T024: Calculate time remaining until token expiration
   */
  const calculateTokenExpiresIn = useCallback((token: AuthTokens | null): number | null => {
    if (!token || !token.accessTokenExpiresAt) {
      return null
    }

    const expiresAt = new Date(token.accessTokenExpiresAt).getTime()
    const now = new Date().getTime()
    const expiresIn = expiresAt - now

    return expiresIn > 0 ? expiresIn : 0
  }, [])

  /**
   * T024: Monitor token expiration and show warnings
   */
  useEffect(() => {
    if (!tokens) {
      setTokenExpiresIn(null)
      return
    }

    const expiresIn = calculateTokenExpiresIn(tokens)
    setTokenExpiresIn(expiresIn)

    if (expiresIn === null || expiresIn === 0) {
      return
    }

    // Set up interval to update expiration time every minute
    const interval = setInterval(() => {
      const newExpiresIn = calculateTokenExpiresIn(tokens)
      setTokenExpiresIn(newExpiresIn)

      // Check if token is expiring soon (5 minutes or less)
      if (newExpiresIn !== null && newExpiresIn > 0 && newExpiresIn <= TOKEN_EXPIRATION_WARNING_MS) {
        console.warn(
          `Your session will expire in ${Math.round(newExpiresIn / 1000 / 60)} minutes. Consider saving your work.`
        )
      }

      // Auto-logout if token has expired
      if (newExpiresIn === 0) {
        authService.logout()
        setTokens(null)
        setUser(null)
      }
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [tokens, calculateTokenExpiresIn])

  // Restore session from localStorage on component mount
  useEffect(() => {
    const storedTokens = authService.getStoredTokens()
    if (storedTokens) {
      // Check if token is not expired
      if (!authService.isTokenExpired(storedTokens)) {
        setTokens(storedTokens)
        // Set a minimal user object - full user info will be loaded on next API call if needed
        setUser({
          id: localStorage.getItem('userId') || 'unknown',
          email: localStorage.getItem('userEmail') || '',
        })
      } else {
        // Token is expired, clear it
        authService.logout()
      }
    }
    setIsLoading(false)
  }, [])

  const register = useCallback(
    async (
      email: string,
      username: string,
      name: string,
      password: string,
      inviteToken: string
    ) => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await authService.register(
          email,
          username,
          name,
          password,
          inviteToken
        )

        if ('error' in result) {
          setError(result.error)
          throw new Error(result.error)
        }

        setUser(result.user)
        // Registration doesn't return tokens, user will need to login
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await authService.login(email, password)

      if ('error' in result) {
        setError(result.error)
        throw new Error(result.error)
      }

      setTokens(result.tokens)
      setUser(result.user)
      // Store user info for session restoration
      localStorage.setItem('userId', result.user.id)
      localStorage.setItem('userEmail', result.user.email)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    authService.logout()
    setUser(null)
    setTokens(null)
    setError(null)
    setTokenExpiresIn(null)
    localStorage.removeItem('userId')
    localStorage.removeItem('userEmail')
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const value: AuthContextType = {
    user,
    tokens,
    isLoading,
    isAuthenticated: !!user && !!tokens,
    error,
    tokenExpiresIn,
    register,
    login,
    logout,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
