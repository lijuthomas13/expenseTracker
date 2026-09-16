import { AlertTriangle, Loader2 } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay'
import { DateDisplay } from '@/components/common/DateDisplay'
import { CategoryIcon } from '@/components/common/CategoryIcon'
import { useDeleteExpenseMutation } from '@/hooks/mutations/useDeleteExpenseMutation'
import type { Expense } from '@/types/expense.types'

export interface DeleteExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expense: Expense | null
  onSuccess?: () => void
}

export function DeleteExpenseDialog({
  open,
  onOpenChange,
  expense,
  onSuccess,
}: DeleteExpenseDialogProps) {
  const deleteExpenseMutation = useDeleteExpenseMutation()
  const isDeleting = deleteExpenseMutation.isPending

  const handleConfirm = async () => {
    if (!expense?.id || isDeleting) return

    try {
      await deleteExpenseMutation.mutateAsync(expense.id)
      onOpenChange(false)
      onSuccess?.()
    } catch {
      // Deletion error handled in mutation onError toast
      // Dialog remains open on failure allowing retry
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    // Prevent accidental dismiss while mutation is in-flight
    if (isDeleting) return
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md max-w-[95vw] p-5 sm:p-6 gap-4">
        {/* Header with destructive alert badge */}
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive border border-destructive/20">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </div>
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="text-base sm:text-lg font-semibold text-foreground">
              Delete Expense
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
              Are you sure you want to delete this expense?
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Expense Details Card */}
        {expense && (
          <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5 space-y-2.5 text-xs">
            {/* Category */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground font-medium">Category:</span>
              <div className="flex items-center gap-1.5 font-semibold text-foreground truncate">
                <CategoryIcon
                  icon={expense.category?.icon}
                  color={expense.category?.color}
                  size="sm"
                  withBackground
                />
                <span className="truncate max-w-[160px]">
                  {expense.category?.name ?? 'General'}
                </span>
              </div>
            </div>

            {/* Amount */}
            <div className="flex items-center justify-between gap-2 border-t border-border/50 pt-2">
              <span className="text-muted-foreground font-medium">Amount:</span>
              <CurrencyDisplay
                amount={expense.amount}
                className="font-bold text-sm text-foreground"
              />
            </div>

            {/* Date */}
            <div className="flex items-center justify-between gap-2 border-t border-border/50 pt-2">
              <span className="text-muted-foreground font-medium">Date:</span>
              <DateDisplay
                date={expense.expense_date}
                format="medium"
                className="font-medium text-foreground"
              />
            </div>

            {/* Vendor / Payee */}
            {expense.vendor?.name && (
              <div className="flex items-center justify-between gap-2 border-t border-border/50 pt-2">
                <span className="text-muted-foreground font-medium">
                  Vendor / Payee:
                </span>
                <span className="font-medium text-foreground truncate max-w-[180px]">
                  {expense.vendor.name}
                </span>
              </div>
            )}

            {/* Description */}
            {expense.description && (
              <div className="border-t border-border/50 pt-2">
                <span className="text-muted-foreground font-medium block mb-0.5">
                  Description:
                </span>
                <p className="text-muted-foreground italic truncate">
                  &ldquo;{expense.description}&rdquo;
                </p>
              </div>
            )}
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          This expense will be removed from the active expense list.
        </p>

        {/* Footer Actions */}
        <DialogFooter className="flex-row items-center justify-end gap-2 pt-1 border-t border-border/60">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => handleOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => void handleConfirm()}
            disabled={isDeleting || !expense}
            className="gap-1.5"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
