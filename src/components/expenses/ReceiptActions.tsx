import * as React from 'react'
import {
  Eye,
  Download,
  Loader2,
  FileText,
  Image as ImageIcon,
} from 'lucide-react'
import { toast } from 'react-toastify'

import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ReceiptPreviewDialog } from './ReceiptPreviewDialog'
import { downloadReceipt } from '@/services/storage.service'
import {
  getAttachmentDisplayName,
  getAttachmentPreviewType,
} from '@/utils/receipt.utils'
import type { ExpenseAttachment } from '@/types/expense.types'
import { cn } from '@/lib/utils'

export interface ReceiptActionsProps {
  attachment: ExpenseAttachment
  onView?: (attachment: ExpenseAttachment) => void
  className?: string
}

export function ReceiptActions({
  attachment,
  onView,
  className,
}: ReceiptActionsProps) {
  const [isDownloading, setIsDownloading] = React.useState(false)
  const [isStandaloneDialogOpen, setIsStandaloneDialogOpen] = React.useState(false)

  const displayName = React.useMemo(
    () => getAttachmentDisplayName(attachment),
    [attachment]
  )

  const previewType = React.useMemo(
    () => getAttachmentPreviewType(attachment),
    [attachment]
  )

  const handleView = () => {
    if (onView) {
      onView(attachment)
    } else {
      setIsStandaloneDialogOpen(true)
    }
  }

  const handleDownload = async () => {
    if (isDownloading) return

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
    <TooltipProvider delayDuration={150}>
      <div
        className={cn(
          'inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-card/60 px-2 py-1 text-xs transition-colors hover:bg-muted/40 max-w-[240px]',
          className
        )}
      >
        {/* File Type Icon */}
        <span className="shrink-0 text-muted-foreground">
          {previewType === 'image' ? (
            <ImageIcon className="h-3.5 w-3.5 text-blue-500" />
          ) : (
            <FileText className="h-3.5 w-3.5 text-amber-500" />
          )}
        </span>

        {/* Truncated File Name */}
        <span
          className="truncate font-medium text-foreground text-[11px] max-w-[100px] sm:max-w-[120px]"
          title={displayName}
        >
          {displayName}
        </span>

        {/* Action Buttons */}
        <div className="flex items-center gap-0.5 ml-auto shrink-0">
          {/* View Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="iconSm"
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={handleView}
                aria-label={`View ${displayName}`}
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>View receipt</TooltipContent>
          </Tooltip>

          {/* Download Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="iconSm"
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={() => void handleDownload()}
                disabled={isDownloading}
                aria-label={`Download ${displayName}`}
              >
                {isDownloading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                ) : (
                  <Download className="h-3.5 w-3.5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Download receipt</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Standalone dialog fallback when onView is not controlled by a parent */}
      {!onView && (
        <ReceiptPreviewDialog
          open={isStandaloneDialogOpen}
          onOpenChange={setIsStandaloneDialogOpen}
          attachment={attachment}
        />
      )}
    </TooltipProvider>
  )
}
