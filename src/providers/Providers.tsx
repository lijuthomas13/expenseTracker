import type { ReactNode } from 'react'
import { ThemeProvider } from './ThemeProvider'
import { QueryProvider } from './QueryProvider'
import { SupabaseProvider } from './SupabaseProvider'
import { AuthProvider } from './AuthProvider'
import { ToastProvider } from './ToastProvider'
import { ProjectProvider } from './ProjectProvider'

export interface ProvidersProps {
  children: ReactNode
}

/**
 * Composed application root providers:
 * 1. ThemeProvider (Light / Dark / System mode)
 * 2. QueryProvider (TanStack React Query client)
 * 3. SupabaseProvider (Supabase client context)
 * 4. AuthProvider (Supabase authentication, persistent session, and state)
 * 5. ProjectProvider (Dynamic projects and categories data layer)
 * 6. ToastProvider (React Toastify alerts)
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider defaultTheme="light">
      <QueryProvider>
        <SupabaseProvider>
          <AuthProvider>
            <ProjectProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </ProjectProvider>
          </AuthProvider>
        </SupabaseProvider>
      </QueryProvider>
    </ThemeProvider>
  )
}
