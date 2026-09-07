import * as React from 'react'
import { cn } from '@/lib/utils'

export interface PageTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {
  title: string
  subtitle?: string
  syncDocumentTitle?: boolean
}

export function PageTitle({
  title,
  subtitle,
  syncDocumentTitle = true,
  className,
  ...props
}: PageTitleProps) {
  React.useEffect(() => {
    if (syncDocumentTitle) {
      document.title = `${title} — HomeBuild Expense Tracker`
    }
  }, [title, syncDocumentTitle])

  return (
    <div className="space-y-1">
      <h1
        className={cn(
          'font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground',
          className
        )}
        {...props}
      >
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      )}
    </div>
  )
}
