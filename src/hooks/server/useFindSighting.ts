import { useQuery } from '@tanstack/react-query'
import { searchSightings } from '~/routes/api/sightings'

// Custom hook for finding sightings with flexible filtering
export function useFindSighting(
  strayId?: number,
  excludeSightingId?: number,
  userId?: string,
  limit: number = 50
) {
  return useQuery({
    queryKey: [
      'sightings',
      'search',
      { strayId, excludeSightingId, userId, limit },
    ],
    queryFn: () =>
      searchSightings({
        data: {
          strayId,
          excludeSightingId,
          userId,
          limit,
        },
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: strayId != null || userId != null, // Enable query if at least one filter is provided
  })
}
