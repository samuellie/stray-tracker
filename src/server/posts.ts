import { communityPosts, postComments, postReactions } from 'db/schema'
import { and, desc, eq, inArray, sql } from 'drizzle-orm'
import { getDb } from 'db'
import { createServerFn } from '@tanstack/react-start'
import { userMw } from '~/utils/auth-middleware'
import z from 'zod'

const REACTION_TYPES = ['like', 'love', 'care', 'laugh', 'celebrate'] as const

// Paginated community feed with author, related stray and caller's reaction
export const getCommunityPosts = createServerFn({ method: 'GET' })
  .middleware([userMw])
  .inputValidator(
    z.object({
      limit: z.number().positive().max(50).default(10),
      offset: z.number().nonnegative().default(0),
    })
  )
  .handler(async ({ data: { limit = 10, offset = 0 }, context }) => {
    const db = await getDb()
    const userId = (context.session as any)?.user?.id as string

    const posts = await db.query.communityPosts.findMany({
      where: eq(communityPosts.isPublished, true),
      orderBy: [desc(communityPosts.publishedAt)],
      limit,
      offset,
      with: {
        author: true,
        stray: true,
      },
    })

    if (posts.length === 0) return []

    const myReactions = await db.query.postReactions.findMany({
      where: and(
        inArray(
          postReactions.postId,
          posts.map(post => post.id)
        ),
        eq(postReactions.userId, userId)
      ),
    })
    const reactionByPostId = new Map(
      myReactions.map(reaction => [reaction.postId, reaction.reactionType])
    )

    return posts.map(post => ({
      ...post,
      myReaction: reactionByPostId.get(post.id) ?? null,
    }))
  })

// Create a community post, optionally linked to a stray
export const createPost = createServerFn({ method: 'POST' })
  .middleware([userMw])
  .inputValidator(
    z.object({
      content: z.string().trim().min(1).max(2000),
      title: z.string().trim().max(200).optional(),
      postType: z
        .enum(['story', 'announcement', 'help', 'general'])
        .default('general'),
      strayId: z.number().positive().optional(),
    })
  )
  .handler(async ({ data, context }) => {
    const db = await getDb()
    const userId = (context.session as any)?.user?.id as string

    const [post] = await db
      .insert(communityPosts)
      .values({
        authorId: userId,
        content: data.content,
        title: data.title || null,
        postType: data.postType,
        strayId: data.strayId,
      })
      .returning()

    return post
  })

// Set or clear the caller's reaction on a post; keeps likeCount in sync
export const reactToPost = createServerFn({ method: 'POST' })
  .middleware([userMw])
  .inputValidator(
    z.object({
      postId: z.number().positive(),
      reaction: z.enum(REACTION_TYPES).nullable(),
    })
  )
  .handler(async ({ data: { postId, reaction }, context }) => {
    const db = await getDb()
    const userId = (context.session as any)?.user?.id as string

    const post = await db.query.communityPosts.findFirst({
      where: eq(communityPosts.id, postId),
    })
    if (!post) throw new Error('Post not found')

    if (reaction === null) {
      await db
        .delete(postReactions)
        .where(
          and(
            eq(postReactions.postId, postId),
            eq(postReactions.userId, userId)
          )
        )
    } else {
      await db
        .insert(postReactions)
        .values({ postId, userId, reactionType: reaction })
        .onConflictDoUpdate({
          target: [postReactions.postId, postReactions.userId],
          set: { reactionType: reaction },
        })
    }

    // Recompute instead of incrementing so the counter can't drift
    await db.update(communityPosts).set({
      likeCount: sql`(SELECT count(*) FROM post_reactions WHERE post_id = ${postId})`,
    }).where(eq(communityPosts.id, postId))

    return { postId, reaction }
  })

// Comments for a post, oldest first
export const getPostComments = createServerFn({ method: 'GET' })
  .middleware([userMw])
  .inputValidator(z.object({ postId: z.number().positive() }))
  .handler(async ({ data: { postId } }) => {
    const db = await getDb()
    return db.query.postComments.findMany({
      where: eq(postComments.postId, postId),
      orderBy: [postComments.createdAt],
      with: { author: true },
    })
  })

// Add a comment to a post; keeps commentCount in sync
export const addPostComment = createServerFn({ method: 'POST' })
  .middleware([userMw])
  .inputValidator(
    z.object({
      postId: z.number().positive(),
      content: z.string().trim().min(1).max(1000),
    })
  )
  .handler(async ({ data: { postId, content }, context }) => {
    const db = await getDb()
    const userId = (context.session as any)?.user?.id as string

    const post = await db.query.communityPosts.findFirst({
      where: eq(communityPosts.id, postId),
    })
    if (!post) throw new Error('Post not found')

    const [comment] = await db
      .insert(postComments)
      .values({ postId, authorId: userId, content })
      .returning()

    await db.update(communityPosts).set({
      commentCount: sql`(SELECT count(*) FROM post_comments WHERE post_id = ${postId})`,
    }).where(eq(communityPosts.id, postId))

    return comment
  })

// Delete a post (author, moderator or admin)
export const deletePost = createServerFn({ method: 'POST' })
  .middleware([userMw])
  .inputValidator(z.object({ postId: z.number().positive() }))
  .handler(async ({ data: { postId }, context }) => {
    const db = await getDb()
    const session = context.session as any
    const userId = session?.user?.id as string
    const role = session?.user?.role as string | undefined

    const post = await db.query.communityPosts.findFirst({
      where: eq(communityPosts.id, postId),
    })
    if (!post) throw new Error('Post not found')

    const isModerator = role === 'admin' || role === 'moderator'
    if (post.authorId !== userId && !isModerator) {
      throw new Error('Unauthorized to delete this post')
    }

    await db.delete(postReactions).where(eq(postReactions.postId, postId))
    await db.delete(postComments).where(eq(postComments.postId, postId))
    const [deleted] = await db
      .delete(communityPosts)
      .where(eq(communityPosts.id, postId))
      .returning()

    return deleted
  })
