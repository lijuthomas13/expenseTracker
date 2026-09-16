import type { ExpenseAttachment } from '@/types/expense.types'

export type AttachmentPreviewType = 'image' | 'pdf' | 'unsupported'

const IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
])

const PDF_MIME_TYPES = new Set(['application/pdf'])

/**
 * Determines whether an attachment can be previewed as an image, a PDF,
 * or is an unsupported preview type. Uses `mime_type` first.
 */
export function getAttachmentPreviewType(
  attachment: ExpenseAttachment
): AttachmentPreviewType {
  const mime = attachment.mime_type?.toLowerCase().trim()

  if (mime) {
    if (IMAGE_MIME_TYPES.has(mime)) return 'image'
    if (PDF_MIME_TYPES.has(mime)) return 'pdf'
    return 'unsupported'
  }

  // Fallback to file extension check if mime_type is missing
  const nameOrPath = (attachment.file_name || attachment.storage_path || '').toLowerCase()
  if (
    nameOrPath.endsWith('.jpg') ||
    nameOrPath.endsWith('.jpeg') ||
    nameOrPath.endsWith('.png') ||
    nameOrPath.endsWith('.webp') ||
    nameOrPath.endsWith('.gif')
  ) {
    return 'image'
  }

  if (nameOrPath.endsWith('.pdf')) {
    return 'pdf'
  }

  return 'unsupported'
}

/**
 * Extracts a user-friendly display filename for an attachment.
 * Prioritizes `attachment.file_name`. If null, extracts from `storage_path`
 * while stripping internal UUID prefixes and never exposing the full path.
 */
export function getAttachmentDisplayName(
  attachment: ExpenseAttachment
): string {
  if (attachment.file_name && attachment.file_name.trim().length > 0) {
    return attachment.file_name.trim()
  }

  if (attachment.storage_path) {
    const segments = attachment.storage_path.split('/')
    const lastSegment = segments[segments.length - 1]
    // Strip standard 36-character UUID prefix if present (e.g. `uuid-receipt.jpg`)
    const sanitized = lastSegment.replace(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/i,
      ''
    )
    if (sanitized && sanitized.trim().length > 0) {
      return sanitized.trim()
    }
  }

  return 'Receipt'
}
