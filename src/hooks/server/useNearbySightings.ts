import { useQuery } from '@tanstack/react-query'
import { getNearbySightings } from '~/server/sightings'

// Custom hook for fetching sightings near a location
export function useNearbySightings(
  lat?: number,
  lng?: number,
  radius: number = 5
) {
  return useQuery({
    queryKey: ['sightings', lat, lng, radius], // trim the lat lng so that its not so sensitive to change
    queryFn: () =>
      getNearbySightings({ data: { lat: lat!, lng: lng!, radius } }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: lat != null && lng != null && radius != null,
  })
}
