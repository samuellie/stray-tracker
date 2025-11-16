import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authClient } from '~/lib/auth-client'
import { UserWithRole } from 'better-auth/plugins'

// Custom hook for promoting a user to admin
export function useAdminMakeAdmin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (user: UserWithRole) => {
      const result = await authClient.admin.updateUser({
        userId: user.id,
        data: {
          role: 'admin',
        },
      })
      return result
    },
    onSuccess: () => {
      // Invalidate and refetch admin users data
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })
}
