import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { useFindStray } from '~/hooks/server/useFindStray'
import { useTable, Table, Pagination } from '~/lib/table-config'
import { Input } from '~/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Badge } from '~/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { formatRelativeDate } from '~/utils/date'
import { ColumnDef } from '@tanstack/react-table'
import type { Stray } from 'db/schema'
import { Skeleton } from '~/components/ui/skeleton'
import { Button } from '~/components/ui/button'
import { useDebounce } from '~/hooks/use-debounce'
import { getErrorMessage } from '~/lib/errors'
import { PawPrint, RefreshCw, SearchX } from 'lucide-react'

export const Route = createFileRoute('/app/strays/')({
  component: Strays,
})

function Strays() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [species, setSpecies] = useState<string>('all')
  const [status, setStatus] = useState<string>('all')
  const [size, setSize] = useState<string>('all')

  const debouncedSearch = useDebounce(search, 300)
  const hasActiveFilters =
    debouncedSearch !== '' ||
    species !== 'all' ||
    status !== 'all' ||
    size !== 'all'

  const clearFilters = () => {
    setSearch('')
    setSpecies('all')
    setStatus('all')
    setSize('all')
  }

  const {
    data: strays,
    isLoading,
    error,
    refetch,
  } = useFindStray(
    species === 'all' ? undefined : (species as 'cat' | 'dog' | 'other'),
    status === 'all'
      ? undefined
      : (status as 'spotted' | 'being_cared_for' | 'adopted' | 'deceased'),
    size === 'all' ? undefined : (size as 'small' | 'medium' | 'large'),
    debouncedSearch || undefined,
    100
  )

  // Handle row click navigation
  const handleRowClick = (stray: Stray) => {
    navigate({
      to: '/app/strays/$strayId',
      params: { strayId: stray.id.toString() },
    })
  }

  // Define columns for the strays table
  const columns = useMemo<ColumnDef<Stray>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ getValue }) => {
          const name = getValue() as string
          return <span className="font-medium">{name || 'Unnamed'}</span>
        },
        size: 120,
      },
      {
        accessorKey: 'species',
        header: 'Species',
        cell: ({ getValue }) => {
          const species = getValue() as string
          return (
            <Badge
              variant={
                species === 'cat'
                  ? 'default'
                  : species === 'dog'
                    ? 'secondary'
                    : 'outline'
              }
            >
              {species}
            </Badge>
          )
        },
        size: 100,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => {
          const status = getValue() as string
          return (
            <Badge
              variant={
                status === 'spotted'
                  ? 'default'
                  : status === 'being_cared_for'
                    ? 'secondary'
                    : status === 'adopted'
                      ? 'outline'
                      : 'destructive'
              }
            >
              {status.replace('_', ' ')}
            </Badge>
          )
        },
        size: 120,
      },
      {
        accessorKey: 'size',
        header: 'Size',
        cell: ({ getValue }) => getValue() as string,
        size: 80,
      },
      {
        accessorKey: 'breed',
        header: 'Breed',
        cell: ({ getValue }) => {
          const breed = getValue() as string
          return breed || '-'
        },
        size: 100,
      },
      {
        accessorKey: 'colors',
        header: 'Colors',
        cell: ({ getValue }) => {
          const colors = getValue() as string
          return colors || '-'
        },
        size: 100,
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ getValue }) => {
          const createdAt = getValue() as number
          return (
            <span className="text-sm text-muted-foreground">
              {createdAt ? formatRelativeDate(createdAt as any) : '-'}
            </span>
          )
        },
        size: 120,
      },
    ],
    []
  )

  // Create table instance
  const table = useTable({
    data: strays || [],
    columns,
    enablePagination: true,
    pageSize: 10,
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Strays</h1>
        <p className="text-muted-foreground">Browse and manage stray animals</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>
            Find specific strays by name, description, or characteristics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <Input
                placeholder="Search by name or description..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Species</label>
              <Select value={species} onValueChange={setSpecies}>
                <SelectTrigger>
                  <SelectValue placeholder="All species" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Species</SelectItem>
                  <SelectItem value="cat">Cat</SelectItem>
                  <SelectItem value="dog">Dog</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="spotted">Spotted</SelectItem>
                  <SelectItem value="being_cared_for">
                    Being Cared For
                  </SelectItem>
                  <SelectItem value="adopted">Adopted</SelectItem>
                  <SelectItem value="deceased">Deceased</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Size</label>
              <Select value={size} onValueChange={setSize}>
                <SelectTrigger>
                  <SelectValue placeholder="All sizes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sizes</SelectItem>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strays Table */}
      <Card>
        <CardContent className="p-0">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                Strays ({strays?.length || 0})
              </h2>
            </div>

            {isLoading ? (
              <div className="space-y-3 py-2" aria-label="Loading strays">
                <Skeleton className="h-9 w-full" />
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-5 w-1/4" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-5 flex-1" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="font-medium text-destructive">
                  {getErrorMessage(error, 'Could not load strays').title}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {getErrorMessage(error, 'Could not load strays').description}
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => refetch()}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try again
                </Button>
              </div>
            ) : strays && strays.length > 0 ? (
              <>
                <Table
                  table={table}
                  onRowClick={handleRowClick}
                  clickableRows={true}
                />
                <Pagination table={table} />
              </>
            ) : hasActiveFilters ? (
              <div className="text-center py-12">
                <SearchX className="w-10 h-10 mx-auto text-muted-foreground/50" />
                <p className="mt-3 font-medium">No strays match your filters</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try a different search term or remove some filters.
                </p>
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="text-center py-12">
                <PawPrint className="w-10 h-10 mx-auto text-muted-foreground/50" />
                <p className="mt-3 font-medium">No strays reported yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Strays appear here once someone reports a sighting on the map.
                </p>
                <Button asChild variant="outline" className="mt-4">
                  <Link to="/app">Go to the map</Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
