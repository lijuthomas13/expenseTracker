import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { AuthLoading } from './AuthLoading'
import { ROUTES } from '@/constants/routes'

export interface ProtectedRouteProps {
  children?: ReactNode
}

/**
 * Guard component protecting authenticated application routes:
 * 1. If auth state is still resolving: renders AuthLoading screen.
 * 2. If user is unauthenticated: redirects to /login and saves current location in state.from.
 * 3. If user is authenticated: renders child routes (or Outlet).
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <AuthLoading />
  }

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  return children ? <>{children}</> : <Outlet />
}
