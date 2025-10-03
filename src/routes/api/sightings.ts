import { sightings, strays } from 'db/schema'
import { eq, desc, asc } from 'drizzle-orm'
import { getDb } from 'db'
import { createServerFn } from '@tanstack/react-start'
import type { InsertSighting, Sighting } from 'db/schema'

// Get all sightings with stray information
export const getSightings = createServerFn({ method: 'GET' })
  .inputValidator(() => null)
  .handler(async () => {
    const db = await getDb()
    const result = await db.query.sightings.findMany({
      with: {
        stray: true,
      },
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
      data: Omit<InsertSighting, 'strayId'> & {
        strayId?: number
        species?: string
        animalSize?: string
      }
    ) => data
  )
  .handler(async ({ data }) => {
    const db = await getDb()

    let strayId = data.strayId

    // If no strayId provided, create a new stray
    if (!strayId) {
      if (!data.species || !data.animalSize) {
        throw new Error(
          'Species and size are required when reporting a new animal'
        )
      }

      // Validate species enum
      if (!['cat', 'dog', 'other'].includes(data.species)) {
        throw new Error('Invalid species. Must be cat, dog, or other')
      }

      // Validate size enum
      if (!['small', 'medium', 'large'].includes(data.animalSize)) {
        throw new Error('Invalid size. Must be small, medium, or large')
      }

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

    const result = await db
      .insert(sightings)
      .values({
        ...data,
        strayId,
      })
      .returning()

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
