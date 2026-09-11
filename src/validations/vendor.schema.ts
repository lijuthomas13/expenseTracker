import { z } from 'zod'

export const createVendorSchema = z.object({
  name: z
    .string()
    .min(1, 'Vendor / Contractor name is required')
    .max(100, 'Vendor name cannot exceed 100 characters')
    .trim(),
  phone: z
    .string()
    .max(25, 'Phone number cannot exceed 25 characters')
    .nullable()
    .optional(),
  vendorType: z
    .string()
    .max(50, 'Vendor type cannot exceed 50 characters')
    .nullable()
    .optional(),
  notes: z
    .string()
    .max(500, 'Notes cannot exceed 500 characters')
    .nullable()
    .optional(),
})

export type CreateVendorSchemaType = z.infer<typeof createVendorSchema>
