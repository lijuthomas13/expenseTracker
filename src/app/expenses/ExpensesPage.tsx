import { useState, useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Receipt, Filter, Download, AlertCircle, RefreshCw } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'

import { PageContainer } from '@/components/common/PageContainer'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { DataTable } from '@/components/common/DataTable'
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay'
import { DateDisplay } from '@/components/common/DateDisplay'
import { StatusBadge } from '@/components/common/StatusBadge'
import { CategoryIcon } from '@/components/common/CategoryIcon'
import { AddExpenseButton } from '@/components/common/AddExpenseButton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useActiveProject } from '@/hooks/useActiveProject'
import { useExpensesQuery } from '@/hooks/queries'
import { queryKeys } from '@/constants/queryKeys'
import type { Expense } from '@/types/expense.types'

export function ExpensesPage() {
  const queryClient = useQueryClient()
  const { activeProject, isLoadingProjects } = useActiveProject()

  // Pagination state managed directly in component state
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [prevProjectId, setPrevProjectId] = useState(activeProject?.id)
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)

  // Reset pagination to page 1 during render when active project switches
  if (activeProject?.id !== prevProjectId) {
    setPrevProjectId(activeProject?.id)
    setPage(1)
  }

  // Fetch paginated expenses strictly via React Query -> Service -> Supabase architecture
  const {
    data: expensesResponse,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useExpensesQuery(activeProject?.id ?? '', page, pageSize)

  // Column definitions for TanStack Table
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
              <span className="font-medium text-xs sm:text-sm text-foreground truncate max-w-[140px]">
                {cat?.name ?? 'General'}
              </span>
            </div>
          )
        },
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => (
          <span
            className="text-xs text-muted-foreground block truncate max-w-[180px] sm:max-w-[260px]"
            title={row.original.description ?? undefined}
          >
            {row.original.description || '—'}
          </span>
        ),
      },
      {
        id: 'vendor',
        header: 'Vendor / Payee',
        cell: ({ row }) => (
          <span className="text-xs sm:text-sm font-medium text-foreground truncate max-w-[140px] block">
            {row.original.vendor?.name || '—'}
          </span>
        ),
      },
      {
        id: 'payment_method',
        header: 'Payment Method',
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground truncate block max-w-[120px]">
            {row.original.payment_method?.name || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <StatusBadge status={row.original.status || 'Paid'} />
        ),
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => (
          <CurrencyDisplay
            amount={row.original.amount}
            className="font-semibold text-xs sm:text-sm text-foreground whitespace-nowrap"
          />
        ),
      },
    ],
    []
  )

  const handleExpenseAdded = () => {
    // Invalidate both expenses and dashboard queries so UI immediately reflects updates
    queryClient.invalidateQueries({ queryKey: queryKeys.expenses })
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
  }

  const totalCount = expensesResponse?.count ?? 0
  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize))

  return (
    <PageContainer>
      <PageHeader
        title="Project Expenses"
        subtitle={`Manage and audit disbursements for ${activeProject?.name ?? 'your project'}.`}
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              className="gap-1.5"
              onClick={() => toast.info('Filters dialog')}
            >
              <Filter className="h-3.5 w-3.5" />
              <span>Filters</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="gap-1.5"
              onClick={() => toast.info('Exporting expense records...')}
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </Button>
            <AddExpenseButton
              customLabel="Record Expense"
              open={isAddExpenseOpen}
              onOpenChange={setIsAddExpenseOpen}
              onAddSuccess={handleExpenseAdded}
            />
          </>
        }
      />

      {/* Subheader Toolbar with Total Count and Page Size Selection */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Ledger Audit Log
          </span>
          {totalCount > 0 && (
            <Badge variant="secondary" className="text-[11px] font-semibold">
              {totalCount} Total
            </Badge>
          )}
          {isFetching && !isLoading && (
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Updating...
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setPage(1)
            }}
            aria-label="Rows per page"
            className="h-7 rounded-md border border-border bg-card px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {(isLoading || isLoadingProjects) && !expensesResponse ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-xl border border-border/80 bg-card p-8">
          <LoadingSpinner size="lg" label="Loading project expenses..." />
          <p className="text-xs text-muted-foreground">
            Fetching paginated ledger records from Supabase...
          </p>
        </div>
      ) : isError ? (
        /* Error State */
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center sm:p-12">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive border border-destructive/20">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display text-base font-semibold text-foreground">
              Unable to load expenses
            </h3>
            <p className="max-w-sm text-xs text-muted-foreground">
              {error?.message || 'An error occurred while fetching expense records. Please try again.'}
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            className="gap-1.5 mt-2"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Retry Query</span>
          </Button>
        </div>
      ) : totalCount === 0 ? (
        /* Empty State */
        <EmptyState
          icon={Receipt}
          title="No Expenses Recorded"
          description={`No expense disbursements have been recorded yet for "${activeProject?.name ?? 'this project'}". Start adding line items to build your project's financial ledger.`}
          actionLabel="Record First Expense"
          onAction={() => setIsAddExpenseOpen(true)}
        />
      ) : (
        /* Success State: Paginated Table */
        <DataTable
          columns={columns}
          data={expensesResponse?.data ?? []}
          isLoading={isFetching}
          totalCount={totalCount}
          pageSize={pageSize}
          manualPagination
          pageIndex={page - 1}
          pageCount={pageCount}
          onPageChange={(newPageIndex) => setPage(newPageIndex + 1)}
        />
      )}
    </PageContainer>
  )
}
