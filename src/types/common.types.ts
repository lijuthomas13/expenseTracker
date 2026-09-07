import type { ReactNode } from 'react'

export interface BaseEntity {
  id: string
  createdAt?: string
  updatedAt?: string
}

export interface PaginationState {
  pageIndex: number
  pageSize: number
  totalCount: number
}

export interface SortState {
  column: string
  direction: 'asc' | 'desc'
}

export interface StatusBadgeProps {
  status: string
  label?: string
  variant?: 'paid' | 'pending' | 'in_progress' | 'overrun' | 'completed' | 'draft' | 'success' | 'warning' | 'destructive' | 'default'
  dot?: boolean
  className?: string
}

export interface CurrencyFormatOptions {
  currency?: 'INR' | 'USD' | 'EUR' | 'GBP'
  locale?: string
  compact?: boolean
  showSign?: boolean
}

export interface DateFormatOptions {
  locale?: string
  format?: 'full' | 'medium' | 'short' | 'month-year'
}

export interface ActionMenuItem {
  label: string
  onClick: () => void
  icon?: ReactNode
  destructive?: boolean
}
