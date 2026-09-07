import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  prefixNode?: React.ReactNode
  suffixNode?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, prefixNode, suffixNode, ...props }, ref) => {
    if (prefixNode || suffixNode) {
      return (
        <div className="relative flex items-center w-full">
          {prefixNode && (
            <div className="absolute left-3 flex items-center pointer-events-none text-muted-foreground select-none text-sm">
              {prefixNode}
            </div>
          )}
          <input
            type={type}
            className={cn(
              'flex h-[38px] w-full rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50',
              prefixNode && 'pl-9',
              suffixNode && 'pr-9',
              className
            )}
            ref={ref}
            {...props}
          />
          {suffixNode && (
            <div className="absolute right-3 flex items-center text-muted-foreground text-sm">
              {suffixNode}
            </div>
          )}
        </div>
      )
    }

    return (
      <input
        type={type}
        className={cn(
          'flex h-[38px] w-full rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
