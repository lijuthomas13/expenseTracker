import { supabase } from '@/lib/supabase/client'
import type { ExpenseCategory, CreateCategoryRequest } from '@/types/category'

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

/**
 * Service function to create a category record via Supabase RPC.
 */
export async function createCategory(
  request: CreateCategoryRequest
) {
  const { data, error } = await supabase.rpc(
    "create_category",
    {
      p_project_id: request.projectId,
      p_name: request.name,
      p_color: request.color,
      p_icon: request.icon,
    }
  );

  if (error) {
    throw error;
  }

  return data;
}

