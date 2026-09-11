/**
 * Centralized React Query keys following the standardized array tuple pattern.
 * Ensures consistent cache invalidation and query deduplication across the data access layer.
 */
export const queryKeys = {
  expenseCategories: ['expense-categories'] as const,
  projects: ['projects'] as const,
  dashboard: ['dashboard'] as const,
  expenses: ['expenses'] as const,
  paymentMethods: ['payment-methods'] as const,
  vendors: ['vendors'] as const,
  expenseCategorySummary: ['dashboard', 'expense-by-category'] as const,
  monthlySpending: ['dashboard', 'monthly-spending'] as const,
  projectSummary: ['project-summary'] as const,
} as const

