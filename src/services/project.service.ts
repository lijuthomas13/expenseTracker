import { supabase } from '@/lib/supabase/client'
import type { Project } from '@/types/project'

/**
 * Service function to retrieve all construction projects ordered by newest first.
 * Directly communicates with Supabase and throws any client/network errors.
 * No React code or state resides in this service layer.
 */
export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []) as Project[]
}
