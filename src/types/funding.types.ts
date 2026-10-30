export interface FundingAttachment {
  id: string
  funding_id: string
  storage_path: string
  file_name: string | null
  mime_type: string | null
  created_at: string
}

export interface Funding {
  id: string
  project_id: string
  funding_date: string
  amount: number
  payment_method_id: string | null
  funded_by: string
  description: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
  payment_method?: { id: string; name: string } | null
  funder?: { id: string; full_name: string | null; avatar_url: string | null } | null
  attachments?: FundingAttachment[] | null
}

export interface PaginatedFundingsResponse {
  data: Funding[]
  count: number
}

export interface CreateFundingRequest {
  projectId: string
  fundingDate: string
  amount: number
  paymentMethodId: string
  fundedBy: string
  description?: string | null
  attachment?: File | null
}

export interface CreateFundingResponse {
  fundingId: string
}

export interface UploadFundingAttachmentResponse {
  storagePath: string
  fileName: string
  mimeType: string
}
