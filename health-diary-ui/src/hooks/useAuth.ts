/**
 * useAuth Hook
 * Provides convenient access to AuthContext in components
 */

import { useContext } from 'react'
import type { AuthContextType } from '../contexts/AuthContext'
import { AuthContext } from '../contexts/AuthContext'

/**
 * Hook to access authentication context
 * @throws Error if used outside AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
