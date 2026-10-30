import { supabase } from '@/lib/supabase/client'
import type {
  Funding,
  PaginatedFundingsResponse,
  CreateFundingRequest,
  CreateFundingResponse,
  UploadFundingAttachmentResponse,
} from '@/types/funding.types'

export const FUNDING_RECEIPT_BUCKET = 'funding-receipts'

/**
 * Service function to retrieve paginated project fundings with joined relationships.
 *
 * Relationships:
 * - payment_method (from payment_methods table: id, name)
 * - funder (from profiles table via fundings_funded_by_fkey: id, full_name, avatar_url)
 * - attachments (from funding_attachments table)
 *
 * Ordering:
 * - funding_date DESC
 * - created_at DESC
 *
 * Soft deletion:
 * - Excludes records where deleted_at IS NOT NULL
 */
export async function getFundings(
  projectId: string,
  page: number,
  pageSize: number
): Promise<PaginatedFundingsResponse> {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await supabase
    .from('fundings')
    .select(
      `
      id,
      project_id,
      funding_date,
      amount,
      payment_method_id,
      funded_by,
      description,
      created_at,
      updated_at,
      deleted_at,
      payment_method:payment_methods(id, name),
      funder:profiles!fundings_funded_by_fkey(id, full_name, avatar_url),
      attachments:funding_attachments(id, storage_path, file_name, mime_type, created_at)
      `,
      { count: 'exact' }
    )
    .eq('project_id', projectId)
    .is('deleted_at', null)
    .order('funding_date', { ascending: false })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    throw error
  }

  return {
    data: (data ?? []) as unknown as Funding[],
    count: count ?? 0,
  }
}

/**
 * Service function to upload a funding receipt/attachment to the 'funding-receipts' Supabase Storage bucket.
 */
export async function uploadFundingAttachment(
  file: File,
  projectId: string
): Promise<UploadFundingAttachmentResponse> {
  const now = new Date()
  const year = now.getFullYear().toString()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const uuid = crypto.randomUUID()
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const storagePath = `${projectId}/${year}/${month}/${uuid}-${sanitizedFileName}`

  const { data, error } = await supabase.storage
    .from(FUNDING_RECEIPT_BUCKET)
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    })

  if (error) {
    throw error
  }

  return {
    storagePath: data?.path ?? storagePath,
    fileName: file.name,
    mimeType: file.type,
  }
}

/**
 * Generates a temporary signed URL to view or download a funding receipt from the private Supabase Storage bucket.
 */
export async function getFundingAttachmentUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(FUNDING_RECEIPT_BUCKET)
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
 * Downloads a funding receipt directly to the user's browser.
 */
export async function downloadFundingAttachment(
  storagePath: string,
  fileName: string
): Promise<void> {
  const signedUrl = await getFundingAttachmentUrl(storagePath)

  const response = await fetch(signedUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch attachment file: ${response.statusText}`)
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

/**
 * Service function to create a funding record via Supabase RPC `create_funding`.
 */
export async function createFunding(
  request: CreateFundingRequest
): Promise<CreateFundingResponse> {
  let storagePath: string | null = null
  let fileName: string | null = null
  let mimeType: string | null = null

  // Upload attachment if present
  if (request.attachment) {
    const uploadResult = await uploadFundingAttachment(
      request.attachment,
      request.projectId
    )
    storagePath = uploadResult.storagePath
    fileName = uploadResult.fileName
    mimeType = uploadResult.mimeType
  }

  // Call the create_funding RPC
  const { data, error } = await supabase.rpc('create_funding', {
    p_project_id: request.projectId,
    p_funding_date: request.fundingDate,
    p_amount: request.amount,
    p_payment_method_id: request.paymentMethodId,
    p_funded_by: request.fundedBy,
    p_description: request.description?.trim() || null,
    p_storage_path: storagePath,
    p_file_name: fileName,
    p_mime_type: mimeType,
  })

  if (error) {
    throw error
  }

  return {
    fundingId: data as string,
  }
}

/**
 * Service function to retrieve all fundings for a project without pagination,
 * used specifically for complete CSV export.
 */
export async function getAllFundingsForExport(
  projectId: string
): Promise<Funding[]> {
  const { data, error } = await supabase
    .from('fundings')
    .select(
      `
      id,
      project_id,
      funding_date,
      amount,
      payment_method_id,
      funded_by,
      description,
      created_at,
      updated_at,
      deleted_at,
      payment_method:payment_methods(id, name),
      funder:profiles!fundings_funded_by_fkey(id, full_name, avatar_url),
      attachments:funding_attachments(id, storage_path, file_name, mime_type, created_at)
      `
    )
    .eq('project_id', projectId)
    .is('deleted_at', null)
    .order('funding_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []) as unknown as Funding[]
}

/**
 * Service function to retrieve aggregated total funding amount for a project.
 */
export async function getTotalFunding(projectId: string): Promise<number> {
  const { data, error } = await supabase
    .from('fundings')
    .select('amount')
    .eq('project_id', projectId)
    .is('deleted_at', null)

  if (error) {
    throw error
  }

  return (data ?? []).reduce((sum, item) => sum + Number(item.amount || 0), 0)
}
