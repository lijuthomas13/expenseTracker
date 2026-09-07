import * as React from 'react'
import { cn } from '@/lib/utils'
import { formatDate, formatRelativeDate } from '@/utils/formatters'
import type { DateFormatOptions } from '@/types/common.types'

export interface DateDisplayProps
  extends React.TimeHTMLAttributes<HTMLTimeElement> {
  date: string | Date | number
  format?: DateFormatOptions['format']
  showRelative?: boolean
}

export function DateDisplay({
  date,
  format = 'medium',
  showRelative = false,
  className,
  ...props
}: DateDisplayProps) {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
  const isoString = !isNaN(dateObj.getTime()) ? dateObj.toISOString() : ''
  const formattedDate = formatDate(date, { format })
  const relativeText = formatRelativeDate(date)

  return (
    <time
      dateTime={isoString}
      title={relativeText ? `${formattedDate} (${relativeText})` : formattedDate}
      className={cn('text-sm text-foreground/90 whitespace-nowrap', className)}
      {...props}
    >
      {showRelative && relativeText ? relativeText : formattedDate}
    </time>
  )
}
