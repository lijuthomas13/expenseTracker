import * as React from 'react'
import { ReceiptActions } from './ReceiptActions'
import { ReceiptPreviewDialog } from './ReceiptPreviewDialog'
import type { ExpenseAttachment } from '@/types/expense.types'

export interface ExpenseAttachmentsCellProps {
  attachments?: ExpenseAttachment[] | null
}

export function ExpenseAttachmentsCell({
  attachments,
}: ExpenseAttachmentsCellProps) {
  const [selectedAttachment, setSelectedAttachment] =
    React.useState<ExpenseAttachment | null>(null)

  if (!attachments || attachments.length === 0) {
    return <span className="text-xs text-muted-foreground">—</span>
  }

  return (
    <>
      <div className="flex flex-col gap-1.5 py-1">
        {attachments.map((att) => (
          <ReceiptActions
            key={att.id}
            attachment={att}
            onView={(attachment) => setSelectedAttachment(attachment)}
          />
        ))}
      </div>

      <ReceiptPreviewDialog
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
