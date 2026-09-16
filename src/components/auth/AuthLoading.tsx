import { Loader2, Home } from 'lucide-react'

export interface AuthLoadingProps {
  message?: string
}

/**
 * Clean full-page loading state displayed while the initial Supabase session is resolving.
 * Matches existing typography, color tokens, and theme styles to eliminate UI flash.
 */
export function AuthLoading({ message = 'Loading...' }: AuthLoadingProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-screen w-full flex-col items-center justify-center bg-background text-foreground transition-colors p-4"
    >
      <div className="flex flex-col items-center gap-4 text-center max-w-xs animate-in fade-in duration-300">
        {/* Brand Icon */}
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-level-1">
          <Home className="h-6 w-6" />
        </div>

        {/* Brand Name */}
        <div className="space-y-0.5">
          <h1 className="font-display text-lg font-bold tracking-tight text-foreground">
            HomeBuild
          </h1>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
            Expense Tracker
          </p>
        </div>

        {/* Spinner & Message */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span>{message}</span>
        </div>
      </div>
    </div>
  )
}
