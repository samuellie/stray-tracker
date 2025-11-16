import { createFileRoute } from '@tanstack/react-router'
import { useTable } from '~/lib/table-config'
import { Table, Pagination } from '~/lib/table-config'
import { useState, useMemo } from 'react'
import { Card } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Badge } from '~/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '~/components/ui/tooltip'
import { MoreHorizontal, Shield, ShieldCheck, User, Search } from 'lucide-react'
import { UserWithRole } from 'better-auth/plugins'
import { useAdminListUsers } from '~/hooks/server/useAdminListUsers'
import { useAdminBanUser } from '~/hooks/server/useAdminBanUser'
import { useAdminUnbanUser } from '~/hooks/server/useAdminUnbanUser'
import { useAdminMakeAdmin } from '~/hooks/server/useAdminMakeAdmin'
import { useAdminMakeUser } from '~/hooks/server/useAdminMakeUser'
import { useDebouncedValue } from '@tanstack/react-pacer'
import { ColumnDef } from '@tanstack/react-table'
import { formatRelativeDate } from '~/utils/date'
import { BanUserDialog } from '~/components/dialogs/BanUserDialog'

export const Route = createFileRoute('/app/admin/users')({
  component: RouteComponent,
})

function RouteComponent() {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm] = useDebouncedValue(searchTerm, { wait: 500 }) // 500ms debounce delay
  const [searchField, setSearchField] = useState<'email' | 'name'>('email')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Ban dialog state
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false)
  const [selectedUserForBan, setSelectedUserForBan] =
    useState<UserWithRole | null>(null)

  // Fetch users data using custom hook - using debounced search term
  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = useAdminListUsers(
    100,
    debouncedSearchTerm,
    searchField,
    roleFilter,
    statusFilter
  )

  // Extract users array from response
  const users = usersData?.users || []

  // Initialize the admin hooks
  const banUserMutation = useAdminBanUser()
  const unbanUserMutation = useAdminUnbanUser()
  const makeAdminMutation = useAdminMakeAdmin()
  const makeUserMutation = useAdminMakeUser()

  const handleViewUser = async (user: UserWithRole) => {
    // Implement user details view
    console.log('View user:', user)
  }

  const handleBanUser = (user: UserWithRole) => {
    setSelectedUserForBan(user)
    setIsBanDialogOpen(true)
  }

  const handleUnbanUser = async (user: UserWithRole) => {
    try {
      await unbanUserMutation.mutateAsync(user)
    } catch (error) {
      console.error('Error unbanning user:', error)
    }
  }

  const handleMakeAdmin = async (user: UserWithRole) => {
    try {
      await makeAdminMutation.mutateAsync(user)
    } catch (error) {
      console.error('Error promoting user:', error)
    }
  }

  const handleMakeUser = async (user: UserWithRole) => {
    try {
      await makeUserMutation.mutateAsync(user)
    } catch (error) {
      console.error('Error making user:', error)
    }
  }

  // Define columns for the admin users table
  const columns = useMemo<ColumnDef<UserWithRole>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ getValue, row }: { getValue: () => any; row: any }) => {
          const name = getValue() as string
          const { banned, banReason, banExpires, role } = row.original
          return (
            <div className="flex items-center space-x-2">
              <span>{name}</span>
              {banned && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="destructive" className="cursor-help">
                        Banned
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="max-w-xs">
                        {banReason && <p className="text-sm">{banReason}</p>}
                        {banExpires && (
                          <p className="text-xs mt-1 italic">
                            expires in {formatRelativeDate(banExpires)}
                          </p>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {role === 'admin' && <Badge className="bg-blue-500">Admin</Badge>}
            </div>
          )
        },
        size: 150,
      },
      {
        accessorKey: 'email',
        header: 'Status',
        cell: ({ getValue, row }: { getValue: () => any; row: any }) => {
          const email = getValue() as boolean
          const { emailVerified } = row.original
          return (
            <div className="flex items-center space-x-1">
              <span>{email}</span>
              {!emailVerified && <Badge variant="outline">Unverified</Badge>}
            </div>
          )
        },
        size: 100,
      },
      {
        accessorKey: 'createdAt',
        header: 'Joined',
        cell: ({ getValue }: { getValue: () => any }) => {
          const createdAt = getValue() as string
          return (
            <span className="text-sm text-muted-foreground">
              {formatRelativeDate(createdAt)}
            </span>
          )
        },
        size: 120,
      },
      {
        accessorKey: 'user',
        header: 'Actions',
        cell: ({ row }) => {
          const user = row.original
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleViewUser(user)}>
                  <User className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                {user?.banned ? (
                  <DropdownMenuItem
                    onClick={() => handleUnbanUser(user)}
                    className="text-green-600"
                  >
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Unban User
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() => handleBanUser(user)}
                    className="text-red-600"
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Ban User
                  </DropdownMenuItem>
                )}
                {user?.role !== 'admin' && (
                  <DropdownMenuItem
                    onClick={() => handleMakeAdmin(user)}
                    className="text-blue-600"
                  >
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Make Admin
                  </DropdownMenuItem>
                )}
                {user?.role === 'admin' && (
                  <DropdownMenuItem
                    onClick={() => handleMakeUser(user)}
                    className="text-orange-600"
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Make User
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
        size: 80,
      },
    ],
    []
  )

  // Create table instance
  const table = useTable({ data: users, columns })

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-8">User Management</h1>
      <div className="space-y-8">
        {/* Filters and Search */}
        <Card className="p-6">
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <div className="flex space-x-2 flex-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-sm whitespace-nowrap"
                  >
                    Search: {searchField === 'email' ? 'Email' : 'Name'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem
                    onClick={() => {
                      setSearchField('email')
                      setSearchTerm('') // Clear search term when changing fields
                    }}
                  >
                    Search by Email
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setSearchField('name')
                      setSearchTerm('') // Clear search term when changing fields
                    }}
                  >
                    Search by Name
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={`Search users by ${searchField}...`}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="text-sm">
                    {roleFilter === 'all'
                      ? 'All Roles'
                      : roleFilter === 'admin'
                        ? 'Admin'
                        : roleFilter === 'user'
                          ? 'User'
                          : roleFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setRoleFilter('all')}>
                    All Roles
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setRoleFilter('admin')}>
                    Admin
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setRoleFilter('user')}>
                    User
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="text-sm">
                    {statusFilter === 'all'
                      ? 'All Status'
                      : statusFilter === 'active'
                        ? 'Active'
                        : statusFilter === 'banned'
                          ? 'Banned'
                          : statusFilter === 'unverified'
                            ? 'Unverified'
                            : statusFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                    All Status
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('active')}>
                    Active
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('banned')}>
                    Banned
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setStatusFilter('unverified')}
                  >
                    Unverified
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </Card>

        {/* Users Table */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Users ({users.length})</h2>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Loading users...</div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="text-red-500 mb-2">
                    Error loading users: {String(error)}
                  </div>
                  <Button onClick={() => refetch()} variant="outline" size="sm">
                    Retry
                  </Button>
                </div>
              </div>
            ) : users.length > 0 ? (
              <>
                <Table table={table} />
                <Pagination table={table} />
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No users found matching your criteria
              </div>
            )}
          </div>
        </Card>

        {/* User Details Dialog */}
        <UserDetailsDialog />

        {/* Ban User Dialog */}
        <BanUserDialog
          isOpen={isBanDialogOpen}
          onOpenChange={setIsBanDialogOpen}
          selectedUser={selectedUserForBan}
          onSuccess={() => {
            setSelectedUserForBan(null)
          }}
        />
      </div>
    </div>
  )
}

function UserDetailsDialog() {
  // This would be implemented with the actual user details state
  return null
}
