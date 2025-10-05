import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createSighting } from '~/routes/api/sightings'
import type { InsertSighting } from 'db/schema'

// Custom hook for creating a new sighting
export function useCreateSighting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (
      data: Omit<InsertSighting, 'strayId'> & {
        strayId?: number
        species?: string
        animalSize?: string
      }
    ) => createSighting({ data }),
    onSuccess: () => {
      // Invalidate and refetch sightings data
      queryClient.invalidateQueries({ queryKey: ['sightings'] })
    },
  })
}
