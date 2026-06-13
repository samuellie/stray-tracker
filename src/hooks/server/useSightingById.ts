import { useQuery } from '@tanstack/react-query'
import { getSighting } from '~/server/sightings'

// Fetches a single sighting with its stray, reporting user and photos
export function useSightingById(id?: number) {
  return useQuery({
    queryKey: ['sightings', 'detail', id],
    queryFn: () => getSighting({ data: id! }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: id != null,
  })
}
