import { useQuery } from '@tanstack/react-query'
import { searchStrays } from '~/server/strays'

// Custom hook for finding strays with flexible filtering
export function useFindStray(
  species?: 'cat' | 'dog' | 'other',
  status?: 'spotted' | 'being_cared_for' | 'adopted' | 'deceased',
  size?: 'small' | 'medium' | 'large',
  search?: string,
  limit: number = 100
) {
  return useQuery({
    queryKey: ['strays', 'search', { species, status, size, search, limit }],
    queryFn: () =>
      searchStrays({
        data: {
          species,
          status,
          size,
          search,
          limit,
        },
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true, // Always enable this query to show all strays by default
  })
}
