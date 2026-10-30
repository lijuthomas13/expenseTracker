import * as React from 'react'
import { FundingReceiptActions } from './FundingReceiptActions'
import { FundingReceiptPreviewDialog } from './FundingReceiptPreviewDialog'
import type { FundingAttachment } from '@/types/funding.types'

export interface FundingAttachmentsCellProps {
  attachments?: FundingAttachment[] | null
}

export function FundingAttachmentsCell({
  attachments,
}: FundingAttachmentsCellProps) {
  const [selectedAttachment, setSelectedAttachment] =
    React.useState<FundingAttachment | null>(null)

  if (!attachments || attachments.length === 0) {
    return <span className="text-xs text-muted-foreground">—</span>
  }

  return (
    <>
      <div className="flex flex-col gap-1.5 py-1">
        {attachments.map((att) => (
          <FundingReceiptActions
            key={att.id}
            attachment={att}
            onView={(attachment) => setSelectedAttachment(attachment)}
          />
        ))}
      </div>

      <FundingReceiptPreviewDialog
        open={Boolean(selectedAttachment)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedAttachment(null)
          }
        }}
        attachment={selectedAttachment}
      />
    </>
  )
}
