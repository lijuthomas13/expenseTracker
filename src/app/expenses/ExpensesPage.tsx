import { useState, useMemo, useRef, useEffect } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import {
  Receipt,
  Filter,
  Download,
  AlertCircle,
  RefreshCw,
  X,
  Calendar,
  RotateCcw,
  Check,
  Loader2,
  Trash2,
} from 'lucide-react'
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
import { ExpenseAttachmentsCell, DeleteExpenseDialog } from '@/components/expenses'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Combobox } from '@/components/ui/combobox'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useActiveProject } from '@/hooks/useActiveProject'
import { useExpensesQuery, useExpenseCategoriesQuery } from '@/hooks/queries'
import { getAllExpensesForExport } from '@/services'
import { exportExpensesToCsv } from '@/utils/csvExport'
import { queryKeys } from '@/constants/queryKeys'
import type { Expense, ExpenseFilters } from '@/types/expense.types'
import { formatDate } from '@/utils/formatters'
import { cn } from '@/lib/utils'

export function ExpensesPage() {
  const queryClient = useQueryClient()
  const { activeProject, isLoadingProjects } = useActiveProject()

  // Project Categories master data from custom hook
  const {
    data: categories = [],
    isLoading: isLoadingCategories,
  } = useExpenseCategoriesQuery(activeProject?.id ?? '')

  // Pagination state managed directly in component state
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [prevProjectId, setPrevProjectId] = useState(activeProject?.id)
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null)

  // Default project date bounds
  const defaultStartDate = activeProject?.start_date ?? ''
  const defaultEndDate = activeProject?.expected_end_date ?? ''

  // Applied server-side filters state
  const [appliedFilters, setAppliedFilters] = useState<ExpenseFilters>({
    categoryId: '',
    startDate: defaultStartDate,
    endDate: defaultEndDate,
  })

  // Draft filters state inside popover card
  const [draftFilters, setDraftFilters] = useState<ExpenseFilters>({
    categoryId: '',
    startDate: defaultStartDate,
    endDate: defaultEndDate,
  })

  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const filterPopoverRef = useRef<HTMLDivElement>(null)
  const filterButtonRef = useRef<HTMLButtonElement>(null)

  // Reset pagination to page 1 and filters to defaults when active project switches
  if (activeProject?.id !== prevProjectId) {
    setPrevProjectId(activeProject?.id)
    setPage(1)
    const newStart = activeProject?.start_date ?? ''
    const newEnd = activeProject?.expected_end_date ?? ''
    setAppliedFilters({
      categoryId: '',
      startDate: newStart,
      endDate: newEnd,
    })
    setDraftFilters({
      categoryId: '',
      startDate: newStart,
      endDate: newEnd,
    })
  }

  // Click-outside and Escape handlers for popover card
  useEffect(() => {
    if (!isFilterOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterPopoverRef.current &&
        !filterPopoverRef.current.contains(event.target as Node) &&
        filterButtonRef.current &&
        !filterButtonRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsFilterOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isFilterOpen])

  // Fetch paginated expenses strictly via React Query -> Service -> Supabase architecture with server-side filters
  const {
    data: expensesResponse,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useExpensesQuery(activeProject?.id ?? '', page, pageSize, appliedFilters)

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
      {
        id: 'receipt',
        header: 'Receipt',
        cell: ({ row }) => (
          <ExpenseAttachmentsCell attachments={row.original.attachments} />
        ),
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="iconSm"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  onClick={() => setExpenseToDelete(row.original)}
                  aria-label="Delete expense"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete expense</TooltipContent>
            </Tooltip>
          </TooltipProvider>
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

  const appliedCategory = useMemo(() => {
    if (!appliedFilters.categoryId) return null
    return categories.find((c) => c.id === appliedFilters.categoryId) || null
  }, [appliedFilters.categoryId, categories])

  const hasCategoryFilter = Boolean(appliedFilters.categoryId)
  const hasDateFilter = Boolean(appliedFilters.startDate || appliedFilters.endDate)
  const activeFilterCount = (hasCategoryFilter ? 1 : 0) + (hasDateFilter ? 1 : 0)

  const handleApplyFilters = () => {
    setAppliedFilters(draftFilters)
    setPage(1)
    setIsFilterOpen(false)
  }

  const handleClearAllFilters = () => {
    const cleared: ExpenseFilters = {
      categoryId: '',
      startDate: '',
      endDate: '',
    }
    setDraftFilters(cleared)
    setAppliedFilters(cleared)
    setPage(1)
    setIsFilterOpen(false)
  }

  const handleResetToDefaultDates = () => {
    setDraftFilters((prev) => ({
      ...prev,
      startDate: defaultStartDate,
      endDate: defaultEndDate,
    }))
  }

  const handleRemoveCategoryFilter = () => {
    setAppliedFilters((prev) => ({ ...prev, categoryId: '' }))
    setDraftFilters((prev) => ({ ...prev, categoryId: '' }))
    setPage(1)
  }

  const handleRemoveDateFilter = () => {
    setAppliedFilters((prev) => ({ ...prev, startDate: '', endDate: '' }))
    setDraftFilters((prev) => ({ ...prev, startDate: '', endDate: '' }))
    setPage(1)
  }

  const handleExportCsv = async () => {
    if (!activeProject?.id) {
      toast.warning('Please select an active project first.')
      return
    }

    try {
      setIsExporting(true)
      const allData = await getAllExpensesForExport(activeProject.id, appliedFilters)
      if (!allData || allData.length === 0) {
        toast.info('No expenses match the current criteria to export.')
        return
      }

      exportExpensesToCsv(allData, activeProject.name)
      const filterSuffix = activeFilterCount > 0 ? ' (matching filters)' : ''
      toast.success(
        `Successfully exported ${allData.length} expense${allData.length === 1 ? '' : 's'}${filterSuffix}.`
      )
    } catch (err: unknown) {
      console.error('Failed to export expenses:', err)
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to export expenses. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsExporting(false)
    }
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
            {/* Filter Trigger Button & Popover Card */}
            <div className="relative">
              <Button
                ref={filterButtonRef}
                variant={activeFilterCount > 0 ? 'default' : 'secondary'}
                size="sm"
                className={cn(
                  'gap-1.5 transition-all',
                  isFilterOpen && 'ring-2 ring-primary/30'
                )}
                onClick={() => {
                  setDraftFilters(appliedFilters)
                  setIsFilterOpen((prev) => !prev)
                }}
                aria-expanded={isFilterOpen}
                aria-haspopup="dialog"
              >
                <Filter className="h-3.5 w-3.5" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-foreground text-primary px-1 text-[10px] font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </Button>

              {/* Popover Card */}
              {isFilterOpen && (
                <div
                  ref={filterPopoverRef}
                  className="absolute right-0 top-full mt-2 z-50 w-80 sm:w-96 rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-level-3 space-y-4 animate-in fade-in zoom-in-95 duration-150"
                  role="dialog"
                  aria-label="Filter expenses"
                >
                  {/* Popover Header */}
                  <div className="flex items-center justify-between border-b border-border/70 pb-3">
                    <div>
                      <h4 className="font-display text-sm font-semibold text-foreground">
                        Filter Expenses
                      </h4>
                      <p className="text-[11px] text-muted-foreground">
                        Server-side category & date criteria
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="iconSm"
                      className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
                      onClick={() => setIsFilterOpen(false)}
                      aria-label="Close filters"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Filter Fields */}
                  <div className="space-y-4">
                    {/* Category Filter */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-foreground">
                          Category
                        </label>
                        {draftFilters.categoryId && (
                          <button
                            type="button"
                            onClick={() =>
                              setDraftFilters((prev) => ({ ...prev, categoryId: '' }))
                            }
                            className="text-[10px] text-primary hover:underline"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                      <Combobox
                        placeholder={isLoadingCategories ? 'Loading categories...' : 'All Categories'}
                        searchPlaceholder="Filter category..."
                        emptyText="No categories found."
                        allowClear
                        className="h-9 text-xs"
                        options={categories.map((cat) => ({
                          value: cat.id,
                          label: cat.name,
                          color: cat.color,
                          icon: <CategoryIcon icon={cat.icon} color={cat.color} size="sm" />,
                        }))}
                        value={draftFilters.categoryId || ''}
                        onChange={(val) =>
                          setDraftFilters((prev) => ({ ...prev, categoryId: val }))
                        }
                      />
                    </div>

                    {/* Date Range Filter */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-foreground">
                          Date Range
                        </label>
                        {(defaultStartDate || defaultEndDate) && (
                          <button
                            type="button"
                            onClick={handleResetToDefaultDates}
                            className="text-[10px] text-primary hover:underline flex items-center gap-1"
                            title="Reset to project start & end dates"
                          >
                            <RotateCcw className="h-2.5 w-2.5" />
                            <span>Project Timeline</span>
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] text-muted-foreground mb-1 block">
                            Start Date
                          </span>
                          <input
                            type="date"
                            value={draftFilters.startDate || ''}
                            onChange={(e) =>
                              setDraftFilters((prev) => ({
                                ...prev,
                                startDate: e.target.value,
                              }))
                            }
                            className="h-9 w-full rounded-lg border border-border bg-card px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground mb-1 block">
                            End Date
                          </span>
                          <input
                            type="date"
                            value={draftFilters.endDate || ''}
                            onChange={(e) =>
                              setDraftFilters((prev) => ({
                                ...prev,
                                endDate: e.target.value,
                              }))
                            }
                            className="h-9 w-full rounded-lg border border-border bg-card px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Popover Footer Actions */}
                  <div className="flex items-center justify-between border-t border-border/70 pt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearAllFilters}
                      className="text-xs text-muted-foreground hover:text-destructive h-8 px-2.5"
                    >
                      Clear All
                    </Button>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setIsFilterOpen(false)}
                        className="text-xs h-8 px-3"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleApplyFilters}
                        className="text-xs h-8 px-3 gap-1.5"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Apply</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Button
              variant="secondary"
              size="sm"
              className="gap-1.5"
              onClick={handleExportCsv}
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
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

      {/* Applied Filters Chips Bar */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-muted/20 px-3.5 py-2 text-xs">
          <span className="text-muted-foreground font-medium flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-primary" />
            Applied:
          </span>

          {/* Category Chip */}
          {appliedCategory && (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 font-medium text-foreground">
              <CategoryIcon
                icon={appliedCategory.icon}
                color={appliedCategory.color}
                size="sm"
              />
              <span>{appliedCategory.name}</span>
              <button
                type="button"
                onClick={handleRemoveCategoryFilter}
                className="ml-0.5 rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Remove category filter"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Date Range Chip */}
          {hasDateFilter && (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card px-2.5 py-0.5 font-medium text-foreground shadow-xs">
              <Calendar className="h-3 w-3 text-primary" />
              <span>
                {appliedFilters.startDate
                  ? formatDate(appliedFilters.startDate, { format: 'short' })
                  : 'Start'}
                {' → '}
                {appliedFilters.endDate
                  ? formatDate(appliedFilters.endDate, { format: 'short' })
                  : 'Present'}
              </span>
              <button
                type="button"
                onClick={handleRemoveDateFilter}
                className="ml-0.5 rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Remove date range filter"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Clear All Text Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAllFilters}
            className="h-6 px-2 text-[11px] text-muted-foreground hover:text-destructive gap-1 ml-auto"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Clear all</span>
          </Button>
        </div>
      )}

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
          <Combobox
            value={String(pageSize)}
            onChange={(val) => {
              if (val) {
                setPageSize(Number(val))
                setPage(1)
              }
            }}
            aria-label="Rows per page"
            className="h-7 w-[72px] text-xs px-2"
            options={[
              { value: '5', label: '5' },
              { value: '10', label: '10' },
              { value: '20', label: '20' },
              { value: '50', label: '50' },
            ]}
          />
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
        activeFilterCount > 0 ? (
          <EmptyState
            icon={Filter}
            title="No Matching Expenses"
            description="No expense disbursements match the selected category and date range criteria. Try adjusting or clearing your filters."
            actionLabel="Clear All Filters"
            onAction={handleClearAllFilters}
          />
        ) : (
          <EmptyState
            icon={Receipt}
            title="No Expenses Recorded"
            description={`No expense disbursements have been recorded yet for "${activeProject?.name ?? 'this project'}". Start adding line items to build your project's financial ledger.`}
            actionLabel="Record First Expense"
            onAction={() => setIsAddExpenseOpen(true)}
          />
        )
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

      {/* Delete Confirmation Dialog */}
      <DeleteExpenseDialog
        open={Boolean(expenseToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setExpenseToDelete(null)
          }
        }}
        expense={expenseToDelete}
        onSuccess={() => {
          setExpenseToDelete(null)
        }}
      />
    </PageContainer>
  )
}
