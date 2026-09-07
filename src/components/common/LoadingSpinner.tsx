import * as React from 'react'
import { cn } from '@/lib/utils'

export interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  label?: string
}

const sizeMap = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-3',
  xl: 'h-12 w-12 border-4',
}

export function LoadingSpinner({
  size = 'md',
  label = 'Loading...',
  className,
  ...props
}: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn('inline-flex items-center justify-center', className)}
      {...props}
    >
      <div
        className={cn(
          'animate-spin rounded-full border-primary border-t-transparent',
          sizeMap[size]
        )}
      />
      <span className="sr-only">{label}</span>
    </div>
  )
}
