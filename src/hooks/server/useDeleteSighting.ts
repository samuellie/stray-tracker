import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteSighting } from '~/server/sightings'

// Custom hook for deleting a sighting
export function useDeleteSighting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteSighting({ data: id }),
    onSuccess: () => {
      // Invalidate and refetch sightings and strays data
      queryClient.invalidateQueries({ queryKey: ['sightings'] })
      queryClient.invalidateQueries({ queryKey: ['strays'] })
      queryClient.invalidateQueries({ queryKey: ['stray'] })
    },
  })
}
