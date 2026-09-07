import { z } from 'zod'

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const ALLOWED_FILE_TYPES = [
  'image/png',
  'image/jpeg',
  'application/pdf',
] as const

/**
 * Zod validation schema for the Create Expense form.
 * Enforces strict validation rules:
 * - amount: required, number > 0
 * - category: required
 * - payment_method: required
 * - expense_date: required
 * - vendor: optional
 * - description: optional, max 500 chars
 * - invoice_number: optional
 * - receipt: optional, PNG/JPEG/PDF up to 10MB
 */
export const createExpenseSchema = z.object({
  amount: z
    .number({ message: 'Amount is required and must be a valid number' })
    .positive('Amount must be greater than zero'),
  category_id: z.string().min(1, 'Category is required'),
  payment_method_id: z.string().min(1, 'Payment method is required'),
  expense_date: z.string().min(1, 'Expense date is required'),
  vendor_id: z.string().optional(),
  description: z
    .string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
  invoice_number: z.string().optional(),
  status: z.string().optional(),
  receipt: z
    .custom<File | null | undefined>(
      (val) =>
        val === undefined ||
        val === null ||
        (typeof File !== 'undefined' && val instanceof File),
      'Invalid file format'
    )
    .optional()
    .refine(
      (file) => !file || file.size <= MAX_FILE_SIZE,
      'Receipt file size must not exceed 10MB'
    )
    .refine(
      (file) =>
        !file || (ALLOWED_FILE_TYPES as readonly string[]).includes(file.type),
      'Only PNG, JPEG, and PDF files are allowed'
    ),
})

export type CreateExpenseSchemaType = z.infer<typeof createExpenseSchema>
