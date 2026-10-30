import { useState, useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import {
  Landmark,
  Plus,
  AlertCircle,
  RefreshCw,
  User,
  Download,
  Loader2,
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
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Combobox } from '@/components/ui/combobox'
import { useActiveProject } from '@/hooks/useActiveProject'
import { useFundingsQuery } from '@/hooks/queries'
import { RecordFundingDialog, FundingAttachmentsCell } from '@/components/funding'
import { getAllFundingsForExport } from '@/services/funding.service'
import { exportFundingsToCsv } from '@/utils/csvExport'
import { queryKeys } from '@/constants/queryKeys'
import type { Funding } from '@/types/funding.types'

export function FundingPage() {
  const queryClient = useQueryClient()
  const { activeProject, isLoadingProjects } = useActiveProject()

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [prevProjectId, setPrevProjectId] = useState(activeProject?.id)
  const [isRecordFundingOpen, setIsRecordFundingOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  // Reset pagination when switching projects
  if (activeProject?.id !== prevProjectId) {
    setPrevProjectId(activeProject?.id)
    setPage(1)
  }

  // Fetch paginated fundings for the active project
  const {
    data: fundingsResponse,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useFundingsQuery(activeProject?.id ?? '', page, pageSize)

  // TanStack Table columns matching exact specifications
  const columns = useMemo<ColumnDef<Funding, unknown>[]>(
    () => [
      {
        accessorKey: 'funding_date',
        header: 'Date',
        cell: ({ row }) => (
          <DateDisplay
            date={row.original.funding_date}
            format="medium"
            className="text-xs sm:text-sm font-medium whitespace-nowrap"
          />
        ),
      },
      {
        id: 'funded_by',
        header: 'Funded By',
        cell: ({ row }) => {
          const funder = row.original.funder
          const name = funder?.full_name || 'Member'
          const initials = name
            .split(' ')
            .filter(Boolean)
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'M'

          return (
            <div className="flex items-center gap-2 min-w-0">
              {funder?.avatar_url ? (
                <img
                  src={funder.avatar_url}
                  alt={name}
                  className="h-6 w-6 rounded-full object-cover border border-border/80"
                />
              ) : (
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[10px] border border-primary/20">
                  {initials || <User className="h-3 w-3" />}
                </div>
              )}
              <span className="font-medium text-xs sm:text-sm text-foreground truncate max-w-[150px]">
                {name}
              </span>
            </div>
          )
        },
      },
      {
        id: 'payment_method',
        header: 'Payment Mode',
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground truncate block max-w-[140px]">
            {row.original.payment_method?.name || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => (
          <span
            className="text-xs text-muted-foreground block truncate max-w-[180px] sm:max-w-[280px]"
            title={row.original.description ?? undefined}
          >
            {row.original.description || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => (
          <CurrencyDisplay
            amount={row.original.amount}
            className="font-semibold text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 whitespace-nowrap"
          />
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <FundingAttachmentsCell attachments={row.original.attachments} />
        ),
      },
    ],
    []
  )

  const handleFundingAdded = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.fundings })
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    queryClient.invalidateQueries({ queryKey: queryKeys.projectSummary })
  }

  const handleExportCsv = async () => {
    if (!activeProject?.id) {
      toast.warning('Please select an active project first.')
      return
    }

    try {
      setIsExporting(true)
      const allData = await getAllFundingsForExport(activeProject.id)
      if (!allData || allData.length === 0) {
        toast.info('No funding records available to export.')
        return
      }

      exportFundingsToCsv(allData, activeProject.name)
      toast.success(
        `Successfully exported ${allData.length} funding record${allData.length === 1 ? '' : 's'}.`
      )
    } catch (err: unknown) {
      console.error('Failed to export fundings:', err)
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to export fundings. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsExporting(false)
    }
  }

  const totalCount = fundingsResponse?.count ?? 0
  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize))

  return (
    <PageContainer>
      <PageHeader
        title="Project Funding"
        subtitle={`Track capital deposits and contributions for ${activeProject?.name ?? 'your project'}.`}
        actions={
          <div className="flex items-center gap-2.5">
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
            <Button
              variant="primary"
              size="sm"
              className="gap-1.5 font-medium shadow-sm shrink-0"
              onClick={() => setIsRecordFundingOpen(true)}
            >
              <Plus className="h-4 w-4" />
              <span>Record Funding</span>
            </Button>
          </div>
        }
      />

      {/* Subheader Toolbar with Total Count and Page Size Selection */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Capital Ledger
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
      {(isLoading || isLoadingProjects) && !fundingsResponse ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-xl border border-border/80 bg-card p-8">
          <LoadingSpinner size="lg" label="Loading project funding..." />
          <p className="text-xs text-muted-foreground">
            Fetching funding disbursements from Supabase...
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
              Unable to load funding records
            </h3>
            <p className="max-w-sm text-xs text-muted-foreground">
              {error?.message || 'An error occurred while fetching funding records. Please try again.'}
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
          icon={Landmark}
          title="No Funding Records"
          description={`No funding contributions have been recorded yet for "${activeProject?.name ?? 'this project'}". Record capital deposits to fund your project.`}
          actionLabel="Record First Funding"
          onAction={() => setIsRecordFundingOpen(true)}
        />
      ) : (
        /* Success State: Paginated Table */
        <DataTable
          columns={columns}
          data={fundingsResponse?.data ?? []}
          isLoading={isFetching}
          totalCount={totalCount}
          pageSize={pageSize}
          manualPagination
          pageIndex={page - 1}
          pageCount={pageCount}
          onPageChange={(newPageIndex) => setPage(newPageIndex + 1)}
        />
      )}

      {/* Record Funding Dialog Modal */}
      <RecordFundingDialog
        open={isRecordFundingOpen}
        onOpenChange={setIsRecordFundingOpen}
        onSuccess={handleFundingAdded}
      />
    </PageContainer>
  )
}
