import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/constants/queryKeys'
import { createCategory } from '@/services/category.service'
import type { CreateCategoryRequest } from '@/types/category'

/**
 * Custom React Query mutation hook for creating a new project category.
 *
 * Steps on Success:
 * - Invalidates Expense Categories cache
 * - Invalidates Dashboard cache
 * - Invalidates Expense Category Summary cache
 */
export function useCreateCategoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateCategoryRequest) => createCategory(request),
    onSuccess: () => {
      // Invalidate category cache for current and all projects
      queryClient.invalidateQueries({ queryKey: queryKeys.expenseCategories })
      // Invalidate dashboard queries
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
      queryClient.invalidateQueries({ queryKey: queryKeys.expenseCategorySummary })
    },
  })
}
