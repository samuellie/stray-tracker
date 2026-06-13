import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { searchStrays } from '~/server/strays'

// Custom hook for finding strays with flexible filtering (server-paginated)
export function useFindStray(
  species?: 'cat' | 'dog' | 'other',
  status?: 'spotted' | 'being_cared_for' | 'adopted' | 'deceased',
  size?: 'small' | 'medium' | 'large',
  search?: string,
  limit: number = 10,
  offset: number = 0
) {
  return useQuery({
    queryKey: [
      'strays',
      'search',
      { species, status, size, search, limit, offset },
    ],
    queryFn: () =>
      searchStrays({
        data: {
          species,
          status,
          size,
          search,
          limit,
          offset,
        },
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    // Keep the previous page on screen while the next one loads
    placeholderData: keepPreviousData,
  })
}
