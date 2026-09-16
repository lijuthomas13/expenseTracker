import { useContext } from 'react'
import { AuthContext } from '@/providers/AuthContext'
import type { AuthContextType } from '@/types/auth.types'

/**
 * Hook to access the current authentication state and actions.
 * Exposes: user, session, loading, signIn, signUp, signOut.
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
