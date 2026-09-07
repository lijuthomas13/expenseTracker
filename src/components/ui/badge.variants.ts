import { cva } from 'class-variance-authority'

export const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold transition-colors select-none tracking-wide h-[22px]',
  {
    variants: {
      variant: {
        default:
          'border-border bg-muted text-foreground',
        secondary:
          'border-border bg-secondary text-secondary-foreground',
        outline:
          'text-foreground border-border bg-transparent',
        success:
          'border-[#a7f3d0] bg-[#ecfdf5] text-[#065f46] dark:border-[#065f46] dark:bg-[#022c22] dark:text-[#6ee7b7]',
        warning:
          'border-[#fde68a] bg-[#fffbeb] text-[#92400e] dark:border-[#78350f] dark:bg-[#451a03] dark:text-[#fcd34d]',
        destructive:
          'border-[#fecaca] bg-[#fef2f2] text-[#991b1b] dark:border-[#7f1d1d] dark:bg-[#450a0a] dark:text-[#fca5a5]',
        primary:
          'border-[#c7d2fe] bg-[#eef2ff] text-[#4338ca] dark:border-[#3730a3] dark:bg-[#1e1b4b] dark:text-[#a5b4fc]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)
