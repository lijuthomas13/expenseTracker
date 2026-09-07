import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { queryKeys } from '@/constants/queryKeys'
import { getExpenses } from '@/services/expense.service'
import type { PaginatedExpensesResponse } from '@/types/expense.types'

/**
 * Custom React Query hook to fetch paginated expenses for a project.
 *
 * Query Key: [...queryKeys.expenses, projectId, page, pageSize]
 * Cache Configuration:
 * - placeholderData: keepPreviousData (avoids table flickering on page transitions)
 * - staleTime: 2 minutes (120,000 ms)
 * - gcTime: 30 minutes (1,800,000 ms)
 * - enabled: Boolean(projectId)
 *
 * Architecture: Component -> Hook -> Service -> Supabase Client
 */
export function useExpensesQuery(projectId: string, page: number, pageSize: number) {
  return useQuery<PaginatedExpensesResponse, Error>({
    queryKey: [...queryKeys.expenses, projectId, page, pageSize],
    queryFn: () => getExpenses(projectId, page, pageSize),
    placeholderData: keepPreviousData,
    enabled: Boolean(projectId),
    staleTime: 2 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}
