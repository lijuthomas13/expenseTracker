import type { CurrencyFormatOptions, DateFormatOptions } from '@/types/common.types'
import { APP_CONFIG } from '@/constants/config'

/**
 * Format currency with full tabular and Indian/international number support.
 * Examples:
 * formatCurrency(1875000) -> "₹18,75,000"
 * formatCurrency(1875000, { compact: true }) -> "₹18.75L"
 */
export function formatCurrency(
  amount: number,
  options: CurrencyFormatOptions = {}
): string {
  const {
    currency = APP_CONFIG.defaultCurrency,
    locale = APP_CONFIG.defaultLocale,
    compact = false,
    showSign = false,
  } = options

  if (isNaN(amount)) return '₹0'

  if (compact) {
    if (currency === 'INR') {
      const abs = Math.abs(amount)
      const sign = amount < 0 ? '-' : showSign && amount > 0 ? '+' : ''
      if (abs >= 10000000) {
        return `${sign}₹${(abs / 10000000).toFixed(2).replace(/\.00$/, '')}Cr`
      }
      if (abs >= 100000) {
        return `${sign}₹${(abs / 100000).toFixed(2).replace(/\.00$/, '')}L`
      }
      if (abs >= 1000) {
        return `${sign}₹${(abs / 1000).toFixed(1).replace(/\.0$/, '')}k`
      }
      return `${sign}₹${abs}`
    }

    // Default compact notation for other currencies
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      notation: 'compact',
      maximumFractionDigits: 1,
      signDisplay: showSign ? 'always' : 'auto',
    }).format(amount)
  }

  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
    signDisplay: showSign ? 'always' : 'auto',
  }).format(amount)

  return formatted
}

/**
 * Formats a Date object or ISO string into readable dates.
 * e.g. "24 Oct 2024" or "Oct 2024"
 */
export function formatDate(
  dateInput: string | Date | number,
  options: DateFormatOptions = {}
): string {
  const { locale = APP_CONFIG.defaultLocale, format = 'medium' } = options
  const date = typeof dateInput === 'string' || typeof dateInput === 'number'
    ? new Date(dateInput)
    : dateInput

  if (isNaN(date.getTime())) return 'Invalid date'

  if (format === 'month-year') {
    return new Intl.DateTimeFormat(locale, {
      month: 'short',
      year: 'numeric',
    }).format(date)
  }

  if (format === 'short') {
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: 'short',
    }).format(date)
  }

  if (format === 'full') {
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date)
  }

  // Medium (default): "24 Oct 2024"
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

/**
 * Returns human-readable relative time string.
 */
export function formatRelativeDate(dateInput: string | Date | number): string {
  const date = typeof dateInput === 'string' || typeof dateInput === 'number'
    ? new Date(dateInput)
    : dateInput

  if (isNaN(date.getTime())) return ''

  const now = new Date()
  const diffInMs = date.getTime() - now.getTime()
  const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24))

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

  if (Math.abs(diffInDays) < 1) return 'Today'
  if (Math.abs(diffInDays) < 30) return rtf.format(diffInDays, 'day')
  if (Math.abs(diffInDays) < 365) return rtf.format(Math.round(diffInDays / 30), 'month')
  return rtf.format(Math.round(diffInDays / 365), 'year')
}

/**
 * Formats a regular number with thousands separators.
 */
export function formatNumber(
  value: number,
  options: { locale?: string; decimals?: number } = {}
): string {
  const { locale = APP_CONFIG.defaultLocale, decimals = 0 } = options
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Formats a decimal/percentage.
 * e.g. 37.5 -> "37.5%"
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals).replace(/\.0$/, '')}%`
}
