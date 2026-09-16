import { supabase } from '@/lib/supabase/client'
import type {
  AuthChangeEvent,
  Session,
  Subscription,
  User,
} from '@supabase/supabase-js'
import type { SignInRequest, SignUpRequest, SignUpResult } from '@/types/auth.types'

/**
 * Transforms raw Supabase Auth errors into user-friendly messages.
 * Prevents exposing technical stack traces or raw API status codes.
 */
export function formatAuthError(error: unknown): string {
  if (!error) return 'An unexpected error occurred. Please try again.'

  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'object' && error !== null && 'message' in error
        ? String((error as { message: unknown }).message)
        : String(error)

  const lower = message.toLowerCase()

  if (
    lower.includes('invalid login credentials') ||
    lower.includes('invalid credentials') ||
    lower.includes('invalid email or password')
  ) {
    return 'Invalid email or password.'
  }

  if (
    lower.includes('email not confirmed') ||
    lower.includes('not verified')
  ) {
    return 'Please confirm your email before signing in.'
  }

  if (
    lower.includes('user already registered') ||
    lower.includes('already exists') ||
    lower.includes('email already in use')
  ) {
    return 'An account with this email already exists.'
  }

  if (
    lower.includes('password should be at least') ||
    lower.includes('weak password')
  ) {
    return 'Password should be at least 6 characters.'
  }

  if (
    lower.includes('invalid email') ||
    lower.includes('valid email')
  ) {
    return 'Please enter a valid email address.'
  }

  if (
    lower.includes('failed to fetch') ||
    lower.includes('network') ||
    lower.includes('connection refused')
  ) {
    return 'Network error. Please check your internet connection and try again.'
  }

  if (lower.includes('rate limit') || lower.includes('too many requests')) {
    return 'Too many attempts. Please wait a few moments and try again.'
  }

  return 'Unable to complete request. Please try again.'
}

/**
 * Signs in a user with email and password via Supabase Auth.
 * Throws a friendly error message on failure.
 */
export async function signIn(
  request: SignInRequest
): Promise<{ user: User; session: Session }> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: request.email.trim(),
    password: request.password,
  })

  if (error) {
    throw new Error(formatAuthError(error))
  }

  if (!data.user || !data.session) {
    throw new Error('Unable to sign in. Please try again.')
  }

  return {
    user: data.user,
    session: data.session,
  }
}

/**
 * Signs up a new user with email, password, and full name.
 * Passes full_name in user metadata: options.data.full_name
 * for the database profile trigger.
 * Throws a friendly error message on failure.
 */
export async function signUp(
  request: SignUpRequest
): Promise<SignUpResult> {
  const trimmedFullName = request.fullName.trim()
  const trimmedEmail = request.email.trim()

  const { data, error } = await supabase.auth.signUp({
    email: trimmedEmail,
    password: request.password,
    options: {
      data: {
        full_name: trimmedFullName,
      },
    },
  })

  if (error) {
    throw new Error(formatAuthError(error))
  }

  return {
    user: data.user,
    session: data.session,
  }
}

/**
 * Signs out the currently authenticated user from Supabase Auth.
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) {
    throw new Error(formatAuthError(error))
  }
}

/**
 * Retrieves the current session from local persistence via Supabase.
 */
export async function getSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession()
  if (error) {
    return null
  }
  return data.session
}

/**
 * Retrieves the currently authenticated Supabase user from the server/session.
 */
export async function getCurrentUser(): Promise<User | null> {
  const { data, error } = await supabase.auth.getUser()
  if (error) {
    return null
  }
  return data.user
}

/**
 * Subscribes to Supabase authentication state change events.
 */
export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void
): { data: { subscription: Subscription } } {
  return supabase.auth.onAuthStateChange(callback)
}
