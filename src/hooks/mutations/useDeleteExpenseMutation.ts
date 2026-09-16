import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { queryKeys } from '@/constants/queryKeys'
import { deleteExpense } from '@/services/expense.service'

/**
 * Custom React Query mutation hook for soft-deleting an expense.
 *
 * Steps on Success:
 * - Shows a success toast notification
 * - Invalidates paginated expenses queries (triggering automatic refetch of current page)
 * - Invalidates dashboard queries (updating metrics, monthly trends, category distributions)
 * - Invalidates project summary queries
 *
 * Error Handling:
 * - If the RPC returns false, alerts user that it may have already been deleted
 * - If network or RPC fails, alerts user gracefully without exposing raw DB errors
 */
export function useDeleteExpenseMutation() {
  const queryClient = useQueryClient()

  return useMutation<boolean, Error, string>({
    mutationFn: async (expenseId: string) => {
      const success = await deleteExpense(expenseId)
      if (!success) {
        throw new Error(
          'Expense could not be deleted. It may have already been deleted.'
        )
      }
      return success
    },
    onSuccess: () => {
      toast.success('Expense deleted successfully')

      // Invalidate paginated expenses query cache
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses })

      // Invalidate dashboard query cache (including expense-by-category and monthly trends)
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })

      // Invalidate project summary cache
      queryClient.invalidateQueries({ queryKey: queryKeys.projectSummary })
    },
    onError: (error: Error) => {
      const isAlreadyDeleted = error.message.includes('already been deleted')
      const message = isAlreadyDeleted
        ? 'Expense could not be deleted. It may have already been deleted.'
        : 'Failed to delete expense. Please try again.'
      toast.error(message)
    },
  })
}
