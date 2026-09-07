import * as React from 'react'
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from './LoadingSpinner'
import { EmptyState } from './EmptyState'
import { ChevronLeft, ChevronRight, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  isLoading?: boolean
  emptyTitle?: string
  emptyDescription?: string
  totalCount?: number
  pageSize?: number
  manualPagination?: boolean
  pageIndex?: number
  pageCount?: number
  onPageChange?: (pageIndex: number) => void
  className?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no items to display right now.',
  totalCount,
  pageSize = 6,
  manualPagination = false,
  pageIndex,
  pageCount,
  onPageChange,
  className,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])

  const effectiveTotal = totalCount !== undefined ? totalCount : data.length
  const computedPageCount = pageCount !== undefined
    ? pageCount
    : Math.max(1, Math.ceil(effectiveTotal / pageSize))

  const table = useReactTable({
    data,
    columns,
    manualPagination,
    pageCount: manualPagination ? computedPageCount : undefined,
    getCoreRowModel: getCoreRowModel(),
    ...(manualPagination ? {} : { getPaginationRowModel: getPaginationRowModel() }),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      ...(manualPagination && pageIndex !== undefined
        ? { pagination: { pageIndex, pageSize } }
        : {}),
    },
    initialState: {
      pagination: {
        pageIndex: pageIndex ?? 0,
        pageSize,
      },
    },
  })

  const currentPage = manualPagination
    ? (pageIndex ?? 0)
    : table.getState().pagination.pageIndex
  const startRow = effectiveTotal > 0 ? currentPage * pageSize + 1 : 0
  const endRow = Math.min((currentPage + 1) * pageSize, effectiveTotal)
  const totalPages = manualPagination ? computedPageCount : Math.max(1, table.getPageCount())

  return (
    <div className={cn('w-full space-y-3', className)}>
      <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-level-1">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={cn(
                          'flex items-center gap-1',
                          header.column.getCanSort() && 'cursor-pointer select-none hover:text-foreground'
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() && (
                          <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground/70" />
                        )}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-40 text-center"
                >
                  <LoadingSpinner size="md" label="Loading table records..." />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-40 text-center"
                >
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    className="border-0 bg-transparent p-4"
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination & Status Footer matching screenshot */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 text-xs text-muted-foreground">
        <div>
          {effectiveTotal > 0 ? (
            <span>
              Showing <strong className="font-medium text-foreground">{startRow}-{endRow}</strong> of{' '}
              <strong className="font-medium text-foreground">{effectiveTotal}</strong> recorded expenses
            </span>
          ) : (
            <span>0 recorded expenses</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              if (manualPagination && onPageChange) {
                onPageChange(currentPage - 1)
              } else {
                table.previousPage()
              }
            }}
            disabled={manualPagination ? currentPage <= 0 || isLoading : !table.getCanPreviousPage()}
            className="h-7 px-2"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="font-medium text-foreground px-1">
            Page {currentPage + 1} of {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              if (manualPagination && onPageChange) {
                onPageChange(currentPage + 1)
              } else {
                table.nextPage()
              }
            }}
            disabled={manualPagination ? currentPage >= totalPages - 1 || isLoading : !table.getCanNextPage()}
            className="h-7 px-2"
            aria-label="Next page"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
