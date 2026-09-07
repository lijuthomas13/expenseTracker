import { cva } from 'class-variance-authority'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.99]',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-white shadow-sm hover:bg-primary-hover shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]',
        default:
          'bg-primary text-white shadow-sm hover:bg-primary-hover shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]',
        secondary:
          'bg-card text-foreground border border-border hover:bg-muted hover:border-slate-300 dark:hover:border-slate-700 shadow-level-1',
        outline:
          'border border-border bg-transparent text-foreground hover:bg-muted hover:text-foreground',
        ghost:
          'text-muted-foreground hover:bg-muted hover:text-foreground',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-red-700 shadow-sm',
        link: 'text-primary underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        default: 'h-[38px] px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-11 rounded-lg px-6 text-base',
        icon: 'h-9 w-9 rounded-lg p-0',
        iconSm: 'h-7 w-7 rounded-md p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)
