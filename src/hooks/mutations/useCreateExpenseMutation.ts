import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/constants/queryKeys'
import { createExpense } from '@/services/expense.service'
import type { CreateExpenseRequest, CreateExpenseResponse } from '@/types/expense'

/**
 * Custom React Query mutation hook for recording a new expense.
 *
 * Steps on Success:
 * - Invalidates Expenses queries
 * - Invalidates Dashboard queries (including categorized expenses)
 * - Invalidates Expense Category queries
 * - Invalidates Project Summary queries
 *
 * Uses centralized queryKeys directly.
 */
export function useCreateExpenseMutation() {
  const queryClient = useQueryClient()

  return useMutation<CreateExpenseResponse, Error, CreateExpenseRequest>({
    mutationFn: (request: CreateExpenseRequest) => createExpense(request),
    onSuccess: () => {
      // Invalidate expenses query cache
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses })
      // Invalidate dashboard query cache (which includes expense-by-category)
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
      // Invalidate expense categories cache
      queryClient.invalidateQueries({ queryKey: queryKeys.expenseCategories })
      // Invalidate project summary cache
      queryClient.invalidateQueries({ queryKey: queryKeys.projectSummary })
    },
  })
}
