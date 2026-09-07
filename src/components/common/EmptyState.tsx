import * as React from 'react'
import { FolderOpen, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
}

export function EmptyState({
  icon: Icon = FolderOpen,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
  children,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-card/50 p-8 text-center sm:p-12 animate-in fade-in-50',
        className
      )}
      {...props}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/80 text-muted-foreground border border-border shadow-level-1 mb-4">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="font-display text-base font-semibold text-foreground tracking-tight">
        {title}
      </h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {(actionLabel || secondaryActionLabel || children) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {actionLabel && onAction && (
            <Button variant="primary" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button variant="secondary" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
          {children}
        </div>
      )}
    </div>
  )
}
