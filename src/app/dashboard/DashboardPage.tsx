import { useState, useMemo } from 'react'
import {
  Calendar,
  CreditCard,
  Download,
  Filter,
  Landmark,
  MapPin,
  PiggyBank,
  TrendingUp,
  UserPlus,
  ArrowRight,
  Tags,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import type { ColumnDef } from '@tanstack/react-table'

import { PageContainer } from '@/components/common/PageContainer'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/common/DataTable'
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay'
import { DateDisplay } from '@/components/common/DateDisplay'
import { AddExpenseButton } from '@/components/common/AddExpenseButton'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { CategoryIcon } from '@/components/common/CategoryIcon'
import { useActiveProject } from '@/hooks/useActiveProject'
import {
  useExpenseByCategoryQuery,
  useExpensesQuery,
  useMonthlySpendingQuery,
} from '@/hooks/queries'
import { formatDate } from '@/utils/formatters'
import { cn } from '@/lib/utils'
import {
  KEY_CONTRACTORS,
  CONSTRUCTION_MILESTONES,
} from '@/constants/mockData'
import type { Expense } from '@/types/expense.types'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

export function DashboardPage() {
  const [activePeriod, setActivePeriod] = useState<'12m' | 'quarter' | 'custom'>('12m')
  const [filterQuery, setFilterQuery] = useState('')

  // Dynamically fetched Project from Supabase via React Query Hooks
  const {
    activeProject,
    isLoadingProjects,
  } = useActiveProject()

  // Query categorized expense totals via Supabase RPC get_expense_by_category
  const {
    data: categoryExpenses,
    isLoading: isLoadingCategoryExpenses,
    isError: isCategoryExpensesError,
    error: categoryExpensesError,
    refetch: refetchCategoryExpenses,
  } = useExpenseByCategoryQuery(activeProject?.id ?? '')

  // Date range for Monthly Spending Trend (aligned with project dates or continuous 12m window)
  const { startDate, endDate } = useMemo(() => {
    const now = new Date()
    const defaultStart = new Date(now.getFullYear(), now.getMonth() - 11, 1)
    const defaultEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const formatDateStr = (d: Date) => {
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${day}`
    }

    return {
      startDate: activeProject?.start_date || formatDateStr(defaultStart),
      endDate: activeProject?.expected_end_date || formatDateStr(defaultEnd),
    }
  }, [activeProject?.start_date, activeProject?.expected_end_date])

  // Query monthly spending trend from Supabase
  const {
    data: monthlySpendData = [],
    isLoading: isLoadingMonthlySpend,
    isError: isMonthlySpendError,
    error: monthlySpendError,
    refetch: refetchMonthlySpend,
  } = useMonthlySpendingQuery(
    activeProject?.id ?? '',
    startDate,
    endDate,
    activeProject?.total_budget
  )

  // Query recent 10 expenses for ledger preview
  const {
    data: recentExpensesResponse,
    isLoading: isLoadingRecentExpenses,
    isError: isRecentExpensesError,
    error: recentExpensesError,
    refetch: refetchRecentExpenses,
  } = useExpensesQuery(activeProject?.id ?? '', 1, 10)

  // Dynamic monthly average spend from real data
  const avgMonthlySpend = useMemo(() => {
    if (monthlySpendData.length === 0) return 0
    const total = monthlySpendData.reduce((sum, item) => sum + item.spent, 0)
    return Math.round(total / monthlySpendData.length)
  }, [monthlySpendData])

  // Total expense across categories (no client-side grouping/aggregation)
  const totalCategoryExpense = useMemo(() => {
    return (categoryExpenses ?? []).reduce((sum, item) => sum + item.total_expense, 0)
  }, [categoryExpenses])

  // Define columns for Recent Expenses DataTable
  const columns = useMemo<ColumnDef<Expense, unknown>[]>(
    () => [
      {
        accessorKey: 'expense_date',
        header: 'Date',
        cell: ({ row }) => (
          <DateDisplay
            date={row.original.expense_date}
            format="medium"
            className="text-xs sm:text-sm font-medium whitespace-nowrap"
          />
        ),
      },
      {
        id: 'category',
        header: 'Category',
        cell: ({ row }) => {
          const cat = row.original.category
          return (
            <div className="flex items-center gap-2 min-w-0">
              <CategoryIcon
                icon={cat?.icon}
                color={cat?.color}
                size="sm"
                withBackground
              />
              <span className="font-medium text-xs sm:text-sm text-foreground truncate max-w-[130px]">
                {cat?.name ?? 'General'}
              </span>
            </div>
          )
        },
      },
      {
        id: 'vendor',
        header: 'Payee / Vendor',
        cell: ({ row }) => (
          <span className="font-medium text-foreground text-xs sm:text-sm truncate block max-w-[140px]">
            {row.original.vendor?.name || '—'}
          </span>
        ),
      },
      {
        id: 'payment_method',
        header: 'Method',
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {row.original.payment_method?.name || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'amount',
        header: () => <div className="text-right">Amount</div>,
        cell: ({ row }) => (
          <div className="text-right">
            <CurrencyDisplay
              amount={row.original.amount}
              className="font-bold text-foreground text-xs sm:text-sm"
            />
          </div>
        ),
      },
    ],
    []
  )

  const recentExpenses = useMemo(() => {
    return recentExpensesResponse?.data ?? []
  }, [recentExpensesResponse])

  const filteredExpenses = useMemo(() => {
    if (!filterQuery) return recentExpenses
    const q = filterQuery.toLowerCase()
    return recentExpenses.filter(
      (e) =>
        (e.vendor?.name?.toLowerCase().includes(q) ?? false) ||
        (e.category?.name?.toLowerCase().includes(q) ?? false) ||
        (e.payment_method?.name?.toLowerCase().includes(q) ?? false) ||
        (e.description?.toLowerCase().includes(q) ?? false)
    )
  }, [recentExpenses, filterQuery])

  const handleExportLedger = () => {
    toast.info('Generating PDF & CSV Ledger Export...')
  }

  return (
    <PageContainer className="space-y-6 pb-12">
      {/* 1. Project Hero Banner (Dynamically populated from useProjectsQuery) */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-level-1 transition-all">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
          {/* Left: Dynamic Project title, status badge & metadata */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-3">
              {isLoadingProjects ? (
                <div className="h-8 w-72 bg-muted-foreground/20 rounded animate-pulse" />
              ) : (
                <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  {activeProject?.name ?? 'Home Construction Project'}
                </h1>
              )}
              {/* <Badge variant="success" dot className="font-medium">
                Structural Execution Active
              </Badge> */}
            </div>

            <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs sm:text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground/80" />
                {activeProject?.start_date
                  ? `Started ${formatDate(activeProject.start_date, { format: 'medium' })}`
                  : 'Started Jan 2024'}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground/80" />
                {activeProject?.expected_end_date
                  ? `Target: ${formatDate(activeProject.expected_end_date, { format: 'medium' })}`
                  : 'Target: Nov 2024'}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground/80" />
                {activeProject?.description ? activeProject.description : 'Site: Sector 48, Gurgaon'}
              </span>
            </div>
          </div>

          {/* Right: Period segmented controls & action buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* <div className="inline-flex items-center rounded-lg border border-border bg-muted/60 p-1 text-xs font-medium">
              <button
                type="button"
                onClick={() => setActivePeriod('12m')}
                className={`rounded-md px-3 py-1.5 transition-all ${
                  activePeriod === '12m'
                    ? 'bg-card text-foreground font-semibold shadow-level-1'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Last 12 Months
              </button>
              <button
                type="button"
                onClick={() => setActivePeriod('quarter')}
                className={`rounded-md px-3 py-1.5 transition-all ${
                  activePeriod === 'quarter'
                    ? 'bg-card text-foreground font-semibold shadow-level-1'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                This Quarter
              </button>
              <button
                type="button"
                onClick={() => setActivePeriod('custom')}
                className={`rounded-md px-3 py-1.5 transition-all ${
                  activePeriod === 'custom'
                    ? 'bg-card text-foreground font-semibold shadow-level-1'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Custom
              </button>
            </div>

            <Button
              variant="secondary"
              size="sm"
              className="gap-1.5"
              onClick={() => toast.info('Filter categories')}
            >
              <Filter className="h-3.5 w-3.5" />
              <span>Categories</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              className="gap-1.5"
              onClick={handleExportLedger}
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Ledger</span>
            </Button> */}

            <AddExpenseButton customLabel="New Expense" />
          </div>
        </div>
      </div>

      {/* 2. KPI Summary Cards (4 Cards Row) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Budget (Dynamic from activeProject) */}
        <Card className="hover:shadow-level-2 transition-shadow">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="label-sm text-muted-foreground">Total Budget</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-primary border border-indigo-100 dark:bg-indigo-950/50 dark:border-indigo-800">
                <Landmark className="h-4 w-4" />
              </div>
            </div>
            <div>
              {isLoadingProjects ? (
                <div className="h-9 w-36 bg-muted-foreground/20 rounded animate-pulse" />
              ) : (
                <CurrencyDisplay
                  amount={activeProject?.total_budget ?? 0}
                  className="font-display text-2xl sm:text-3xl font-bold text-foreground"
                />
              )}
            </div>
            <div className="space-y-1.5 pt-1">
              {/* <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Allocated capital</span>
                <span className="font-semibold text-foreground">100% Baseline</span>
              </div> */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary w-full" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Spent */}
        <Card className="hover:shadow-level-2 transition-shadow">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="label-sm text-muted-foreground">Total Spent</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-950/50 dark:border-blue-800">
                <CreditCard className="h-4 w-4" />
              </div>
            </div>
            <div>
              {isLoadingCategoryExpenses ? (
                <div className="h-9 w-32 bg-muted-foreground/20 rounded animate-pulse" />
              ) : (
                <CurrencyDisplay
                  amount={totalCategoryExpense}
                  className="font-display text-2xl sm:text-3xl font-bold text-foreground"
                />
              )}
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-muted-foreground">
                <strong className="font-semibold text-foreground">
                  {activeProject?.total_budget
                    ? ((totalCategoryExpense / activeProject.total_budget) * 100).toFixed(1)
                    : '0.0'}%
                </strong>{' '}
                utilized
              </span>
              {/* <Badge variant="primary" className="text-[11px] font-semibold py-0.5">
                <TrendingUp className="h-3 w-3 mr-1" />
                Live RPC
              </Badge> */}
            </div>
          </CardContent>
        </Card>

        {/* Remaining Balance */}
        <Card className="hover:shadow-level-2 transition-shadow">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="label-sm text-muted-foreground">Remaining Balance</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/50 dark:border-emerald-800">
                <PiggyBank className="h-4 w-4" />
              </div>
            </div>
            <div>
              {isLoadingCategoryExpenses || isLoadingProjects ? (
                <div className="h-9 w-32 bg-muted-foreground/20 rounded animate-pulse" />
              ) : (
                <CurrencyDisplay
                  amount={(activeProject?.total_budget ?? 0) - totalCategoryExpense}
                  className="font-display text-2xl sm:text-3xl font-bold text-[#059669] dark:text-[#34d399]"
                />
              )}
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-muted-foreground">
                <strong className="font-semibold text-foreground">
                  {activeProject?.total_budget
                    ? (((activeProject.total_budget - totalCategoryExpense) / activeProject.total_budget) * 100).toFixed(1)
                    : '100'}%
                </strong>{' '}
                contingency
              </span>
              {/* <Badge variant="success" dot className="font-semibold">
                On Track
              </Badge> */}
            </div>
          </CardContent>
        </Card>

        {/* October Spend */}
        {/* <Card className="hover:shadow-level-2 transition-shadow">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="label-sm text-muted-foreground">October Spend</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-950/50 dark:border-amber-800">
                <Calendar className="h-4 w-4" />
              </div>
            </div>
            <div>
              <CurrencyDisplay
                amount={142000}
                className="font-display text-2xl sm:text-3xl font-bold text-foreground"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
              <span>Current billing cycle</span>
              <span className="font-semibold text-foreground">14 Transactions</span>
            </div>
          </CardContent>
        </Card> */}
      </div>

      {/* 3. Middle Analytical Section (Monthly Trend + Category Breakdown) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Monthly Spending Trend (2 cols) */}
        <Card className="lg:col-span-2 flex flex-col justify-between">
          <div className="p-5 sm:p-6 pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2.5">
                  <h3 className="font-display text-base font-semibold text-foreground">
                    Monthly Spending Trend
                  </h3>
                  <Badge variant="primary" className="text-[11px]">
                    Avg: ₹{avgMonthlySpend >= 100000
                      ? `${(avgMonthlySpend / 100000).toFixed(2)}L`
                      : avgMonthlySpend.toLocaleString()}/mo
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Cash outflow across 12 construction billing cycles
                </p>
              </div>

              {/* Chart Legend */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-xs bg-primary" />
                  Spent (₹)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-0.5 w-3 bg-blue-500 rounded" />
                  Target Curve
                </span>
              </div>
            </div>

            {/* Recharts Composed Chart with Loading/Error/Empty states */}
            {isLoadingMonthlySpend ? (
              <div className="h-64 sm:h-72 flex flex-col items-center justify-center gap-2">
                <LoadingSpinner size="md" label="Loading monthly spending..." />
                <span className="text-xs text-muted-foreground">Fetching project disbursements...</span>
              </div>
            ) : isMonthlySpendError ? (
              <div className="h-64 sm:h-72 flex flex-col items-center justify-center text-center p-4 gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive border border-destructive/20">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-foreground">Failed to load spending trend</p>
                  <p className="text-[11px] text-muted-foreground max-w-xs">
                    {monthlySpendError?.message || 'An unexpected error occurred while querying Supabase.'}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => refetchMonthlySpend()}
                  className="gap-1.5 h-7 text-xs"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Retry</span>
                </Button>
              </div>
            ) : monthlySpendData.length === 0 ? (
              <div className="h-64 sm:h-72 flex flex-col items-center justify-center text-center p-4">
                <p className="text-xs font-semibold text-foreground">No spending recorded</p>
                <p className="text-[11px] text-muted-foreground max-w-xs mt-1">
                  Paid disbursements for this project will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="h-64 sm:h-72 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={monthlySpendData}
                    margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="month"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val: number) => `₹${val / 1000}k`}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-xl border border-border bg-slate-900 text-white p-3 shadow-level-3 text-xs space-y-1">
                              <p className="font-bold">
                                {label}: ₹{(payload[0]?.value as number)?.toLocaleString()}
                              </p>
                              <p className="text-slate-300 text-[11px]">
                                Monthly Disbursement
                              </p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Bar
                      dataKey="spent"
                      fill="#4f46e5"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={32}
                    />
                    <Line
                      type="monotone"
                      dataKey="target"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Bottom Trend Note */}
          <div className="border-t border-border/70 px-5 sm:px-6 py-3 bg-muted/30 flex items-center justify-between text-xs rounded-b-xl">
            <span className="text-muted-foreground inline-flex items-center gap-1.5">
              <span className="text-emerald-600 font-bold">✓</span>
              12 of 14 target phase disbursements executed within ±4%
            </span>
            <Link
              to={ROUTES.REPORTS}
              className="font-medium text-primary hover:underline inline-flex items-center gap-1"
            >
              Explore Trend Reports <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </Card>

        {/* Expense by Category (1 col Donut Chart - dynamically wired to useExpenseByCategoryQuery) */}
        <Card className="flex flex-col justify-between">
          <div className="p-5 sm:p-6 pb-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="font-display text-base font-semibold text-foreground">
                  Expense by Category
                </h3>
                <p className="text-xs text-muted-foreground">
                  {isLoadingCategoryExpenses
                    ? 'Loading category breakdown...'
                    : categoryExpenses && categoryExpenses.length > 0
                      ? `Disbursement across ${categoryExpenses.length} categories`
                      : 'No expense records found'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="iconSm"
                aria-label="Refresh categories"
                onClick={() => refetchCategoryExpenses()}
              >
                <RefreshCw
                  className={cn(
                    'h-4 w-4 text-muted-foreground transition-transform',
                    isLoadingCategoryExpenses && 'animate-spin text-primary'
                  )}
                />
              </Button>
            </div>

            {/* Loading / Error / Empty / Success Donut Chart States */}
            {isLoadingCategoryExpenses ? (
              <div className="h-64 flex flex-col items-center justify-center gap-2">
                <LoadingSpinner size="md" label="Loading category expenses..." />
                <span className="text-xs text-muted-foreground">Fetching project category totals...</span>
              </div>
            ) : isCategoryExpensesError ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-4 gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive border border-destructive/20">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-foreground">Failed to load category expenses</p>
                  <p className="text-[11px] text-muted-foreground max-w-xs">
                    {categoryExpensesError?.message || 'An unexpected error occurred while querying Supabase RPC.'}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => refetchCategoryExpenses()}
                  className="gap-1.5 h-7 text-xs"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Retry</span>
                </Button>
              </div>
            ) : categoryExpenses && categoryExpenses.length > 0 ? (
              <>
                {/* Donut Chart with Center Total */}
                <div className="relative h-52 w-full mt-2 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryExpenses}
                        dataKey="total_expense"
                        nameKey="category_name"
                        innerRadius={58}
                        outerRadius={84}
                        paddingAngle={3}
                      >
                        {categoryExpenses.map((entry) => (
                          <Cell
                            key={`cell-${entry.category_id}`}
                            fill={entry.color || '#4f46e5'}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [
                          `₹${Number(value ?? 0).toLocaleString()}`,
                          'Total Expense',
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                      Total
                    </span>
                    <CurrencyDisplay
                      amount={totalCategoryExpense}
                      className="font-display text-base font-bold text-foreground"
                    />
                    <span className="text-[10px] text-muted-foreground">
                      {categoryExpenses.length} Categories
                    </span>
                  </div>
                </div>

                {/* Categories Breakdown List: Shows Icon, Name, Total Expense, Color */}
                <div className="space-y-2 pt-2 max-h-48 overflow-y-auto pr-1">
                  {categoryExpenses.map((cat) => {
                    const percentage =
                      totalCategoryExpense > 0
                        ? Math.round((cat.total_expense / totalCategoryExpense) * 100)
                        : 0

                    return (
                      <div
                        key={cat.category_id}
                        className="flex items-center justify-between text-xs py-1"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <CategoryIcon
                            icon={cat.icon}
                            color={cat.color}
                            size="sm"
                            withBackground
                          />
                          <div className="truncate">
                            <span className="text-foreground font-medium truncate block max-w-[130px] sm:max-w-[150px]">
                              {cat.category_name}
                            </span>
                            <span className="text-muted-foreground text-[10px]">
                              {percentage}% of total
                            </span>
                          </div>
                        </div>
                        <CurrencyDisplay
                          amount={cat.total_expense}
                          className="font-semibold text-foreground shrink-0"
                        />
                      </div>
                    )
                  })}
                </div>
              </>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground mb-2">
                  <Tags className="h-5 w-5" />
                </div>
                <p className="text-xs font-medium text-foreground">No expenses recorded</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Record new disbursements to populate the category expense breakdown.
                </p>
                <Link
                  to={ROUTES.EXPENSES}
                  className="mt-3 text-xs font-semibold text-primary hover:underline"
                >
                  View Expenses Ledger →
                </Link>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* 4. Lower Section (Key Contractors + Recent Expenses Table) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* <Card className="flex flex-col justify-between">
          <div className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-base font-semibold text-foreground">
                  Key Contractors
                </h3>
                <p className="text-xs text-muted-foreground">
                  4 primary site partners
                </p>
              </div>
              <Link
                to={ROUTES.SETTINGS_VENDORS}
                className="text-xs font-semibold text-primary hover:underline"
              >
                View All (18)
              </Link>
            </div>

            <div className="space-y-3">
              {KEY_CONTRACTORS.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-border/70 bg-card hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-200 dark:bg-indigo-950 dark:border-indigo-800 dark:text-indigo-300">
                      {c.initials}
                    </div>
                    <div className="space-y-0.5">
                      <div className="font-semibold text-xs text-foreground truncate max-w-[120px] sm:max-w-[150px]">
                        {c.name}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate max-w-[120px] sm:max-w-[150px]">
                        {c.specialty}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {c.contractsCount} Contracts • {c.invoicesCount} Invoices
                      </div>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <CurrencyDisplay
                      amount={c.totalPaid}
                      className="text-xs font-bold text-foreground block"
                    />
                    {c.status === 'settled' ? (
                      <Badge variant="success" className="text-[10px] px-1.5 py-0">
                        100% Settled
                      </Badge>
                    ) : c.status === 'completed' ? (
                      <Badge variant="success" className="text-[10px] px-1.5 py-0">
                        Completed
                      </Badge>
                    ) : (
                      <span className="text-[10px] font-semibold text-emerald-600 block">
                        {c.progressPercentage}% Milestone
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-border/70 bg-muted/20">
            <Button
              variant="outline"
              className="w-full text-xs font-medium gap-1.5"
              onClick={() => toast.info('Register contractor workflow')}
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Register New Contractor</span>
            </Button>
          </div>
        </Card> */}

        {/* Right: Recent Expenses Table (2 cols) */}
        <Card className="lg:col-span-5 flex flex-col justify-between">
          <div className="p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="font-display text-base font-semibold text-foreground">
                  Recent Expenses
                </h3>
                <p className="text-xs text-muted-foreground">
                  Real-time ledger audit log
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Filter ledger..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="h-8 rounded-lg border border-border bg-card px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary w-36 sm:w-44"
                />
                <Link
                  to={ROUTES.EXPENSES}
                  className="text-xs font-semibold text-primary hover:underline whitespace-nowrap"
                >
                  View Full Ledger
                </Link>
              </div>
            </div>

            {/* DataTable component */}
            <DataTable
              columns={columns}
              data={filteredExpenses}
              isLoading={isLoadingRecentExpenses}
              emptyTitle={isRecentExpensesError ? 'Failed to load expenses' : 'No recent expenses'}
              emptyDescription={
                recentExpensesError?.message ||
                'No expenses recorded for this project yet.'
              }
              totalCount={recentExpensesResponse?.count ?? filteredExpenses.length}
              pageSize={10}
            />
          </div>
        </Card>
      </div>

      {/* 5. Construction Phase Inspection Cards (Bottom 3 Cards) */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {CONSTRUCTION_MILESTONES.map((milestone) => (
          <Card key={milestone.id} className="overflow-hidden hover:shadow-level-2 transition-all group">
            <div className="p-4 pb-3 flex items-center justify-between">
              <div className="font-display text-sm font-semibold text-foreground">
                {milestone.title}
              </div>
              <Badge
                variant={
                  milestone.badgeVariant === 'success'
                    ? 'success'
                    : milestone.badgeVariant === 'primary'
                      ? 'primary'
                      : 'warning'
                }
                className="text-[10px]"
              >
                {milestone.badgeText}
              </Badge>
            </div>

            <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
              <img
                src={milestone.imageUrl}
                alt={milestone.title}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
              />
              <div className="absolute bottom-2.5 left-2.5 rounded-md bg-slate-900/85 px-2 py-1 text-[11px] font-medium text-white backdrop-blur-xs border border-white/10">
                {milestone.verificationDate}
              </div>
            </div>

            <CardContent className="p-4 text-xs text-muted-foreground leading-relaxed">
              {milestone.note}
            </CardContent>
          </Card>
        ))}
      </div> */}
    </PageContainer>
  )
}
