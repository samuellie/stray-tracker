import { sightingPhotos } from 'db/schema'
import { eq } from 'drizzle-orm'
import { getDb } from 'db'
import { createServerFn } from '@tanstack/react-start'

// Get sighting photos for a specific sighting
export const getSightingPhotos = createServerFn({ method: 'GET' })
  .inputValidator((sightingId: number) => sightingId)
  .handler(async ({ data: sightingId }) => {
    const db = await getDb()
    const result = await db.query.sightingPhotos.findMany({
      where: eq(sightingPhotos.sightingId, sightingId),
    })

    return result
  })
