import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/constants/queryKeys'
import { getTotalFunding } from '@/services/funding.service'

/**
 * Custom React Query hook to fetch aggregated total funding for a project.
 *
 * Query Key: [...queryKeys.fundings, 'total', projectId]
 * Cache Configuration:
 * - staleTime: 2 minutes
 * - enabled: Boolean(projectId)
 */
export function useTotalFundingQuery(projectId: string) {
  return useQuery<number, Error>({
    queryKey: [...queryKeys.fundings, 'total', projectId],
    queryFn: () => getTotalFunding(projectId),
    enabled: Boolean(projectId),
    staleTime: 2 * 60 * 1000,
  })
}
