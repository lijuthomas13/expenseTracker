import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { AuthContext } from './AuthContext'
import {
  signIn as authSignIn,
  signUp as authSignUp,
  signOut as authSignOut,
  getSession as authGetSession,
  onAuthStateChange as authOnAuthStateChange,
} from '@/services/auth.service'
import type {
  SignInRequest,
  SignUpRequest,
  SignUpResult,
  AuthContextType,
} from '@/types/auth.types'

export interface AuthProviderProps {
  children: ReactNode
}

/**
 * Authentication Provider:
 * 1. Resolves initial Supabase session on startup.
 * 2. Manages persistent session and user state.
 * 3. Keeps loading true until session initialization is complete to prevent layout flashes.
 * 4. Listens to Supabase onAuthStateChange events for real-time auth synchronization.
 * 5. Cleans up subscriptions on unmount.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    let isMounted = true

    // 1. Get initial session
    async function initializeAuth() {
      try {
        const initialSession = await authGetSession()
        if (isMounted) {
          setSession(initialSession)
          setUser(initialSession?.user ?? null)
        }
      } catch {
        if (isMounted) {
          setSession(null)
          setUser(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    void initializeAuth()

    // 2. Subscribe to auth changes
    const {
      data: { subscription },
    } = authOnAuthStateChange((_event, currentSession) => {
      if (isMounted) {
        setSession(currentSession)
        setUser(currentSession?.user ?? null)
        setLoading(false)
      }
    })

    // 3. Unsubscribe on unmount
    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (credentials: SignInRequest): Promise<void> => {
    const { user: signedInUser, session: signedInSession } =
      await authSignIn(credentials)
    setUser(signedInUser)
    setSession(signedInSession)
  }, [])

  const signUp = useCallback(
    async (data: SignUpRequest): Promise<SignUpResult> => {
      const result = await authSignUp(data)
      if (result.session && result.user) {
        setSession(result.session)
        setUser(result.user)
      }
      return result
    },
    []
  )

  const signOut = useCallback(async (): Promise<void> => {
    try {
      await authSignOut()
    } finally {
      setSession(null)
      setUser(null)
    }
  }, [])

  const contextValue: AuthContextType = useMemo(
    () => ({
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut,
    }),
    [user, session, loading, signIn, signUp, signOut]
  )

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}
