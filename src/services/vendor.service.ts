import { supabase } from '@/lib/supabase/client'
import type { Vendor, CreateVendorRequest } from '@/types/vendor'

/**
 * Service function to retrieve all active vendors for a project.
 * Directly communicates with Supabase and throws any client/network errors.
 */
export async function getVendors(projectId: string): Promise<Vendor[]> {
  const { data, error } = await supabase
    .from('vendors')
    .select(`
      id,
      project_id,
      name,
      phone,
      vendor_type,
      notes,
      is_active,
      created_at,
      updated_at
    `)
    .eq('project_id', projectId)
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (error) {
    throw error
  }

  return (data ?? []) as Vendor[]
}

/**
 * Service function to create a vendor record via Supabase RPC.
 */
export async function createVendor(
  request: CreateVendorRequest
) {
  const { data, error } = await supabase.rpc('create_vendor', {
    p_project_id: request.projectId,
    p_name: request.name,
    p_phone: request.phone ?? null,
    p_vendor_type: request.vendorType ?? null,
    p_notes: request.notes ?? null,
  })

  if (error) {
    throw error
  }

  return data
}

