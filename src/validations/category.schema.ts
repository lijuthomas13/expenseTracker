import { z } from 'zod'

export const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Category name is required')
    .max(50, 'Category name cannot exceed 50 characters')
    .trim(),
  color: z
    .string()
    .min(1, 'Color hex code is required')
    .regex(HEX_COLOR_REGEX, 'Enter a valid hex color (e.g. #4F46E5 or #10B981)')
    .trim(),
  icon: z.string().nullable().optional(),
})

export type CreateCategorySchemaType = z.infer<typeof createCategorySchema>
