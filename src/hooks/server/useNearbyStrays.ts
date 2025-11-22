import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { getNearbyStrays } from '~/server/strays'

// Custom hook for fetching strays near a location based on their latest sighting
export function useNearbyStrays(
  lat?: number,
  lng?: number,
  radius: number = 5
) {
  return useQuery({
    queryKey: ['nearby-strays', lat, lng, radius],
    queryFn: () =>
      getNearbyStrays({ data: { lat: lat!, lng: lng!, radius, limit: 100 } }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: lat != null && lng != null && radius != null,
  })
}

export function useInfiniteNearbyStrays(
  lat?: number,
  lng?: number,
  radius: number = 5
) {
  return useInfiniteQuery({
    queryKey: ['nearby-strays-infinite', lat, lng, radius],
    queryFn: ({ pageParam = 0 }) =>
      getNearbyStrays({
        data: { lat: lat!, lng: lng!, radius, limit: 10, offset: pageParam },
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 10 ? allPages.length * 10 : undefined
    },
    enabled: lat != null && lng != null && radius != null,
  })
}
