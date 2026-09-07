import { useContext } from 'react'
import { SupabaseContext, type SupabaseContextType } from '@/providers/SupabaseContext'

export function useSupabase(): SupabaseContextType {
  const context = useContext(SupabaseContext)
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}
