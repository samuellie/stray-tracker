import { namingSuggestions, namingVotes, strays } from 'db/schema'
import { and, asc, eq, sql } from 'drizzle-orm'
import { getDb } from 'db'
import { createServerFn } from '@tanstack/react-start'
import { moderatorMw, userMw } from '~/utils/auth-middleware'
import z from 'zod'

// List naming suggestions for a stray with vote totals and the caller's vote
export const getNamingSuggestions = createServerFn({ method: 'GET' })
  .middleware([userMw])
  .inputValidator(z.object({ strayId: z.number().positive() }))
  .handler(async ({ data: { strayId }, context }) => {
    const db = await getDb()
    const userId = (context.session as any)?.user?.id as string

    const rows = await db
      .select({
        id: namingSuggestions.id,
        name: namingSuggestions.name,
        description: namingSuggestions.description,
        isSelected: namingSuggestions.isSelected,
        userId: namingSuggestions.userId,
        createdAt: namingSuggestions.createdAt,
        score: sql<number>`coalesce(sum(${namingVotes.vote}), 0)`,
        myVote: sql<number>`coalesce(max(case when ${namingVotes.userId} = ${userId} then ${namingVotes.vote} end), 0)`,
      })
      .from(namingSuggestions)
      .leftJoin(
        namingVotes,
        eq(namingVotes.namingSuggestionId, namingSuggestions.id)
      )
      .where(eq(namingSuggestions.strayId, strayId))
      .groupBy(namingSuggestions.id)
      .orderBy(
        sql`coalesce(sum(${namingVotes.vote}), 0) desc`,
        asc(namingSuggestions.createdAt)
      )

    return rows
  })

// Suggest a name for a stray
export const suggestName = createServerFn({ method: 'POST' })
  .middleware([userMw])
  .inputValidator(
    z.object({
      strayId: z.number().positive(),
      name: z.string().trim().min(1).max(50),
    })
  )
  .handler(async ({ data: { strayId, name }, context }) => {
    const db = await getDb()
    const userId = (context.session as any)?.user?.id as string

    const stray = await db.query.strays.findFirst({
      where: eq(strays.id, strayId),
    })
    if (!stray) {
      throw new Error('Stray not found')
    }

    const duplicate = await db.query.namingSuggestions.findFirst({
      where: and(
        eq(namingSuggestions.strayId, strayId),
        sql`lower(${namingSuggestions.name}) = lower(${name})`
      ),
    })
    if (duplicate) {
      throw new Error(`"${name}" has already been suggested for this stray`)
    }

    const [suggestion] = await db
      .insert(namingSuggestions)
      .values({ strayId, userId, name })
      .returning()

    // Suggesting a name counts as an upvote for it
    await db
      .insert(namingVotes)
      .values({ namingSuggestionId: suggestion.id, userId, vote: 1 })
      .onConflictDoNothing()

    return suggestion
  })

// Vote on a naming suggestion: 1 = upvote, -1 = downvote, 0 = remove vote
export const voteName = createServerFn({ method: 'POST' })
  .middleware([userMw])
  .inputValidator(
    z.object({
      suggestionId: z.number().positive(),
      vote: z.union([z.literal(1), z.literal(-1), z.literal(0)]),
    })
  )
  .handler(async ({ data: { suggestionId, vote }, context }) => {
    const db = await getDb()
    const userId = (context.session as any)?.user?.id as string

    const suggestion = await db.query.namingSuggestions.findFirst({
      where: eq(namingSuggestions.id, suggestionId),
    })
    if (!suggestion) {
      throw new Error('Suggestion not found')
    }

    if (vote === 0) {
      await db
        .delete(namingVotes)
        .where(
          and(
            eq(namingVotes.namingSuggestionId, suggestionId),
            eq(namingVotes.userId, userId)
          )
        )
      return { suggestionId, vote }
    }

    await db
      .insert(namingVotes)
      .values({ namingSuggestionId: suggestionId, userId, vote })
      .onConflictDoUpdate({
        target: [namingVotes.namingSuggestionId, namingVotes.userId],
        set: { vote },
      })

    return { suggestionId, vote }
  })

// Select the winning name (moderators/admins); writes it onto the stray
export const selectName = createServerFn({ method: 'POST' })
  .middleware([moderatorMw])
  .inputValidator(z.object({ suggestionId: z.number().positive() }))
  .handler(async ({ data: { suggestionId } }) => {
    const db = await getDb()

    const suggestion = await db.query.namingSuggestions.findFirst({
      where: eq(namingSuggestions.id, suggestionId),
    })
    if (!suggestion) {
      throw new Error('Suggestion not found')
    }

    await db
      .update(namingSuggestions)
      .set({ isSelected: false })
      .where(eq(namingSuggestions.strayId, suggestion.strayId))
    await db
      .update(namingSuggestions)
      .set({ isSelected: true })
      .where(eq(namingSuggestions.id, suggestionId))
    const [updatedStray] = await db
      .update(strays)
      .set({ name: suggestion.name, updatedAt: new Date() })
      .where(eq(strays.id, suggestion.strayId))
      .returning()

    return updatedStray
  })
