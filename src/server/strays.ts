import { strays, sightings, sightingPhotos } from 'db/schema'
import { desc, sql } from 'drizzle-orm'
import { getDb } from 'db'
import { createServerFn } from '@tanstack/react-start'
import { userMw } from '~/utils/auth-middleware'

// Get nearby strays based on their latest sighting
export const getNearbyStrays = createServerFn({ method: 'GET' })
  .middleware([userMw])
  .inputValidator((input: { lat: number; lng: number; radius?: number }) => {
    if (typeof input.lat !== 'number' || typeof input.lng !== 'number') {
      throw new Error('lat and lng must be numbers')
    }
    if (
      input.radius !== undefined &&
      (typeof input.radius !== 'number' || input.radius <= 0)
    ) {
      throw new Error('radius must be a positive number')
    }
    return input
  })
  .handler(async ({ data: { lat, lng, radius = 5 } }) => {
    const db = await getDb()

    const result = await db.query.strays.findMany({
      where: sql`EXISTS (SELECT 1 FROM sightings s WHERE s.stray_id = strays.id AND s.sighting_time = (SELECT MAX(s2.sighting_time) FROM sightings s2 WHERE s2.stray_id = strays.id) AND (6371 * acos(cos(${lat} * 3.141592653589793 / 180) * cos(s.lat * 3.141592653589793 / 180) * cos((s.lng * 3.141592653589793 / 180) - (${lng} * 3.141592653589793 / 180)) + sin(${lat} * 3.141592653589793 / 180) * sin(s.lat * 3.141592653589793 / 180))) < ${radius})`,
      with: {
        sightings: {
          orderBy: [desc(sightings.sightingTime)],
          limit: 1,
          with: {
            user: true,
            sightingPhotos: {
              limit: 1,
              orderBy: [desc(sightingPhotos.uploadedAt)],
            },
          },
        },
      },
    })
    return result
  })
