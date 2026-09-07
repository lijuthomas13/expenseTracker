import type { ReactNode } from 'react'
import { ThemeProvider } from './ThemeProvider'
import { QueryProvider } from './QueryProvider'
import { SupabaseProvider } from './SupabaseProvider'
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
 * 4. ProjectProvider (Dynamic projects and categories data layer)
 * 5. ToastProvider (React Toastify alerts)
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider defaultTheme="light">
      <QueryProvider>
        <SupabaseProvider>
          <ProjectProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </ProjectProvider>
        </SupabaseProvider>
      </QueryProvider>
    </ThemeProvider>
  )
}
