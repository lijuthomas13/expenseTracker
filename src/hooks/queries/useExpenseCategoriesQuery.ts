import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/constants/queryKeys'
import { getExpenseCategories } from '@/services/category.service'
import type { ExpenseCategory } from '@/types/category'

/**
 * Custom React Query hook to fetch active expense categories for a given project.
 * Implements the architecture: Component -> Hook -> Service -> Supabase Client.
 *
 * Cache settings:
 * - staleTime: 10 minutes (600,000 ms)
 * - gcTime: 30 minutes (1,800,000 ms)
 * - enabled: Only executes when projectId is truthy
 */
export function useExpenseCategoriesQuery(projectId: string) {
  return useQuery<ExpenseCategory[], Error>({
    queryKey: [...queryKeys.expenseCategories, projectId],
    queryFn: () => getExpenseCategories(projectId),
    enabled: Boolean(projectId),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}
