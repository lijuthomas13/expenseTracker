import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/constants/queryKeys'
import { createFunding } from '@/services/funding.service'
import type { CreateFundingRequest, CreateFundingResponse } from '@/types/funding.types'

/**
 * Custom React Query mutation hook for recording new project funding.
 *
 * Steps on Success:
 * - Invalidates fundings queries
 * - Invalidates dashboard queries
 * - Invalidates project summary queries
 */
export function useCreateFundingMutation() {
  const queryClient = useQueryClient()

  return useMutation<CreateFundingResponse, Error, CreateFundingRequest>({
    mutationFn: (request: CreateFundingRequest) => createFunding(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fundings })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
      queryClient.invalidateQueries({ queryKey: queryKeys.projectSummary })
    },
  })
}
