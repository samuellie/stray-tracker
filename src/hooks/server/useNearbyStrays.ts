import { useQuery } from '@tanstack/react-query'
import { getNearbyStrays } from '~/server/strays'

// Custom hook for fetching strays near a location based on their latest sighting
export function useNearbyStrays(
  lat?: number,
  lng?: number,
  radius: number = 5
) {
  return useQuery({
    queryKey: ['strays', lat, lng, radius],
    queryFn: () => getNearbyStrays({ data: { lat: lat!, lng: lng!, radius } }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: lat != null && lng != null && radius != null,
  })
}
