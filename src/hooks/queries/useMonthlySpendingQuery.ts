import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/constants/queryKeys'
import { getMonthlySpending } from '@/services/dashboard.service'
import type { MonthlySpendItem, RawExpenseSpend } from '@/types/expense.types'

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/**
 * Transforms raw Supabase expense records into chronological monthly spend items
 * formatted for the Recharts spending trend chart.
 */
export function aggregateMonthlySpending(
  rawExpenses: RawExpenseSpend[],
  startDate?: string,
  endDate?: string,
  targetBudget?: number
): MonthlySpendItem[] {
  // If date bounds are provided, pre-populate continuous monthly buckets
  if (startDate && endDate) {
    const [startYear, startMonth] = startDate.split('-').map(Number)
    const [endYear, endMonth] = endDate.split('-').map(Number)

    if (startYear && startMonth && endYear && endMonth) {
      const buckets: { key: string; label: string; spent: number; target?: number }[] = []
      let curYear = startYear
      let curMonth = startMonth

      while (curYear < endYear || (curYear === endYear && curMonth <= endMonth)) {
        const monthKey = `${curYear}-${String(curMonth).padStart(2, '0')}`
        const label = MONTH_NAMES[curMonth - 1] || monthKey
        buckets.push({
          key: monthKey,
          label,
          spent: 0,
        })

        curMonth++
        if (curMonth > 12) {
          curMonth = 1
          curYear++
        }
      }

      // Assign monthly target if target budget is specified
      const monthlyTarget = targetBudget && buckets.length > 0
        ? Math.round(targetBudget / Math.max(1, buckets.length))
        : undefined

      // Aggregate spend into buckets
      for (const exp of rawExpenses) {
        if (!exp.expense_date) continue
        const expMonthKey = exp.expense_date.slice(0, 7)
        const bucket = buckets.find((b) => b.key === expMonthKey)
        if (bucket) {
          bucket.spent += Number(exp.amount ?? 0)
        }
      }

      return buckets.map((b) => ({
        month: b.label,
        spent: b.spent,
        target: monthlyTarget,
      }))
    }
  }

  // Fallback when dates are not specified: group existing records chronologically
  if (rawExpenses.length === 0) {
    return []
  }

  const spendMap = new Map<string, number>()
  for (const exp of rawExpenses) {
    if (!exp.expense_date) continue
    const key = exp.expense_date.slice(0, 7)
    spendMap.set(key, (spendMap.get(key) ?? 0) + Number(exp.amount ?? 0))
  }

  const sortedKeys = Array.from(spendMap.keys()).sort()
  const monthlyTarget = targetBudget && sortedKeys.length > 0
    ? Math.round(targetBudget / Math.max(1, sortedKeys.length))
    : undefined

  return sortedKeys.map((key) => {
    const [, m] = key.split('-').map(Number)
    const label = MONTH_NAMES[m - 1] || key
    return {
      month: label,
      spent: spendMap.get(key) ?? 0,
      target: monthlyTarget,
    }
  })
}

/**
 * Custom React Query hook to fetch and aggregate monthly spending data for a project.
 *
 * Query Key: [...queryKeys.monthlySpending, projectId, startDate, endDate]
 * Cache Configuration:
 * - staleTime: 5 minutes (300,000 ms)
 * - gcTime: 30 minutes (1,800,000 ms)
 * - enabled: Boolean(projectId)
 *
 * Architecture: Component -> Hook -> Service -> Supabase Client
 */
export function useMonthlySpendingQuery(
  projectId: string,
  startDate?: string,
  endDate?: string,
  targetBudget?: number
) {
  return useQuery<RawExpenseSpend[], Error, MonthlySpendItem[]>({
    queryKey: [...queryKeys.monthlySpending, projectId, startDate, endDate],
    queryFn: () => getMonthlySpending(projectId, startDate, endDate),
    select: (raw) => aggregateMonthlySpending(raw, startDate, endDate, targetBudget),
    enabled: Boolean(projectId),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}
