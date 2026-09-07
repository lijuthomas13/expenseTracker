import { supabase } from '@/lib/supabase/client'
import type { ExpenseCategory } from '@/types/category'

/**
 * Service function to retrieve all active expense categories for a given project.
 * Directly communicates with Supabase and throws any client/network errors.
 * No React code or state resides in this service layer.
 */
export async function getExpenseCategories(projectId: string): Promise<ExpenseCategory[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('project_id', projectId)
    .eq('is_active', true)
    .order('name')

  if (error) {
    throw error
  }

  return (data ?? []) as ExpenseCategory[]
}
