import { useQuery } from '@tanstack/react-query'
import { getSightingPhotos } from '~/routes/api/sightingsphoto'

// Custom hook for finding sighting photos for a specific sighting
export function useFindSightingPhotos(sightingId: number) {
  return useQuery({
    queryKey: ['sightingPhotos', sightingId],
    queryFn: () =>
      getSightingPhotos({
        data: sightingId,
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: sightingId != null,
  })
}
