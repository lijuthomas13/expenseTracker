import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/constants/queryKeys'
import { getExpenseByCategory } from '@/services/dashboard.service'
import type { ExpenseCategorySummary } from '@/types/category'

/**
 * Custom React Query hook to fetch categorized expense totals for a project via Supabase RPC.
 *
 * Query Key: [...queryKeys.dashboard, 'expense-by-category', projectId]
 * Cache Configuration:
 * - staleTime: 5 minutes (300,000 ms)
 * - gcTime: 30 minutes (1,800,000 ms)
 * - enabled: Boolean(projectId)
 *
 * Architecture: Component -> Hook -> Service -> Supabase Client
 */
export function useExpenseByCategoryQuery(projectId: string) {
  return useQuery<ExpenseCategorySummary[], Error>({
    queryKey: [...queryKeys.dashboard, 'expense-by-category', projectId],
    queryFn: () => getExpenseByCategory(projectId),
    enabled: Boolean(projectId),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}
