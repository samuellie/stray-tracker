import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getFollowedStrays,
  isFollowingStray,
  setFollowStray,
} from '~/server/subscriptions'

export function useIsFollowingStray(strayId?: number) {
  return useQuery({
    queryKey: ['following', strayId],
    queryFn: () => isFollowingStray({ data: { strayId: strayId! } }),
    staleTime: 5 * 60 * 1000,
    enabled: strayId != null,
  })
}

export function useFollowedStrays() {
  return useQuery({
    queryKey: ['followed-strays'],
    queryFn: () => getFollowedStrays(),
    staleTime: 60 * 1000,
  })
}

export function useSetFollowStray(strayId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (follow: boolean) =>
      setFollowStray({ data: { strayId, follow } }),
    // Flip the button state immediately
    onMutate: async follow => {
      await queryClient.cancelQueries({ queryKey: ['following', strayId] })
      const previous = queryClient.getQueryData(['following', strayId])
      queryClient.setQueryData(['following', strayId], { following: follow })
      return { previous }
    },
    onError: (_error, _follow, mutateContext) => {
      if (mutateContext?.previous) {
        queryClient.setQueryData(['following', strayId], mutateContext.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['following', strayId] })
      queryClient.invalidateQueries({ queryKey: ['followed-strays'] })
    },
  })
}
