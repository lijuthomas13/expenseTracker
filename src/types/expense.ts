export interface CreateExpenseRequest {
  projectId: string
  categoryId: string
  paymentMethodId: string
  amount: number
  expenseDate: string
  description?: string | null
  vendorId?: string | null
  invoiceNumber?: string | null
  status?: string
  receipt?: File | null
}

export interface UploadReceiptResponse {
  storagePath: string
  fileName: string
  mimeType: string
}

export interface CreateExpenseResponse {
  expenseId: string
}

export interface PaymentMethod {
  id: string
  name: string
  is_active?: boolean
  created_at?: string
}

export interface Vendor {
  id: string
  name: string
  project_id?: string | null
  is_active?: boolean
  created_at?: string
}
