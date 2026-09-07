import * as React from 'react'
import { type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { badgeVariants } from './badge.variants'

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
  dotColor?: string
}

function Badge({ className, variant, dot, dotColor, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full shrink-0',
            dotColor ||
              (variant === 'success'
                ? 'bg-[#059669]'
                : variant === 'warning'
                ? 'bg-[#d97706]'
                : variant === 'destructive'
                ? 'bg-[#dc2626]'
                : variant === 'primary'
                ? 'bg-primary'
                : 'bg-muted-foreground')
          )}
        />
      )}
      {children}
    </div>
  )
}

export { Badge }
