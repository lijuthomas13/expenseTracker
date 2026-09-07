import { createContext } from 'react'
import { supabase, type SupabaseClientInstance } from '@/services/supabase'

export interface SupabaseContextType {
  supabase: SupabaseClientInstance
  isConfigured: boolean
}

export const SupabaseContext = createContext<SupabaseContextType>({
  supabase,
  isConfigured: true,
})
