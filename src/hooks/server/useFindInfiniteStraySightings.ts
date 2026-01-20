import { useInfiniteQuery } from '@tanstack/react-query'
import { searchSightings } from '~/server/sightings'

export function useFindInfiniteStraySightings(
    strayId?: number,
    excludeSightingId?: number,
    limit: number = 20
) {
    return useInfiniteQuery({
        queryKey: ['stray-sightings', strayId, excludeSightingId, limit],
        queryFn: ({ pageParam = 0 }) =>
            searchSightings({
                data: {
                    strayId,
                    excludeSightingId,
                    limit,
                    offset: pageParam,
                },
            }),
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            // If the last page has fewer items than the limit, we've reached the end
            if (lastPage.length < limit) return undefined

            // Calculate the next offset
            return allPages.length * limit
        },
        enabled: strayId != null,
    })
}
