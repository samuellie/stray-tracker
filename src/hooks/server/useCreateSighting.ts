import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createSighting } from '~/server/sightings'
import type { InsertSighting } from 'db/schema'

// Custom hook for creating a new sighting
export function useCreateSighting(isFromMap?: boolean) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (
      data: Omit<InsertSighting, 'strayId' | 'userId'> & {
        strayId?: number
        species?: string
        animalSize?: string
        location?: InsertSighting['location'] | null
      }
    ) => createSighting({ data }),
    onSuccess: () => {
      // Invalidate and refetch sightings data
      if (isFromMap) {
        queryClient.invalidateQueries({ queryKey: ['nearby-strays'] })
        queryClient.invalidateQueries({ queryKey: ["nearby-strays-infinite"] })
      } else {
        queryClient.invalidateQueries({ queryKey: ["sightings"] })
      }
    },
  })
}
