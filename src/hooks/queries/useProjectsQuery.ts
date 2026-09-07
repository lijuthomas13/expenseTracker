import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/constants/queryKeys'
import { getProjects } from '@/services/project.service'
import type { Project } from '@/types/project'

/**
 * Custom React Query hook to fetch all construction projects.
 * Implements the architecture: Component -> Hook -> Service -> Supabase Client.
 *
 * Cache settings:
 * - staleTime: 5 minutes (300,000 ms)
 * - gcTime: 30 minutes (1,800,000 ms)
 */
export function useProjectsQuery() {
  return useQuery<Project[], Error>({
    queryKey: queryKeys.projects,
    queryFn: getProjects,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}
