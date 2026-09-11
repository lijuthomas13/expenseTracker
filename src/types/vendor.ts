export interface Vendor {
  id: string
  project_id: string
  name: string
  phone?: string | null
  vendor_type?: string | null
  notes?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateVendorRequest {
  projectId: string
  name: string
  phone?: string | null
  vendorType?: string | null
  notes?: string | null
}
