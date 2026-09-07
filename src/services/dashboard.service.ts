import { supabase } from '@/lib/supabase/client'
import type { ExpenseCategorySummary } from '@/types/category'

/**
 * Service function to retrieve aggregated expense sums categorized for a given project.
 * Directly invokes the Supabase RPC `get_expense_by_category`.
 *
 * Requirements:
 * - Communicates directly with Supabase client (no React code or state).
 * - Throws any Supabase errors encountered.
 * - Returns only the data array.
 */
export async function getExpenseByCategory(projectId: string): Promise<ExpenseCategorySummary[]> {
  const { data, error } = await supabase.rpc(
    'get_expense_by_category',
    {
      p_project_id: projectId,
    }
  )

  if (error) {
    throw error
  }

  return (data ?? []) as ExpenseCategorySummary[]
}
