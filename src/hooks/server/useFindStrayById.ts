import { useQuery } from '@tanstack/react-query'
import { getStrayById } from '~/server/strays'

// Custom hook for finding a single stray by ID
export function useFindStrayById(id: number) {
  return useQuery({
    queryKey: ['stray', id],
    queryFn: () =>
      getStrayById({
        data: { id },
      }),
    enabled: !!id, // Only run query if ID is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
