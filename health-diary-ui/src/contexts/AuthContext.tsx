/**
 * Authentication Context
 * Manages global authentication state: user, tokens, and login/register/logout actions
 * Additionally supports session restoration from localStorage on mount
 */

import React, { createContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import * as authService from '../services/authService'
import type { User, AuthTokens } from '../services/authService'

export type AuthContextType = {
  user: User | null
  tokens: AuthTokens | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null

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
    register,
    login,
    logout,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
