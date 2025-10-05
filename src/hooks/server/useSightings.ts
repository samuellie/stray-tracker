import { useQuery } from '@tanstack/react-query'
import { getSightings } from '~/routes/api/sightings'

// Custom hook for fetching all sightings
export function useSightings() {
  return useQuery({
    queryKey: ['sightings'],
    queryFn: () => getSightings(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
