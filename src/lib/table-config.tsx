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

// Extended table interfaces for the Stray Tracker app
export interface Animal {
  id: string
  name: string
  species: string
  breed?: string
  color: string
  age: number
  size: string
  status: 'missing' | 'found' | 'unknown'
  location: string
  lastSeen: string
  reporter: string
  image?: string
}

export interface Sighting {
  id: string
  animalId?: string
  description: string
  location: string
  latitude?: number
  longitude?: number
  date: string
  reporter: string
  verified: boolean
  images: string[]
}

export interface User {
  id: string
  name: string
  email: string
  joinDate: string
  role: 'admin' | 'moderator' | 'user'
  sightingsCount: number
  lastActive: string
}

// Table configuration helpers
export function createAnimalColumns(): ColumnDef<Animal>[] {
  return [
    {
      accessorKey: 'image',
      header: 'Image',
      cell: info =>
        info.getValue() ? (
          <img
            src={info.getValue() as string}
            alt="Animal"
            className="w-12 h-12 object-cover rounded"
          />
        ) : (
          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
            🐾
          </div>
        ),
      size: 60,
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: info => info.getValue(),
      size: 120,
    },
    {
      accessorKey: 'species',
      header: 'Species',
      cell: info => info.getValue(),
      size: 100,
    },
    {
      accessorKey: 'breed',
      header: 'Breed',
      cell: info => info.getValue() || 'Unknown',
      size: 120,
    },
    {
      accessorKey: 'color',
      header: 'Color',
      cell: info => info.getValue(),
      size: 100,
    },
    {
      accessorKey: 'age',
      header: 'Age',
      cell: info => `${info.getValue()} years`,
      size: 80,
    },
    {
      accessorKey: 'size',
      header: 'Size',
      cell: info => info.getValue(),
      size: 80,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: info => {
        const status = info.getValue() as string
        const colors = {
          missing: 'bg-red-100 text-red-800',
          found: 'bg-green-100 text-green-800',
          unknown: 'bg-yellow-100 text-yellow-800',
        }
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              colors[status as keyof typeof colors]
            }`}
          >
            {status}
          </span>
        )
      },
      size: 100,
    },
    {
      accessorKey: 'location',
      header: 'Location',
      cell: info => info.getValue(),
      size: 150,
    },
    {
      accessorKey: 'lastSeen',
      header: 'Last Seen',
      cell: info => new Date(info.getValue() as string).toLocaleDateString(),
      size: 120,
    },
    {
      accessorKey: 'reporter',
      header: 'Reported By',
      cell: info => info.getValue(),
      size: 120,
    },
  ]
}

export function createSightingColumns(): ColumnDef<Sighting>[] {
  return [
    {
      accessorKey: 'images',
      header: 'Images',
      cell: info => {
        const images = info.getValue() as string[]
        return images && images.length > 0 ? (
          <img
            src={images[0]}
            alt="Sighting"
            className="w-12 h-12 object-cover rounded"
          />
        ) : (
          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
            📸
          </div>
        )
      },
      size: 60,
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: info => {
        const text = info.getValue() as string
        return (
          <div className="max-w-xs truncate" title={text}>
            {text}
          </div>
        )
      },
      size: 200,
    },
    {
      accessorKey: 'location',
      header: 'Location',
      cell: info => info.getValue(),
      size: 150,
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: info => new Date(info.getValue() as string).toLocaleDateString(),
      size: 120,
    },
    {
      accessorKey: 'verified',
      header: 'Verified',
      cell: info => {
        const verified = info.getValue() as boolean
        return verified ? (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Verified
          </span>
        ) : (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
            Pending
          </span>
        )
      },
      size: 100,
    },
    {
      accessorKey: 'reporter',
      header: 'Reported By',
      cell: info => info.getValue(),
      size: 120,
    },
  ]
}

export function createUserColumns(): ColumnDef<User>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: info => info.getValue(),
      size: 150,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: info => info.getValue(),
      size: 200,
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: info => {
        const role = info.getValue() as string
        const colors = {
          admin: 'bg-red-100 text-red-800',
          moderator: 'bg-blue-100 text-blue-800',
          user: 'bg-muted text-muted-foreground',
        }
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              colors[role as keyof typeof colors]
            }`}
          >
            {role}
          </span>
        )
      },
      size: 100,
    },
    {
      accessorKey: 'sightingsCount',
      header: 'Sightings',
      cell: info => info.getValue(),
      size: 100,
    },
    {
      accessorKey: 'joinDate',
      header: 'Joined',
      cell: info => new Date(info.getValue() as string).toLocaleDateString(),
      size: 120,
    },
    {
      accessorKey: 'lastActive',
      header: 'Last Active',
      cell: info => new Date(info.getValue() as string).toLocaleDateString(),
      size: 120,
    },
  ]
}

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
