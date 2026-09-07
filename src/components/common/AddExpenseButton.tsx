import * as React from 'react'
import { Plus } from 'lucide-react'
import { Button, type ButtonProps } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { RecordExpenseDialog } from './RecordExpenseDialog'

export interface AddExpenseButtonProps extends ButtonProps {
  onAddSuccess?: () => void
  customLabel?: string
  dialogTitle?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function AddExpenseButton({
  className,
  customLabel = 'Add Expense',
  size = 'default',
  variant = 'primary',
  onAddSuccess,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onClick,
  ...props
}: AddExpenseButtonProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? (controlledOnOpenChange ?? (() => {})) : setInternalOpen

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e)
    if (!e.defaultPrevented) {
      setOpen(true)
    }
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={cn('font-medium shadow-sm shrink-0', className)}
        onClick={handleClick}
        {...props}
      >
        <Plus className="h-4 w-4" />
        <span>{customLabel}</span>
      </Button>

      <RecordExpenseDialog
        open={open}
        onOpenChange={setOpen}
        onSuccess={onAddSuccess}
      />
    </>
  )
}

export { RecordExpenseDialog }
