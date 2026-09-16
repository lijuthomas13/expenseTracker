import { supabase } from '@/lib/supabase/client'
import type { Expense, PaginatedExpensesResponse, ExpenseFilters } from '@/types/expense.types'
import type {
  CreateExpenseRequest,
  CreateExpenseResponse,
  UploadReceiptResponse,
} from '@/types/expense'

const RECEIPT_BUCKET = 'expense-receipts'

/**
 * Service function to retrieve paginated project expenses with joined relationships.
 *
 * Relationships:
 * - category (from categories table: id, name, color, icon)
 * - vendor (from vendors table: id, name)
 * - payment_method (from payment_methods table: id, name)
 *
 * Ordering:
 * - expense_date DESC
 * - created_at DESC
 *
 * Pagination:
 * - Uses .range(from, to) with count: 'exact'
 * - Example: page 1, pageSize 20 -> items 0-19
 *
 * Requirements:
 * - Directly communicates with Supabase (no React code).
 * - Throws any Supabase errors encountered.
 * - Returns { data, count }.
 */
export async function getExpenses(
  projectId: string,
  page: number,
  pageSize: number,
  filters?: ExpenseFilters
): Promise<PaginatedExpensesResponse> {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('expenses')
    .select(
      'id, amount, expense_date, description, status, invoice_number, created_at, category:categories(id, name, color, icon), vendor:vendors(id, name), payment_method:payment_methods(id, name), attachments:expense_attachments(id, storage_path, file_name, mime_type, created_at) ',
      { count: 'exact' }
    )
    .eq('project_id', projectId)
    .is('deleted_at', null)

  if (filters?.categoryId) {
    query = query.eq('category_id', filters.categoryId)
  }

  if (filters?.startDate) {
    query = query.gte('expense_date', filters.startDate)
  }

  if (filters?.endDate) {
    query = query.lte('expense_date', filters.endDate)
  }

  const { data, error, count } = await query
    .order('expense_date', { ascending: false })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    throw error
  }

  return {
    data: (data ?? []) as unknown as Expense[],
    count: count ?? 0,
  }
}

/**
 * Service function to retrieve all expenses for a project without pagination,
 * applying any active filters. Used specifically for complete data export (e.g. CSV).
 */
export async function getAllExpensesForExport(
  projectId: string,
  filters?: ExpenseFilters
): Promise<Expense[]> {
  let query = supabase
    .from('expenses')
    .select(
      'id, amount, expense_date, description, status, invoice_number, created_at, category:categories(id, name, color, icon), vendor:vendors(id, name), payment_method:payment_methods(id, name)'
    )
    .eq('project_id', projectId)
    .is('deleted_at', null)

  if (filters?.categoryId) {
    query = query.eq('category_id', filters.categoryId)
  }

  if (filters?.startDate) {
    query = query.gte('expense_date', filters.startDate)
  }

  if (filters?.endDate) {
    query = query.lte('expense_date', filters.endDate)
  }

  const { data, error } = await query
    .order('expense_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []) as unknown as Expense[]
}

/**
 * Service function to upload a receipt file to Supabase Storage.
 *
 * Responsibilities:
 * - Uploads file to Supabase Storage bucket `expense-receipts`.
 * - Generates a unique UUID prefix for uniqueness.
 * - Structure: project-id/year/month/uuid-filename
 * - Returns the relative storage path (not a public URL), file name, and MIME type.
 * - Throws any Supabase storage errors encountered.
 */
export async function uploadReceipt(
  file: File,
  projectId: string
): Promise<UploadReceiptResponse> {
  const now = new Date()
  const year = now.getFullYear().toString()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const uuid = crypto.randomUUID()
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const storagePath = `${projectId}/${year}/${month}/${uuid}-${sanitizedFileName}`

  const { data, error } = await supabase.storage
    .from(RECEIPT_BUCKET)
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
 * Service function to create an expense record via Supabase RPC.
 *
 * Steps:
 * 1. If a receipt file is present, uploads it to Supabase Storage first.
 * 2. Invokes the `create_expense` RPC with positional/named parameters.
 * 3. Returns the newly created expense UUID.
 *
 * Never performs database work or UI side-effects directly.
 * Throws any encountered RPC or Storage errors.
 */
export async function createExpense(
  request: CreateExpenseRequest
): Promise<CreateExpenseResponse> {
  let storagePath: string | null = null
  let fileName: string | null = null
  let mimeType: string | null = null

  // Step 1: Upload receipt to Supabase Storage if present
  if (request.receipt) {
    const uploadResult = await uploadReceipt(request.receipt, request.projectId)
    storagePath = uploadResult.storagePath
    fileName = uploadResult.fileName
    mimeType = uploadResult.mimeType
  }

  // Step 2: Call the `create_expense` RPC
  const { data, error } = await supabase.rpc('create_expense', {
    p_project_id: request.projectId,
    p_category_id: request.categoryId,
    p_payment_method_id: request.paymentMethodId,
    p_amount: request.amount,
    p_expense_date: request.expenseDate,
    p_description: request.description?.trim() || null,
    p_vendor_id: request.vendorId?.trim() || null,
    p_invoice_number: request.invoiceNumber?.trim() || null,
    p_status: request.status || 'Paid',
    p_storage_path: storagePath,
    p_file_name: fileName,
    p_mime_type: mimeType,
  })

  if (error) {
    throw error
  }

  // Step 3: Return created expense id
  return {
    expenseId: data as string,
  }
}

/**
 * Service function to soft-delete an expense record via the `delete_expense` Supabase RPC.
 *
 * Requirements:
 * - Invokes `public.delete_expense(p_expense_id)`.
 * - Performs soft delete (sets deleted_at = now()).
 * - Does not physically delete rows or storage files.
 * - Returns boolean indicating whether an active record was updated.
 * - Throws any encountered RPC or network errors.
 */
export async function deleteExpense(expenseId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('delete_expense', {
    p_expense_id: expenseId,
  })

  if (error) {
    throw error
  }

  return Boolean(data)
}

