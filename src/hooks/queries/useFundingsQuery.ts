import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { queryKeys } from '@/constants/queryKeys'
import { getFundings } from '@/services/funding.service'
import type { PaginatedFundingsResponse } from '@/types/funding.types'

/**
 * Custom React Query hook to fetch paginated fundings for a project.
 *
 * Query Key: [...queryKeys.fundings, projectId, page, pageSize]
 * Cache Configuration:
 * - placeholderData: keepPreviousData
 * - staleTime: 2 minutes (120,000 ms)
 * - gcTime: 30 minutes (1,800,000 ms)
 * - enabled: Boolean(projectId)
 */
export function useFundingsQuery(
  projectId: string,
  page: number,
  pageSize: number
) {
  return useQuery<PaginatedFundingsResponse, Error>({
    queryKey: [...queryKeys.fundings, projectId, page, pageSize],
    queryFn: () => getFundings(projectId, page, pageSize),
    placeholderData: keepPreviousData,
    enabled: Boolean(projectId),
    staleTime: 2 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}
