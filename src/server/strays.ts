import { strays, sightings, sightingPhotos } from 'db/schema'
import { desc, sql, eq, like, and } from 'drizzle-orm'
import { getDb } from 'db'
import { createServerFn } from '@tanstack/react-start'
import { userMw } from '~/utils/auth-middleware'
import z from 'zod'

// Get nearby strays based on their latest sighting
export const getNearbyStrays = createServerFn({ method: 'GET' })
  .middleware([userMw])
  .inputValidator((input: { lat: number; lng: number; radius?: number; limit?: number; offset?: number }) => {
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
  .handler(async ({ data: { lat, lng, radius = 5, limit = 10, offset = 0 } }) => {
    const db = await getDb()

    // 1 degree of latitude is approximately 111km
    // 1 degree of longitude is approximately 111km * cos(latitude)
    const latDelta = radius / 111
    const lngDelta = radius / (111 * Math.cos(lat * (Math.PI / 180)))

    const minLat = lat - latDelta
    const maxLat = lat + latDelta
    const minLng = lng - lngDelta
    const maxLng = lng + lngDelta

    const result = await db.query.strays.findMany({
      where: sql`EXISTS (
        SELECT 1 FROM sightings s 
        WHERE s.stray_id = strays.id 
        AND s.sighting_time = (SELECT MAX(s2.sighting_time) FROM sightings s2 WHERE s2.stray_id = strays.id)
        AND s.lat BETWEEN ${minLat} AND ${maxLat}
        AND s.lng BETWEEN ${minLng} AND ${maxLng}
        AND (6371 * acos(cos(${lat} * 3.141592653589793 / 180) * cos(s.lat * 3.141592653589793 / 180) * cos((s.lng * 3.141592653589793 / 180) - (${lng} * 3.141592653589793 / 180)) + sin(${lat} * 3.141592653589793 / 180) * sin(s.lat * 3.141592653589793 / 180))) < ${radius}
      )`,
      orderBy: sql`(6371 * acos(cos(${lat} * 3.141592653589793 / 180) * cos((SELECT s.lat FROM sightings s WHERE s.stray_id = strays.id ORDER BY s.sighting_time DESC LIMIT 1) * 3.141592653589793 / 180) * cos(((SELECT s.lng FROM sightings s WHERE s.stray_id = strays.id ORDER BY s.sighting_time DESC LIMIT 1) * 3.141592653589793 / 180) - (${lng} * 3.141592653589793 / 180)) + sin(${lat} * 3.141592653589793 / 180) * sin((SELECT s.lat FROM sightings s WHERE s.stray_id = strays.id ORDER BY s.sighting_time DESC LIMIT 1) * 3.141592653589793 / 180)))`,
      limit,
      offset,
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
// Search strays with flexible filtering options
export const searchStrays = createServerFn({ method: 'GET' })
  .middleware([userMw])
  .inputValidator(
    z.object({
      species: z.enum(['cat', 'dog', 'other']).optional(),
      status: z
        .enum(['spotted', 'being_cared_for', 'adopted', 'deceased'])
        .optional(),
      size: z.enum(['small', 'medium', 'large']).optional(),
      search: z.string().optional(), // For name/description search
      limit: z.number().positive().default(100),
    })
  )
  .handler(async ({ data: { species, status, size, search, limit = 100 } }) => {
    const db = await getDb()

    const whereConditions = []

    if (species) {
      whereConditions.push(eq(strays.species, species))
    }

    if (status) {
      whereConditions.push(eq(strays.status, status))
    }

    if (size) {
      whereConditions.push(eq(strays.size, size))
    }

    if (search) {
      const searchPattern = `%${search}%`
      whereConditions.push(
        sql`${strays.name} LIKE ${searchPattern} OR ${strays.description} LIKE ${searchPattern} OR ${strays.colors} LIKE ${searchPattern} OR ${strays.markings} LIKE ${searchPattern}`
      )
    }

    const whereCondition =
      whereConditions.length > 0 ? and(...whereConditions) : undefined

    const result = await db.query.strays.findMany({
      where: whereCondition,
      orderBy: [desc(strays.updatedAt)],
      limit,
    })

    return result
  })

// Get a single stray by ID with related data
export const getStrayById = createServerFn({ method: 'GET' })
  .middleware([userMw])
  .inputValidator(z.object({ id: z.number().positive() }))
  .handler(async ({ data: { id } }) => {
    const db = await getDb()

    const result = await db.query.strays.findFirst({
      where: eq(strays.id, id),
      with: {
        caretaker: true,
        sightings: {
          orderBy: [desc(sightings.sightingTime)],
          limit: 10,
          with: {
            user: true,
            sightingPhotos: {
              orderBy: [desc(sightingPhotos.uploadedAt)],
              limit: 3,
            },
          },
        },
      },
    })

    if (!result) {
      throw new Error('Stray not found')
    }

    return result
  })
