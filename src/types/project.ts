export interface Project {
  id: string
  name: string
  description: string | null
  total_budget: number
  start_date: string | null
  expected_end_date: string | null
  created_at: string
  updated_at: string
}
