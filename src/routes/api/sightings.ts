import { sightings, strays } from 'db/schema'
import { eq, desc, asc, sql } from 'drizzle-orm'
import { getDb } from 'db'
import { createServerFn } from '@tanstack/react-start'
import type { InsertSighting, Sighting } from 'db/schema'

// Get sightings within a certain radius of a lat/lng coordinate
export const getNearbySightings = createServerFn({ method: 'GET' })
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

    // Use haversine formula to calculate distance in kilometers
    // Earth's radius is approximately 6371 km
    // Convert degrees to radians: degrees * π / 180
    const result = await db.query.sightings.findMany({
      where: sql`(6371 * acos(cos(${lat} * 3.141592653589793 / 180) * cos(${sightings.lat} * 3.141592653589793 / 180) * cos((${sightings.lng} * 3.141592653589793 / 180) - (${lng} * 3.141592653589793 / 180)) + sin(${lat} * 3.141592653589793 / 180) * sin(${sightings.lat} * 3.141592653589793 / 180))) < ${radius}`,
      with: {
        stray: true,
      },
      orderBy: [desc(sightings.sightingTime || sightings.createdAt)],
    })

    return result
  })

// Get a single sighting by ID
export const getSighting = createServerFn({ method: 'GET' })
  .inputValidator((id: number) => id)
  .handler(async ({ data: id }) => {
    const db = await getDb()
    const result = await db.query.sightings.findFirst({
      where: eq(sightings.id, id),
      with: {
        stray: true,
      },
    })

    if (!result) {
      throw new Error('Sighting not found')
    }

    return result
  })

// Create a new sighting
export const createSighting = createServerFn({ method: 'POST' })
  .inputValidator(
    (
      data: Omit<InsertSighting, 'strayId' | 'userId'> & {
        strayId?: number
        species?: string
        animalSize?: string
        location?: InsertSighting['location'] | null
      }
    ) => data
  )
  .handler(async ({ data, context }) => {
    const db = await getDb()
    const userId = context.session?.user.id
    if (!userId) {
      throw new Error('User not authenticated')
    }

    let strayId = data.strayId

    // If no strayId provided, create a new stray
    if (!strayId) {
      const newStray = await db
        .insert(strays)
        .values({
          species: data.species as 'cat' | 'dog' | 'other',
          size: data.animalSize as 'small' | 'medium' | 'large',
          status: 'spotted',
        })
        .returning()

      strayId = newStray[0].id
    } else {
      // Validate that the stray exists if strayId is provided
      const stray = await db.query.strays.findFirst({
        where: eq(strays.id, strayId),
      })

      if (!stray) {
        throw new Error('Stray not found')
      }
    }

    const insertData: InsertSighting = {
      ...data,
      userId,
      strayId,
      location: data.location!, // Assert it's not null since form should provide it
    }

    const result = await db.insert(sightings).values(insertData).returning()

    return result[0]
  })

// Update a sighting
export const updateSighting = createServerFn({ method: 'POST' })
  .inputValidator(
    (input: { id: number; data: Partial<InsertSighting> }) => input
  )
  .handler(async ({ data: { id, data } }) => {
    const db = await getDb()

    // Check if sighting exists
    const existing = await db.query.sightings.findFirst({
      where: eq(sightings.id, id),
    })

    if (!existing) {
      throw new Error('Sighting not found')
    }

    // If strayId is being updated, validate the new stray exists
    if (data.strayId !== undefined) {
      const stray = await db.query.strays.findFirst({
        where: eq(strays.id, data.strayId),
      })

      if (!stray) {
        throw new Error('Stray not found')
      }
    }

    const result = await db
      .update(sightings)
      .set(data)
      .where(eq(sightings.id, id))
      .returning()

    return result[0]
  })

// Delete a sighting
export const deleteSighting = createServerFn({ method: 'POST' })
  .inputValidator((id: number) => id)
  .handler(async ({ data: id }) => {
    const db = await getDb()

    // Check if sighting exists
    const existing = await db.query.sightings.findFirst({
      where: eq(sightings.id, id),
    })

    if (!existing) {
      throw new Error('Sighting not found')
    }

    const result = await db
      .delete(sightings)
      .where(eq(sightings.id, id))
      .returning()

    return result[0]
  })

// Get sightings for a specific stray
export const getSightingsForStray = createServerFn({ method: 'GET' })
  .inputValidator((strayId: number) => strayId)
  .handler(async ({ data: strayId }) => {
    const db = await getDb()
    const result = await db.query.sightings.findMany({
      where: eq(sightings.strayId, strayId),
      orderBy: [asc(sightings.sightingTime || sightings.createdAt)],
    })

    return result
  })

// Get sightings by user
export const getUserSightings = createServerFn({ method: 'GET' })
  .inputValidator((userId: string) => userId)
  .handler(async ({ data: userId }) => {
    const db = await getDb()
    const result = await db.query.sightings.findMany({
      where: eq(sightings.userId, userId),
      with: {
        stray: true,
      },
      orderBy: [desc(sightings.sightingTime || sightings.createdAt)],
    })

    return result
  })
