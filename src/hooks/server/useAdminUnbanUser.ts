import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authClient } from '~/lib/auth-client'
import { UserWithRole } from 'better-auth/plugins'

// Custom hook for unbanning a user
export function useAdminUnbanUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (user: UserWithRole) => {
      const result = await authClient.admin.unbanUser({
        userId: user.id,
      })
      return result
    },
    onSuccess: () => {
      // Invalidate and refetch admin users data
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })
}
