import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authClient } from '~/lib/auth-client'
import { UserWithRole } from 'better-auth/plugins'

// Custom hook for changing user role to regular user
export function useAdminMakeUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (user: UserWithRole) => {
      const result = await authClient.admin.updateUser({
        userId: user.id,
        data: {
          role: 'user',
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
