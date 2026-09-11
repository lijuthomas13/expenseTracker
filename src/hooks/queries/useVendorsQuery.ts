import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/constants/queryKeys'
import { getVendors } from '@/services/vendor.service'
import type { Vendor } from '@/types/vendor'

/**
 * Custom React Query hook to fetch active vendors for a given project.
 * Architecture: Component -> Hook -> Service -> Supabase Client.
 */
export function useVendorsQuery(projectId?: string) {
  return useQuery<Vendor[], Error>({
    queryKey: projectId ? [...queryKeys.vendors, projectId] : queryKeys.vendors,
    queryFn: () => getVendors(projectId ?? ''),
    enabled: Boolean(projectId),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

