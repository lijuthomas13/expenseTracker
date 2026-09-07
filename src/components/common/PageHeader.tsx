import * as React from 'react'
import { PageTitle } from './PageTitle'
import { cn } from '@/lib/utils'

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
  badge?: React.ReactNode
  actions?: React.ReactNode
  breadcrumb?: React.ReactNode
}

export function PageHeader({
  title,
  subtitle,
  badge,
  actions,
  breadcrumb,
  className,
  children,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 border-b border-border/80 pb-6 mb-6',
        className
      )}
      {...props}
    >
      {breadcrumb && <div className="mb-1">{breadcrumb}</div>}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3">
            <PageTitle title={title} />
            {badge && <div className="shrink-0">{badge}</div>}
          </div>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-2.5 sm:self-center">
            {actions}
          </div>
        )}
      </div>
      {children}
    </div>
  )
}
