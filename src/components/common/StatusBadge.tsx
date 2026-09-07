import { Badge, type BadgeProps } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ExpenseStatus } from '@/types/expense.types'

export interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: ExpenseStatus | string
  label?: string
  dot?: boolean
}

function getStatusConfig(status: string, label?: string) {
  const normalized = status.toLowerCase().replace(/\s+/g, '_')

  switch (normalized) {
    case 'paid':
    case 'completed':
    case 'on_track':
    case 'settled':
      return {
        variant: 'success' as const,
        displayLabel: label || (normalized === 'on_track' ? 'On Track' : normalized === 'settled' ? '100% Settled' : 'Completed'),
        dotColor: 'bg-[#059669]',
      }

    case 'pending':
    case 'in_review':
    case 'nearing_cap':
      return {
        variant: 'warning' as const,
        displayLabel: label || (normalized === 'in_review' ? 'In Review' : 'Pending'),
        dotColor: 'bg-[#d97706]',
      }

    case 'overrun':
    case 'overdue':
    case 'rejected':
    case 'critical':
      return {
        variant: 'destructive' as const,
        displayLabel: label || (normalized === 'overrun' ? 'Overrun' : 'Overdue'),
        dotColor: 'bg-[#dc2626]',
      }

    case 'in_progress':
    case 'active':
      return {
        variant: 'primary' as const,
        displayLabel: label || 'In Progress',
        dotColor: 'bg-[#4f46e5]',
      }

    case 'draft':
    default:
      return {
        variant: 'secondary' as const,
        displayLabel: label || status,
        dotColor: 'bg-muted-foreground',
      }
  }
}

export function StatusBadge({
  status,
  label,
  dot = true,
  className,
  ...props
}: StatusBadgeProps) {
  const { variant, displayLabel, dotColor } = getStatusConfig(status, label)

  return (
    <Badge
      variant={variant}
      dot={dot}
      dotColor={dotColor}
      className={cn('capitalize text-[11px] font-semibold', className)}
      {...props}
    >
      {displayLabel}
    </Badge>
  )
}
