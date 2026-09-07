import * as React from 'react'
import { cn } from '@/lib/utils'

export interface PageContainerProps extends React.HTMLAttributes<HTMLElement> {
  maxWidth?: 'default' | 'narrow' | 'wide' | 'full'
}

export function PageContainer({
  maxWidth = 'default',
  className,
  children,
  ...props
}: PageContainerProps) {
  const maxWidthClasses = {
    narrow: 'max-w-4xl',
    default: 'max-w-[88rem]', // 1408px from design system
    wide: 'max-w-[96rem]',
    full: 'max-w-full',
  }

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className={cn(
        'mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 outline-none',
        maxWidthClasses[maxWidth],
        className
      )}
      {...props}
    >
      {children}
    </main>
  )
}
