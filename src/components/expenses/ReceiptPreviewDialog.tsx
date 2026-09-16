import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Download,
  Loader2,
  AlertCircle,
  FileQuestion,
  FileText,
  RotateCw,
} from 'lucide-react'
import { toast } from 'react-toastify'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { getReceiptUrl, downloadReceipt } from '@/services/storage.service'
import {
  getAttachmentDisplayName,
  getAttachmentPreviewType,
} from '@/utils/receipt.utils'
import type { ExpenseAttachment } from '@/types/expense.types'

export interface ReceiptPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  attachment: ExpenseAttachment | null
}

export function ReceiptPreviewDialog({
  open,
  onOpenChange,
  attachment,
}: ReceiptPreviewDialogProps) {
  const [isDownloading, setIsDownloading] = React.useState(false)

  const displayName = React.useMemo(
    () => (attachment ? getAttachmentDisplayName(attachment) : 'Receipt'),
    [attachment]
  )

  const previewType = React.useMemo(
    () => (attachment ? getAttachmentPreviewType(attachment) : 'unsupported'),
    [attachment]
  )

  // Generate signed URL strictly on-demand when the dialog is open
  const {
    data: signedUrl,
    isLoading: isLoadingUrl,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['receipt-signed-url', attachment?.id, attachment?.storage_path],
    queryFn: () => getReceiptUrl(attachment!.storage_path),
    enabled: open && Boolean(attachment?.storage_path),
    staleTime: 50 * 60 * 1000, // 50 minutes (valid for 60m)
    gcTime: 0,
    retry: false,
  })

  const handleDownload = async () => {
    if (!attachment?.storage_path || isDownloading) return

    setIsDownloading(true)
    try {
      await downloadReceipt(attachment.storage_path, displayName)
    } catch {
      toast.error('Unable to download the receipt. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl lg:max-w-4xl max-w-[95vw] max-h-[92vh] flex flex-col p-4 sm:p-6 gap-3">
        {/* Modal Header */}
        <DialogHeader className="pr-6 text-left">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold truncate text-foreground">
            <FileText className="h-4 w-4 shrink-0 text-primary" />
            <span className="truncate" title={displayName}>
              {displayName}
            </span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Secure temporary receipt preview generated from private storage
          </DialogDescription>
        </DialogHeader>

        {/* Modal Body / Viewer */}
        <div className="relative flex-1 min-h-[300px] max-h-[68vh] overflow-auto flex items-center justify-center rounded-xl border border-border/80 bg-muted/20 p-2 sm:p-4">
          {isLoadingUrl ? (
            /* Loading State */
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium">Loading receipt...</p>
            </div>
          ) : isError ? (
            /* Error State */
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive border border-destructive/20">
                <AlertCircle className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-foreground">
                Unable to load the receipt. Please try again.
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => void refetch()}
                className="gap-1.5 mt-1"
              >
                <RotateCw className="h-3.5 w-3.5" />
                <span>Retry</span>
              </Button>
            </div>
          ) : signedUrl ? (
            /* Preview Success */
            previewType === 'image' ? (
              <div className="w-full h-full flex items-center justify-center p-1">
                <img
                  src={signedUrl}
                  alt={displayName}
                  className="max-h-[64vh] w-auto max-w-full rounded-lg object-contain shadow-level-1"
                />
              </div>
            ) : previewType === 'pdf' ? (
              <iframe
                src={signedUrl}
                title={displayName}
                className="w-full h-[64vh] min-h-[420px] rounded-lg border border-border bg-white dark:bg-slate-900 shadow-level-1"
              />
            ) : (
              /* Unsupported Preview Type */
              <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground border border-border">
                  <FileQuestion className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    Preview is not available for this file type.
                  </p>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    You can still download the file to inspect it on your local device.
                  </p>
                </div>
              </div>
            )
          ) : null}
        </div>

        {/* Modal Footer Actions */}
        <DialogFooter className="flex-row items-center justify-between sm:justify-between border-t border-border/70 pt-3">
          <span className="text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-[320px]">
            {displayName}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => void handleDownload()}
              disabled={isDownloading || !attachment}
              className="gap-1.5"
            >
              {isDownloading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              <span>{isDownloading ? 'Downloading...' : 'Download'}</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
