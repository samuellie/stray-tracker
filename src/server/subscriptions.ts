import { sightingPhotos, sightings, straySubscriptions } from 'db/schema'
import { and, desc, eq } from 'drizzle-orm'
import { getDb } from 'db'
import { createServerFn } from '@tanstack/react-start'
import { userMw } from '~/utils/auth-middleware'
import z from 'zod'

// Whether the caller follows the given stray
export const isFollowingStray = createServerFn({ method: 'GET' })
  .middleware([userMw])
  .inputValidator(z.object({ strayId: z.number().positive() }))
  .handler(async ({ data: { strayId }, context }) => {
    const db = await getDb()
    const userId = (context.session as any)?.user?.id as string

    const subscription = await db.query.straySubscriptions.findFirst({
      where: and(
        eq(straySubscriptions.strayId, strayId),
        eq(straySubscriptions.userId, userId),
        eq(straySubscriptions.isActive, true)
      ),
    })
    return { following: !!subscription }
  })

// Follow or unfollow a stray
export const setFollowStray = createServerFn({ method: 'POST' })
  .middleware([userMw])
  .inputValidator(
    z.object({ strayId: z.number().positive(), follow: z.boolean() })
  )
  .handler(async ({ data: { strayId, follow }, context }) => {
    const db = await getDb()
    const userId = (context.session as any)?.user?.id as string

    if (follow) {
      await db
        .insert(straySubscriptions)
        .values({ strayId, userId, isActive: true })
        .onConflictDoUpdate({
          target: [straySubscriptions.strayId, straySubscriptions.userId],
          set: { isActive: true },
        })
    } else {
      await db
        .update(straySubscriptions)
        .set({ isActive: false })
        .where(
          and(
            eq(straySubscriptions.strayId, strayId),
            eq(straySubscriptions.userId, userId)
          )
        )
    }
    return { strayId, following: follow }
  })

// The caller's followed strays with each stray's latest sighting
export const getFollowedStrays = createServerFn({ method: 'GET' })
  .middleware([userMw])
  .handler(async ({ context }) => {
    const db = await getDb()
    const userId = (context.session as any)?.user?.id as string

    const subscriptions = await db.query.straySubscriptions.findMany({
      where: and(
        eq(straySubscriptions.userId, userId),
        eq(straySubscriptions.isActive, true)
      ),
      orderBy: [desc(straySubscriptions.createdAt)],
      with: {
        stray: {
          with: {
            sightings: {
              orderBy: [desc(sightings.sightingTime)],
              limit: 1,
              with: {
                sightingPhotos: {
                  limit: 1,
                  orderBy: [desc(sightingPhotos.uploadedAt)],
                },
              },
            },
          },
        },
      },
    })

    // Location-based subscriptions have no stray attached
    return subscriptions.filter(subscription => subscription.stray != null)
  })
