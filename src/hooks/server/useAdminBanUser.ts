import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authClient } from '~/lib/auth-client'
import { UserWithRole } from 'better-auth/plugins'

// Custom hook for banning a user
export function useAdminBanUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      user: UserWithRole
      reason: string
      deadline?: Date
    }) => {
      const result = await authClient.admin.banUser({
        userId: params.user.id,
        banReason: params.reason,
        banExpiresIn: params.deadline
          ? Math.floor((params.deadline.getTime() - Date.now()) / 1000)
          : undefined,
      })
      return result
    },
    onSuccess: () => {
      // Invalidate and refetch admin users data
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })
}
