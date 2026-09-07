export interface ExpenseCategory {
  id: string
  project_id: string
  name: string
  color: string
  icon: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ExpenseCategorySummary {
  category_id: string
  category_name: string
  color: string
  icon: string | null
  total_expense: number
}
