import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
  PaginationState,
  Table as TanstackTable,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'

// Reusable table hook
interface UseTableOptions<T> {
  data: T[]
  columns: ColumnDef<T>[]
  pageSize?: number
  enableSorting?: boolean
  enableFiltering?: boolean
  enablePagination?: boolean
}

export function useTable<T>({
  data,
  columns,
  pageSize = 10,
  enableSorting = true,
  enableFiltering = true,
  enablePagination = true,
}: UseTableOptions<T>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  })

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: enablePagination
      ? getPaginationRowModel()
      : undefined,
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
  })

  return table
}

// Table component
interface TableProps<T> {
  table: TanstackTable<T>
  className?: string
}

export function Table<T>({ table, className = '' }: TableProps<T>) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-muted/50">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  style={{ width: header.column.getSize() }}
                >
                  {header.isPlaceholder ? null : (
                    <div
                      {...{
                        className: header.column.getCanSort()
                          ? 'cursor-pointer select-none flex items-center'
                          : '',
                        onClick: header.column.getToggleSortingHandler(),
                      }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {{
                        asc: ' 🔼',
                        desc: ' 🔽',
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-background divide-y divide-border">
          {table.getRowModel().rows.map(row => (
            <tr key={row.id} className="hover:bg-muted/50">
              {row.getVisibleCells().map(cell => (
                <td
                  key={cell.id}
                  className="px-6 py-4 whitespace-nowrap text-sm text-foreground"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Pagination component
interface PaginationProps {
  table: TanstackTable<any>
}

export function Pagination({ table }: PaginationProps) {
  if (table.getPageCount() <= 1) return null

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-background border-t border-border sm:px-6">
      <div className="flex items-center">
        <p className="text-sm text-muted-foreground">
          Showing{' '}
          <span className="font-medium">
            {table.getState().pagination.pageIndex *
              table.getState().pagination.pageSize +
              1}
          </span>{' '}
          to{' '}
          <span className="font-medium">
            {Math.min(
              (table.getState().pagination.pageIndex + 1) *
                table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}
          </span>{' '}
          of{' '}
          <span className="font-medium">
            {table.getFilteredRowModel().rows.length}
          </span>{' '}
          results
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <button
          className="px-3 py-1 text-sm font-medium text-muted-foreground bg-background border border-border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </button>
        {Array.from({ length: table.getPageCount() }, (_, i) => (
          <button
            key={i}
            className={`px-3 py-1 text-sm font-medium border rounded-md ${
              table.getState().pagination.pageIndex === i
                ? 'text-blue-600 bg-blue-50 border-blue-500'
                : 'text-muted-foreground bg-background border-border hover:bg-muted'
            }`}
            onClick={() => table.setPageIndex(i)}
          >
            {i + 1}
          </button>
        )).slice(
          Math.max(0, table.getState().pagination.pageIndex - 2),
          table.getState().pagination.pageIndex + 3
        )}
        <button
          className="px-3 py-1 text-sm font-medium text-muted-foreground bg-background border border-border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </button>
      </div>
    </div>
  )
}

// Virtual table component for large datasets
export function VirtualizedTable<T extends { id: string }>({
  data,
  columns,
  height = 400,
}: {
  data: T[]
  columns: ColumnDef<T>[]
  height?: number
}) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div
      style={{ height }}
      className="overflow-auto border border-gray-200 rounded"
    >
      <table className="min-w-full">
        <thead className="bg-muted/50 sticky top-0">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-gray-200"
                  style={{ width: header.column.getSize() }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-background divide-y divide-border">
          {table.getRowModel().rows.map(row => (
            <tr key={row.id} className="hover:bg-muted/50">
              {row.getVisibleCells().map(cell => (
                <td
                  key={cell.id}
                  className="px-6 py-4 whitespace-nowrap text-sm text-foreground border-b border-gray-200"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
