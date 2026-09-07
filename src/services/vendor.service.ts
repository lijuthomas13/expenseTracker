import { supabase } from '@/lib/supabase/client'
import type { Vendor } from '@/types/expense'

/**
 * Service function to retrieve vendors.
 * Directly communicates with Supabase and throws any client/network errors.
 * No React code resides in this service layer.
 */
export async function getVendors(projectId?: string): Promise<Vendor[]> {
  void projectId // Maintained for interface consistency across project-scoped services

  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    throw error
  }

  return (data ?? []) as Vendor[]
}
