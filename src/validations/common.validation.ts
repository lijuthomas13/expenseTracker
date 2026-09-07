import { z } from 'zod'

export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
})

export const searchFilterSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(['paid', 'pending', 'in_progress', 'completed', 'overrun', 'draft', 'all']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export type PaginationQuery = z.infer<typeof paginationSchema>
export type SearchFilterQuery = z.infer<typeof searchFilterSchema>
