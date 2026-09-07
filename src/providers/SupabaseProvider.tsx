import type { ReactNode } from 'react'
import { SupabaseContext } from './SupabaseContext'
import { supabase } from '@/services/supabase'

export interface SupabaseProviderProps {
  children: ReactNode
}

export function SupabaseProvider({ children }: SupabaseProviderProps) {
  return (
    <SupabaseContext.Provider
      value={{
        supabase,
        isConfigured: true,
      }}
    >
      {children}
    </SupabaseContext.Provider>
  )
}
