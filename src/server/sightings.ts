import { sightings, strays, sightingPhotos, communityPosts } from 'db/schema'
import { eq, desc, asc, sql, and } from 'drizzle-orm'
import { getDb } from 'db'
import { createServerFn } from '@tanstack/react-start'
import type { InsertSighting } from 'db/schema'
import { env } from 'cloudflare:workers'
import z from 'zod'
import { adminOnlyMw, moderatorMw, userMw } from '../utils/auth-middleware'

const BUCKET_BASE_URL = 'https://stray-tracker-animal-photos.pages.dev'

// Get sightings within a certain radius of a lat/lng coordinate
export const getNearbySightings = createServerFn({ method: 'GET' })
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
  .middleware([userMw])
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
  .middleware([userMw])
  .inputValidator(
    (
      data: Omit<InsertSighting, 'strayId' | 'userId'> & {
        strayId?: number
        species?: string
        animalSize?: string
        location?: InsertSighting['location'] | null
        imageKeys?: string[] // Temporary image keys to finalize
        strayName?: string
      }
    ) => data
  )
  .handler(async ({ data, context }) => {
    const db = await getDb()
    const userId = (context.session as any)?.user?.id

    let strayId = data.strayId

    // If no strayId provided, create a new stray
    if (!strayId) {
      const newStray = await db
        .insert(strays)
        .values({
          name: data.strayName,
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
    const sighting = result[0]
    const bucket = env.ANIMAL_PHOTOS_BUCKET
    // Finalize image uploads if temp keys provided
    if (data.imageKeys && data.imageKeys.length > 0) {
      const sightingPhotoRecords = []

      for (let i = 0; i < data.imageKeys.length; i++) {
        const imagekey = data.imageKeys[i]

        // check if file actually exist
        const image = await bucket.head(imagekey)
        if (!image) continue

        try {
          const fileName = imagekey.split('/').pop() || 'unknown'
          const mimeType =
            image.httpMetadata?.contentType || 'application/octet-stream'
          const url = `${BUCKET_BASE_URL}/${imagekey}`

          sightingPhotoRecords.push({
            sightingId: sighting.id,
            userId,
            url,
            fileName,
            fileSize: image.size,
            mimeType,
          })
        } catch (error) {
          console.error(`Failed to process image ${imagekey}:`, error)
          // Continue with other images even if one fails
        }
      }

      // Insert sighting photo records
      if (sightingPhotoRecords.length > 0) {
        await db.insert(sightingPhotos).values(sightingPhotoRecords)
      }
    }

    // Fetch the complete sighting with relations to return
    const fullSighting = await db.query.sightings.findFirst({
      where: eq(sightings.id, sighting.id),
      with: {
        stray: true,
        user: true,
        sightingPhotos: true,
      },
    })

    if (!fullSighting) throw new Error('Failed to retrieve created sighting')

    return fullSighting
  })

// Update a sighting
export const updateSighting = createServerFn({ method: 'POST' })
  .middleware([moderatorMw])
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
  .middleware([userMw])
  .inputValidator((id: number) => id)
  .handler(async ({ data: id, context }) => {
    const db = await getDb()
    const session = context.session

    if (!session) {
      throw new Error('Unauthorized')
    }

    // Check if sighting exists
    const existing = await db.query.sightings.findFirst({
      where: eq(sightings.id, id),
    })

    if (!existing) {
      throw new Error('Sighting not found')
    }

    // Check permissions: Admin or Creator
    const isAdmin = (session.user as any).role === 'admin'
    const isCreator = existing.userId === session.user.id

    if (!isAdmin && !isCreator) {
      throw new Error('Unauthorized to delete this sighting')
    }

    // 1. Fetch related photos to delete from R2
    const photos = await db.query.sightingPhotos.findMany({
      where: eq(sightingPhotos.sightingId, id),
    })

    // 2. Delete photos from R2
    const bucket = env.ANIMAL_PHOTOS_BUCKET
    if (bucket) {
      await Promise.all(
        photos.map(async photo => {
          try {
            // Extract key from URL
            // URL format: https://stray-tracker-animal-photos.pages.dev/sessionId/filename
            const key = photo.url.replace(`${BUCKET_BASE_URL}/`, '')
            if (key) {
              await bucket.delete(key)
            }
          } catch (error) {
            console.error(`Failed to delete R2 file for photo ${photo.id}:`, error)
          }
        })
      )
    }

    // 3. Delete related records from DB
    // Delete sighting photos
    await db.delete(sightingPhotos).where(eq(sightingPhotos.sightingId, id))

    // Delete community posts related to this sighting
    await db.delete(communityPosts).where(eq(communityPosts.sightingId, id))

    // 4. Delete the sighting
    const result = await db
      .delete(sightings)
      .where(eq(sightings.id, id))
      .returning()

    return result[0]
  })

// Get sightings for a specific stray
export const getSightingsForStray = createServerFn({ method: 'GET' })
  .middleware([userMw])
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
  .middleware([userMw])
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

// Search sightings with flexible filtering options
export const searchSightings = createServerFn({ method: 'GET' })
  .middleware([userMw])
  .inputValidator(
    z.object({
      strayId: z.number().optional(),
      excludeSightingId: z.number().optional(),
      userId: z.string().optional(),
      limit: z.number().positive().default(50),
    })
  )
  .handler(
    async ({ data: { strayId, excludeSightingId, userId, limit = 50 } }) => {
      const db = await getDb()

      const whereConditions = []

      if (strayId !== undefined) {
        whereConditions.push(eq(sightings.strayId, strayId))
      }

      if (excludeSightingId !== undefined) {
        whereConditions.push(sql`${sightings.id} != ${excludeSightingId}`)
      }

      if (userId !== undefined) {
        whereConditions.push(eq(sightings.userId, userId))
      }

      const whereCondition =
        whereConditions.length > 0 ? and(...whereConditions) : undefined

      const result = await db.query.sightings.findMany({
        where: whereCondition,
        with: {
          stray: true,
        },
        orderBy: [desc(sightings.sightingTime || sightings.createdAt)],
        limit,
      })

      return result
    }
  )
