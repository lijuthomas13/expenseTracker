import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { AuthLoading } from './AuthLoading'
import { ROUTES } from '@/constants/routes'

export interface PublicOnlyRouteProps {
  children?: ReactNode
}

interface LocationStateWithFrom {
  from?: {
    pathname: string
    search?: string
    hash?: string
  }
}

/**
 * Route wrapper for public auth pages (/login, /signup).
 * If the user is already authenticated:
 * - Redirects to intended destination (if preserved in location.state.from) or /dashboard.
 * If unauthenticated:
 * - Renders the public page (children or Outlet).
 */
export function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <AuthLoading />
  }

  if (user) {
    const state = location.state as LocationStateWithFrom | null
    const fromPath = state?.from
      ? `${state.from.pathname}${state.from.search || ''}${state.from.hash || ''}`
      : ROUTES.DASHBOARD

    return <Navigate to={fromPath} replace />
  }

  return children ? <>{children}</> : <Outlet />
}
