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
import { FundingReceiptPreviewDialog } from './FundingReceiptPreviewDialog'
import { downloadFundingAttachment } from '@/services/funding.service'
import {
  getAttachmentDisplayName,
  getAttachmentPreviewType,
} from '@/utils/receipt.utils'
import type { FundingAttachment } from '@/types/funding.types'
import { cn } from '@/lib/utils'

export interface FundingReceiptActionsProps {
  attachment: FundingAttachment
  onView?: (attachment: FundingAttachment) => void
  className?: string
}

export function FundingReceiptActions({
  attachment,
  onView,
  className,
}: FundingReceiptActionsProps) {
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
      await downloadFundingAttachment(attachment.storage_path, displayName)
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
        <FundingReceiptPreviewDialog
          open={isStandaloneDialogOpen}
          onOpenChange={setIsStandaloneDialogOpen}
          attachment={attachment}
        />
      )}
    </TooltipProvider>
  )
}
