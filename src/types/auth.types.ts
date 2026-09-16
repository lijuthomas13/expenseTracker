import type { User, Session, AuthError } from '@supabase/supabase-js'

export interface SignInRequest {
  email: string
  password: string
}

export interface SignUpRequest {
  fullName: string
  email: string
  password: string
}

export interface SignUpResult {
  user: User | null
  session: Session | null
}

export interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (credentials: SignInRequest) => Promise<void>
  signUp: (data: SignUpRequest) => Promise<SignUpResult>
  signOut: () => Promise<void>
}

export type { User, Session, AuthError }
