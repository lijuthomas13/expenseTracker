import { supabase } from '@/lib/supabase/client'
import type { ExpenseCategorySummary } from '@/types/category'
import type { RawExpenseSpend } from '@/types/expense.types'

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

/**
 * Service function to retrieve paid expenses within a date range for monthly spend tracking.
 *
 * Requirements:
 * - Direct Supabase table query.
 * - Filters by project_id, status = 'Paid', deleted_at is null.
 * - Filters by expense_date range when provided.
 * - Orders by expense_date ascending.
 * - Throws any Supabase errors encountered.
 */
export async function getMonthlySpending(
  projectId: string,
  startDate?: string,
  endDate?: string
): Promise<RawExpenseSpend[]> {
  let query = supabase
    .from('expenses')
    .select('amount, expense_date')
    .eq('project_id', projectId)
    .eq('status', 'Paid')
    .is('deleted_at', null)

  if (startDate) {
    query = query.gte('expense_date', startDate)
  }

  if (endDate) {
    query = query.lte('expense_date', endDate)
  }

  const { data, error } = await query.order('expense_date', { ascending: true })

  if (error) {
    throw error
  }

  return (data ?? []) as RawExpenseSpend[]
}
