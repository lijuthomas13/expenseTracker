import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/constants/queryKeys'
import { createVendor } from '@/services/vendor.service'
import type { CreateVendorRequest } from '@/types/vendor'

/**
 * Custom React Query mutation hook for registering a new project vendor.
 *
 * Steps on Success:
 * - Invalidates Vendors cache
 * - Invalidates Expenses cache (so any vendor joins refresh)
 */
export function useCreateVendorMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateVendorRequest) => createVendor(request),
    onSuccess: () => {
      // Invalidate vendors query cache
      queryClient.invalidateQueries({ queryKey: queryKeys.vendors })
      // Invalidate expenses query cache
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses })
    },
  })
}
