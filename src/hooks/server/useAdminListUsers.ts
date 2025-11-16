import { useQuery } from '@tanstack/react-query'
import { authClient } from '~/lib/auth-client'
import { UserWithRole } from 'better-auth/plugins'

// Custom hook for fetching admin users with flexible filtering
export function useAdminListUsers(
  limit: number = 100,
  searchTerm?: string,
  searchField: 'email' | 'name' = 'email',
  roleFilter?: string,
  statusFilter?: string
) {
  return useQuery({
    queryKey: [
      'admin-users',
      { limit, searchTerm, searchField, roleFilter, statusFilter },
    ],
    queryFn: async () => {
      try {
        // Use better-auth admin API to get users
        const result = await authClient.admin.listUsers({
          query: {
            limit,
            ...(searchTerm && {
              searchValue: searchTerm,
              searchField: searchField,
              searchOperator: 'contains',
            }),
            ...(roleFilter &&
              roleFilter !== 'all' && {
                filterField: 'role',
                filterValue: roleFilter,
                filterOperator: 'eq',
              }),
            ...(statusFilter &&
              statusFilter !== 'all' && {
                filterField: 'status',
                filterValue:
                  statusFilter === 'active' ? 'verified' : statusFilter,
                filterOperator: 'eq',
              }),
          },
        })

        if (!result.data) {
          throw new Error('Failed to fetch users')
        }

        // Server-side filtering is now implemented in the API call
        const users = (result.data.users as UserWithRole[]) || []

        return {
          ...result.data,
          users,
        }
      } catch (error) {
        console.error('Error fetching users:', error)
        throw error
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: true,
  })
}
