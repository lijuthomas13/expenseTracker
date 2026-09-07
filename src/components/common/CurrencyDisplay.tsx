import * as React from 'react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/utils/formatters'
import type { CurrencyCode } from '@/types/expense.types'

export interface CurrencyDisplayProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  amount: number
  currency?: CurrencyCode
  compact?: boolean
  trend?: 'positive' | 'negative' | 'neutral' | 'auto'
  showSign?: boolean
}

export function CurrencyDisplay({
  amount,
  currency = 'INR',
  compact = false,
  trend = 'neutral',
  showSign = false,
  className,
  ...props
}: CurrencyDisplayProps) {
  const formatted = formatCurrency(amount, {
    currency,
    compact,
    showSign,
  })

  let trendColor = ''
  if (trend === 'positive' || (trend === 'auto' && amount > 0)) {
    trendColor = 'text-[#059669] dark:text-[#34d399]'
  } else if (trend === 'negative' || (trend === 'auto' && amount < 0)) {
    trendColor = 'text-[#dc2626] dark:text-[#f87171]'
  }

  return (
    <span
      className={cn(
        'tabular-nums font-semibold tracking-tight inline-block',
        trendColor,
        className
      )}
      {...props}
    >
      {formatted}
    </span>
  )
}
