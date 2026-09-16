import { supabase } from '@/lib/supabase/client'

const RECEIPT_BUCKET = 'expense-receipts'

/**
 * Generates a temporary signed URL to view or download a receipt from private Supabase Storage.
 *
 * Requirements:
 * - Bucket: `expense-receipts` (private).
 * - Validity: 1 hour (3600 seconds).
 * - Never stores URL in database.
 * - Throws any Supabase storage error encountered.
 */
export async function getReceiptUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(RECEIPT_BUCKET)
    .createSignedUrl(storagePath, 60 * 60)

  if (error) {
    throw error
  }

  if (!data?.signedUrl) {
    throw new Error('No signed URL returned from storage service')
  }

  return data.signedUrl
}

/**
 * Downloads a receipt file directly to the user's browser using its original or fallback filename.
 *
 * Steps:
 * 1. Generates a signed URL on demand.
 * 2. Fetches the signed URL as a Blob.
 * 3. Triggers browser download using an anchor element.
 * 4. Cleans up DOM and blob object URL.
 */
export async function downloadReceipt(
  storagePath: string,
  fileName: string
): Promise<void> {
  const signedUrl = await getReceiptUrl(storagePath)

  const response = await fetch(signedUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch receipt file: ${response.statusText}`)
  }

  const blob = await response.blob()
  const blobUrl = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = blobUrl
  link.setAttribute('download', fileName)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(blobUrl)
}
