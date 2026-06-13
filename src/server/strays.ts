import { strays, sightings, sightingPhotos } from 'db/schema'
import { desc, sql, eq, like, and, inArray } from 'drizzle-orm'
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

    // Resolve matching stray ids + distances in one pass:
    // 1. candidates: strays with any sighting in the bounding box (uses the
    //    sightings(lat, lng) index instead of scanning the whole table)
    // 2. latest: each candidate's most recent sighting (one window function
    //    instead of the correlated MAX subqueries recomputed per row)
    // 3. keep strays whose *latest* sighting is inside the box, computing
    //    the Haversine distance exactly once per stray
    const nearby = (await db.all(sql`
      WITH candidates AS (
        SELECT DISTINCT stray_id
        FROM sightings
        WHERE lat BETWEEN ${minLat} AND ${maxLat}
          AND lng BETWEEN ${minLng} AND ${maxLng}
      ),
      latest AS (
        SELECT
          s.stray_id AS stray_id,
          s.lat AS lat,
          s.lng AS lng,
          ROW_NUMBER() OVER (
            PARTITION BY s.stray_id
            ORDER BY s.sighting_time DESC
          ) AS rn
        FROM sightings s
        JOIN candidates c ON c.stray_id = s.stray_id
      ),
      latest_in_box AS (
        SELECT
          stray_id,
          (6371 * acos(
            cos(${lat} * 3.141592653589793 / 180) * cos(lat * 3.141592653589793 / 180)
              * cos((lng * 3.141592653589793 / 180) - (${lng} * 3.141592653589793 / 180))
            + sin(${lat} * 3.141592653589793 / 180) * sin(lat * 3.141592653589793 / 180)
          )) AS distance
        FROM latest
        WHERE rn = 1
          AND lat BETWEEN ${minLat} AND ${maxLat}
          AND lng BETWEEN ${minLng} AND ${maxLng}
      )
      SELECT stray_id, distance
      FROM latest_in_box
      WHERE distance < ${radius}
      ORDER BY distance
      LIMIT ${limit} OFFSET ${offset}
    `)) as { stray_id: number; distance: number }[]

    if (nearby.length === 0) return []

    const ids = nearby.map(row => row.stray_id)
    const found = await db.query.strays.findMany({
      where: inArray(strays.id, ids),
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

    // Restore distance ordering (inArray does not preserve it) and expose
    // the computed distance so clients don't have to recompute it
    const byId = new Map(found.map(stray => [stray.id, stray]))
    return nearby.flatMap(({ stray_id, distance }) => {
      const stray = byId.get(stray_id)
      return stray ? [{ ...stray, distance }] : []
    })
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
