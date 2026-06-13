import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getNamingSuggestions,
  selectName,
  suggestName,
  voteName,
} from '~/server/naming'

export type NamingSuggestion = Awaited<
  ReturnType<typeof getNamingSuggestions>
>[number]

const suggestionsKey = (strayId?: number) => ['naming-suggestions', strayId]

export function useNamingSuggestions(strayId?: number) {
  return useQuery({
    queryKey: suggestionsKey(strayId),
    queryFn: () => getNamingSuggestions({ data: { strayId: strayId! } }),
    staleTime: 60 * 1000,
    enabled: strayId != null,
  })
}

export function useSuggestName(strayId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => suggestName({ data: { strayId, name } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: suggestionsKey(strayId) })
    },
  })
}

export function useVoteName(strayId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { suggestionId: number; vote: 1 | -1 | 0 }) =>
      voteName({ data: input }),
    // Optimistically apply the vote so the score updates instantly
    onMutate: async ({ suggestionId, vote }) => {
      await queryClient.cancelQueries({ queryKey: suggestionsKey(strayId) })
      const previous = queryClient.getQueryData<NamingSuggestion[]>(
        suggestionsKey(strayId)
      )
      queryClient.setQueryData<NamingSuggestion[]>(
        suggestionsKey(strayId),
        old =>
          old?.map(s =>
            s.id === suggestionId
              ? { ...s, score: s.score - s.myVote + vote, myVote: vote }
              : s
          )
      )
      return { previous }
    },
    onError: (_error, _input, mutateContext) => {
      if (mutateContext?.previous) {
        queryClient.setQueryData(
          suggestionsKey(strayId),
          mutateContext.previous
        )
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: suggestionsKey(strayId) })
    },
  })
}

export function useSelectName(strayId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (suggestionId: number) =>
      selectName({ data: { suggestionId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: suggestionsKey(strayId) })
      // The stray's name changed everywhere it appears
      queryClient.invalidateQueries({ queryKey: ['nearby-strays'] })
      queryClient.invalidateQueries({ queryKey: ['nearby-strays-infinite'] })
      queryClient.invalidateQueries({ queryKey: ['strays'] })
      queryClient.invalidateQueries({ queryKey: ['stray'] })
      queryClient.invalidateQueries({ queryKey: ['sightings'] })
    },
  })
}
