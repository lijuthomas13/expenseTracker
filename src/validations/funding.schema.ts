import { z } from 'zod'
import {
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
} from './createExpense.schema'

/**
 * Zod validation schema for the Record Funding form.
 * Enforces strict validation rules:
 * - amount: required, number > 0
 * - funding_date: required
 * - payment_method_id: required
 * - funded_by: required (profile ID)
 * - description: optional, max 500 chars
 * - attachment: optional, PNG/JPEG/PDF up to 10MB
 */
export const fundingSchema = z.object({
  amount: z
    .number({ message: 'Amount is required and must be a valid number' })
    .positive('Amount must be greater than zero'),
  funding_date: z.string().min(1, 'Funding date is required'),
  payment_method_id: z.string().min(1, 'Payment method is required'),
  funded_by: z.string().min(1, 'Funded by is required'),
  description: z
    .string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
  attachment: z
    .custom<File | null | undefined>(
      (val) => typeof File !== 'undefined' && val instanceof File,
      'Receipt or proof of funding is required'
    )
    .refine(
      (file) => Boolean(file),
      'Receipt or proof of funding is required'
    )
    .refine(
      (file) => !file || file.size <= MAX_FILE_SIZE,
      'Attachment file size must not exceed 10MB'
    )
    .refine(
      (file) =>
        !file || (ALLOWED_FILE_TYPES as readonly string[]).includes(file.type),
      'Only PNG, JPEG, and PDF files are allowed'
    ),
})

export type FundingSchemaType = z.infer<typeof fundingSchema>
