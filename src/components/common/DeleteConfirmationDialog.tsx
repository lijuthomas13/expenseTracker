import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import { LoadingSpinner } from './LoadingSpinner'

export interface DeleteConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void | Promise<void>
  title?: string
  description?: string
  itemType?: string
  itemName?: string
  confirmText?: string
  cancelText?: string
  isLoading?: boolean
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  itemType = 'item',
  itemName,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isLoading = false,
}: DeleteConfirmationDialogProps) {
  const displayTitle = title || `Delete ${itemType}`
  const displayDescription =
    description ||
    (itemName
      ? `Are you sure you want to permanently remove "${itemName}"? This action cannot be undone.`
      : `Are you sure you want to delete this ${itemType}? This action cannot be undone.`)

  const handleConfirm = async () => {
    await onConfirm()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fef2f2] text-[#dc2626] border border-[#fecaca] dark:bg-[#450a0a] dark:text-[#f87171] dark:border-[#7f1d1d]">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </div>
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle>{displayTitle}</DialogTitle>
            <DialogDescription>{displayDescription}</DialogDescription>
          </DialogHeader>
        </div>

        <DialogFooter className="mt-4 gap-2 sm:gap-0">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
