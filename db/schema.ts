import { sqliteTable, text, integer, real, blob } from 'drizzle-orm/sqlite-core'
import { relations, sql } from 'drizzle-orm'
import * as authSchema from './auth.schema'

export * from './auth.schema'

// Stray table - detailed stray profiles
export const strays = sqliteTable('strays', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name'),
  species: text('species', { enum: ['cat', 'dog', 'other'] }).notNull(),
  breed: text('breed'),
  age: text('age', { enum: ['puppy', 'young', 'adult', 'senior'] }),
  size: text('size', { enum: ['small', 'medium', 'large'] }).notNull(),
  colors: text('colors'),
  markings: text('markings'),
  status: text('status', {
    enum: ['spotted', 'being_cared_for', 'adopted', 'deceased'],
  })
    .notNull()
    .default('spotted'),
  description: text('description'),
  healthNotes: text('health_notes'),
  careRequirements: text('care_requirements'),
  // Primary location stored as JSON
  primaryLocation: text('primary_location', { mode: 'json' }).$type<{
    lat: number
    lng: number
    address?: string
    neighborhood?: string
  }>(),
  caretakerId: integer('caretaker_id').references(() => authSchema.users.id),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
})
export const straysRelations = relations(strays, ({ one, many }) => ({
  caretaker: one(authSchema.users, {
    fields: [strays.caretakerId],
    references: [authSchema.users.id],
  }),
  sightings: many(sightings),
  strayPhotos: many(strayPhotos),
  straySubscriptions: many(straySubscriptions),
  namingSuggestions: many(namingSuggestions),
  communityPosts: many(communityPosts),
  medicalRecords: many(medicalRecords),
  careRecords: many(careRecords),
}))

// Sightings table - stray sighting reports
export const sightings = sqliteTable('sightings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  strayId: integer('stray_id')
    .references(() => strays.id)
    .notNull(),
  userId: text('user_id')
    .references(() => authSchema.users.id)
    .notNull(),
  // Separate lat/lng fields for easier querying
  lat: real('lat').notNull(),
  lng: real('lng').notNull(),
  // Location data as JSON for display
  location: text('location', { mode: 'json' }).$type<{
    address1?: string
    address2?: string
    city?: string
    postcode?: string
    country?: string
  }>(),
  description: text('description'),
  // Additional sighting metadata
  sightingTime: integer('sighting_time', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
})

export const sightingsRelations = relations(sightings, ({ one, many }) => ({
  stray: one(strays, {
    fields: [sightings.strayId],
    references: [strays.id],
  }),
  user: one(authSchema.users, {
    fields: [sightings.userId],
    references: [authSchema.users.id],
  }),
  sightingPhotos: many(sightingPhotos),
}))

// stray photos table - photos of strays
export const strayPhotos = sqliteTable('stray_photos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  strayId: integer('stray_id')
    .references(() => strays.id)
    .notNull(),
  userId: text('user_id')
    .references(() => authSchema.users.id)
    .notNull(),
  url: text('url').notNull(),
  fileName: text('file_name'),
  fileSize: integer('file_size'),
  mimeType: text('mime_type'),
  description: text('description'),
  // Whether this is the primary photo for the stray
  isPrimary: integer('is_primary', { mode: 'boolean' }).default(false),
  uploadedAt: integer('uploaded_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
})

export const strayPhotosRelations = relations(strayPhotos, ({ one }) => ({
  stray: one(strays, {
    fields: [strayPhotos.strayId],
    references: [strays.id],
  }),
  user: one(authSchema.users, {
    fields: [strayPhotos.userId],
    references: [authSchema.users.id],
  }),
}))

// Sighting photos table - photos from sightings
export const sightingPhotos = sqliteTable('sighting_photos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sightingId: integer('sighting_id')
    .references(() => sightings.id)
    .notNull(),
  userId: text('user_id')
    .references(() => authSchema.users.id)
    .notNull(),
  url: text('url').notNull(),
  fileName: text('file_name'),
  fileSize: integer('file_size'),
  mimeType: text('mime_type'),
  caption: text('caption'),
  uploadedAt: integer('uploaded_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
})

export const sightingPhotosRelations = relations(sightingPhotos, ({ one }) => ({
  sighting: one(sightings, {
    fields: [sightingPhotos.sightingId],
    references: [sightings.id],
  }),
  user: one(authSchema.users, {
    fields: [sightingPhotos.userId],
    references: [authSchema.users.id],
  }),
}))

// stray subscriptions table - user subscriptions to strays or locations
export const straySubscriptions = sqliteTable('stray_subscriptions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id')
    .references(() => authSchema.users.id)
    .notNull(),
  strayId: integer('stray_id').references(() => strays.id),
  // Location-based subscription stored as JSON
  location: text('location', { mode: 'json' }).$type<{
    lat: number
    lng: number
    radius: number // km
  }>(),
  // Notification preferences as JSON
  notificationPreferences: text('notification_preferences', {
    mode: 'json',
  }).$type<{
    immediate: boolean
    email: boolean
    push: boolean
    digest: 'daily' | 'weekly' | 'never'
  }>(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
})

export const straySubscriptionsRelations = relations(
  straySubscriptions,
  ({ one }) => ({
    user: one(authSchema.users, {
      fields: [straySubscriptions.userId],
      references: [authSchema.users.id],
    }),
    stray: one(strays, {
      fields: [straySubscriptions.strayId],
      references: [strays.id],
    }),
  })
)

// Naming suggestions table - community naming suggestions for strays
export const namingSuggestions = sqliteTable('naming_suggestions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  strayId: integer('stray_id')
    .references(() => strays.id)
    .notNull(),
  userId: text('user_id')
    .references(() => authSchema.users.id)
    .notNull(),
  name: text('name', { length: 50 }).notNull(),
  description: text('description'),
  isSelected: integer('is_selected', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
})

export const namingSuggestionsRelations = relations(
  namingSuggestions,
  ({ one, many }) => ({
    stray: one(strays, {
      fields: [namingSuggestions.strayId],
      references: [strays.id],
    }),
    user: one(authSchema.users, {
      fields: [namingSuggestions.userId],
      references: [authSchema.users.id],
    }),
    namingVotes: many(namingVotes),
  })
)

// Naming votes table - votes for naming suggestions
export const namingVotes = sqliteTable('naming_votes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  namingSuggestionId: integer('naming_suggestion_id')
    .references(() => namingSuggestions.id)
    .notNull(),
  userId: text('user_id')
    .references(() => authSchema.users.id)
    .notNull(),
  vote: integer('vote').notNull(), // 1 for upvote, -1 for downvote
  votedAt: integer('voted_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
})

export const namingVotesRelations = relations(namingVotes, ({ one }) => ({
  namingSuggestion: one(namingSuggestions, {
    fields: [namingVotes.namingSuggestionId],
    references: [namingSuggestions.id],
  }),
  user: one(authSchema.users, {
    fields: [namingVotes.userId],
    references: [authSchema.users.id],
  }),
}))

// Bounties table - requests for community help tracking locations
export const bounties = sqliteTable('bounties', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id')
    .references(() => authSchema.users.id)
    .notNull(),
  title: text('title', { length: 200 }).notNull(),
  description: text('description').notNull(),
  // Target location for tracking
  targetLocation: text('target_location', { mode: 'json' }).$type<{
    lat: number
    lng: number
    address?: string
    neighborhood?: string
  }>(),
  // Area type requested (neighborhood, streets, specific area)
  areaType: text('area_type', {
    enum: ['neighborhood', 'streets', 'specific'],
  }),
  status: text('status', {
    enum: ['open', 'in_progress', 'completed', 'cancelled'],
  }).default('open'),
  priority: text('priority', {
    enum: ['low', 'medium', 'high', 'urgent'],
  }).default('medium'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
})

export const bountiesRelations = relations(bounties, ({ one, many }) => ({
  user: one(authSchema.users, {
    fields: [bounties.userId],
    references: [authSchema.users.id],
  }),
  bountyAssignments: many(bountyAssignments),
}))

// Volunteer assignments table - assignments of volunteers to bounties
export const bountyAssignments = sqliteTable('bounty_assignments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  trackingRequestId: integer('tracking_request_id')
    .references(() => bounties.id)
    .notNull(),
  userId: text('user_id')
    .references(() => authSchema.users.id)
    .notNull(),
  status: text('status', {
    enum: ['assigned', 'accepted', 'completed', 'cancelled'],
  }).default('assigned'),
  assignedAt: integer('assigned_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
})

export const bountyAssignmentsRelations = relations(
  bountyAssignments,
  ({ one }) => ({
    bounty: one(bounties, {
      fields: [bountyAssignments.trackingRequestId],
      references: [bounties.id],
    }),
    user: one(authSchema.users, {
      fields: [bountyAssignments.userId],
      references: [authSchema.users.id],
    }),
  })
)

// Community posts table - community feed posts
export const communityPosts = sqliteTable('community_posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  authorId: integer('author_id')
    .references(() => authSchema.users.id)
    .notNull(),
  title: text('title', { length: 200 }),
  content: text('content').notNull(),
  // Post type for different content categories
  postType: text('post_type', {
    enum: ['story', 'announcement', 'help', 'general'],
  }).default('general'),
  // Related entities
  strayId: integer('stray_id').references(() => strays.id),
  sightingId: integer('sighting_id').references(() => sightings.id),
  // Location context
  location: text('location', { mode: 'json' }).$type<{
    lat: number
    lng: number
    address?: string
    neighborhood?: string
  }>(),
  // Images or media
  media: text('media', { mode: 'json' }).$type<string[]>(),
  // Engagement metrics
  likeCount: integer('like_count').default(0),
  commentCount: integer('comment_count').default(0),
  shareCount: integer('share_count').default(0),
  isPublished: integer('is_published', { mode: 'boolean' }).default(true),
  publishedAt: integer('published_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
})

export const communityPostsRelations = relations(
  communityPosts,
  ({ one, many }) => ({
    author: one(authSchema.users, {
      fields: [communityPosts.authorId],
      references: [authSchema.users.id],
    }),
    stray: one(strays, {
      fields: [communityPosts.strayId],
      references: [strays.id],
    }),
    sighting: one(sightings, {
      fields: [communityPosts.sightingId],
      references: [sightings.id],
    }),
    postComments: many(postComments),
    postReactions: many(postReactions),
  })
)

// Post comments table - comments on community posts
export const postComments = sqliteTable('post_comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  postId: integer('post_id')
    .references(() => communityPosts.id)
    .notNull(),
  authorId: integer('author_id')
    .references(() => authSchema.users.id)
    .notNull(),
  parentId: integer('parent_id'), // For threaded comments - nullable without reference for now
  content: text('content').notNull(),
  likeCount: integer('like_count').default(0),
  isEdited: integer('is_edited', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
})

export const postCommentsRelations = relations(
  postComments,
  ({ one, many }) => ({
    post: one(communityPosts, {
      fields: [postComments.postId],
      references: [communityPosts.id],
    }),
    author: one(authSchema.users, {
      fields: [postComments.authorId],
      references: [authSchema.users.id],
    }),
    parent: one(postComments, {
      fields: [postComments.parentId],
      references: [postComments.id],
    }),
    replies: many(postComments),
  })
)

// Post reactions table - likes and reactions to posts
export const postReactions = sqliteTable('post_reactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  postId: integer('post_id')
    .references(() => communityPosts.id)
    .notNull(),
  userId: text('user_id')
    .references(() => authSchema.users.id)
    .notNull(),
  reactionType: text('reaction_type', {
    enum: ['like', 'love', 'care', 'laugh', 'celebrate'],
  }).default('like'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
})

export const postReactionsRelations = relations(postReactions, ({ one }) => ({
  post: one(communityPosts, {
    fields: [postReactions.postId],
    references: [communityPosts.id],
  }),
  user: one(authSchema.users, {
    fields: [postReactions.userId],
    references: [authSchema.users.id],
  }),
}))

// Medical records table (legacy compatibility) - stray medical records
export const medicalRecords = sqliteTable('medical_records', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  strayId: integer('stray_id')
    .references(() => strays.id)
    .notNull(),
  recordType: text('record_type', {
    enum: ['vaccination', 'treatment', 'checkup', 'surgery'],
  }).notNull(),
  description: text('description').notNull(),
  veterinarian: text('veterinarian'),
  cost: real('cost'),
  recordDate: integer('record_date', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  createdBy: integer('created_by')
    .references(() => authSchema.users.id)
    .notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
})

export const medicalRecordsRelations = relations(medicalRecords, ({ one }) => ({
  stray: one(strays, {
    fields: [medicalRecords.strayId],
    references: [strays.id],
  }),
  createdBy: one(authSchema.users, {
    fields: [medicalRecords.createdBy],
    references: [authSchema.users.id],
  }),
}))

// Care records table - general care activities for strays
export const careRecords = sqliteTable('care_records', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  strayId: integer('stray_id')
    .references(() => strays.id)
    .notNull(),
  userId: text('user_id')
    .references(() => authSchema.users.id)
    .notNull(),
  careType: text('care_type', {
    enum: [
      'feeding',
      'watering',
      'shelter',
      'medical',
      'cleaning',
      'monitoring',
      'other',
    ],
  }).notNull(),
  description: text('description').notNull(),
  location: text('location', { mode: 'json' }).$type<{
    lat: number
    lng: number
    address?: string
  }>(),
  // Photos documenting the care
  photos: text('photos', { mode: 'json' }).$type<string[]>(),
  careDate: integer('care_date', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
})

export const careRecordsRelations = relations(careRecords, ({ one }) => ({
  stray: one(strays, {
    fields: [careRecords.strayId],
    references: [strays.id],
  }),
  user: one(authSchema.users, {
    fields: [careRecords.userId],
    references: [authSchema.users.id],
  }),
}))

// Indexes for better performance
export const indexes = {
  // strays indexes
  idxstraysSpecies: sql`CREATE INDEX strays_species ON strays(species)`,
  idxstraysStatus: sql`CREATE INDEX strays_status ON strays(status)`,
  idxstraysUpdatedAt: sql`CREATE INDEX strays_updated_at ON strays(updated_at)`,

  // Sightings indexes
  idxSightingsstrayId: sql`CREATE INDEX sightings_stray_id ON sightings(stray_id)`,
  idxSightingsUserId: sql`CREATE INDEX sightings_user_id ON sightings(user_id)`,
  idxSightingsCreatedAt: sql`CREATE INDEX sightings_created_at ON sightings(created_at)`,

  // Subscriptions indexes
  idxSubscriptionsUserId: sql`CREATE INDEX subscriptions_user_id ON stray_subscriptions(user_id)`,
  idxSubscriptionsstrayId: sql`CREATE INDEX subscriptions_stray_id ON stray_subscriptions(stray_id)`,

  // Naming indexes
  idxNamingSuggestionsstrayId: sql`CREATE INDEX naming_suggestions_stray_id ON naming_suggestions(stray_id)`,
  idxNamingVotesSuggestionId: sql`CREATE INDEX naming_votes_suggestion_id ON naming_votes(naming_suggestion_id)`,

  // Community indexes
  idxCommunityPostsAuthorId: sql`CREATE INDEX community_posts_author_id ON community_posts(author_id)`,
  idxCommunityPostsType: sql`CREATE INDEX community_posts_type ON community_posts(post_type)`,
  idxCommunityPostsPublishedAt: sql`CREATE INDEX community_posts_published_at ON community_posts(published_at)`,

  // Tracking indexes
  idxTrackingRequestsStatus: sql`CREATE INDEX tracking_requests_status ON tracking_requests(status)`,

  // Media indexes
  idxstrayPhotosstrayId: sql`CREATE INDEX stray_photos_stray_id ON stray_photos(stray_id)`,
  idxSightingPhotosSightingId: sql`CREATE INDEX sighting_photos_sighting_id ON sighting_photos(sighting_id)`,

  // Achievements indexes
  idxUserAchievementsUserId: sql`CREATE INDEX user_achievements_user_id ON user_achievements(user_id)`,
} as const

export default {
  ...authSchema,
  strays,
  sightings,
  strayPhotos,
  sightingPhotos,
  straySubscriptions,
  namingSuggestions,
  namingVotes,
  bounties,
  bountyAssignments,
  communityPosts,
  postComments,
  postReactions,
  medicalRecords,
  careRecords,
  // Relations
  straysRelations,
  sightingsRelations,
  strayPhotosRelations,
  sightingPhotosRelations,
  straySubscriptionsRelations,
  namingSuggestionsRelations,
  namingVotesRelations,
  bountiesRelations,
  bountyAssignmentsRelations,
  communityPostsRelations,
  postCommentsRelations,
  postReactionsRelations,
  medicalRecordsRelations,
  careRecordsRelations,
} as const

// Type exports for use in other files
export type Stray = typeof strays.$inferSelect
export type InsertStray = typeof strays.$inferInsert

export type Sighting = typeof sightings.$inferSelect
export type InsertSighting = typeof sightings.$inferInsert

export type StrayPhoto = typeof strayPhotos.$inferSelect
export type InsertStrayPhoto = typeof strayPhotos.$inferInsert

export type SightingPhoto = typeof sightingPhotos.$inferSelect
export type InsertSightingPhoto = typeof sightingPhotos.$inferInsert

export type StraySubscription = typeof straySubscriptions.$inferSelect
export type InsertStraySubscription = typeof straySubscriptions.$inferInsert

export type NamingSuggestion = typeof namingSuggestions.$inferSelect
export type InsertNamingSuggestion = typeof namingSuggestions.$inferInsert

export type NamingVote = typeof namingVotes.$inferSelect
export type InsertNamingVote = typeof namingVotes.$inferInsert

export type Bounty = typeof bounties.$inferSelect
export type InsertBounty = typeof bounties.$inferInsert

export type BountyAssignment = typeof bountyAssignments.$inferSelect
export type InsertBountyAssignment = typeof bountyAssignments.$inferInsert

export type CommunityPost = typeof communityPosts.$inferSelect
export type InsertCommunityPost = typeof communityPosts.$inferInsert

export type PostComment = typeof postComments.$inferSelect
export type InsertPostComment = typeof postComments.$inferInsert

export type PostReaction = typeof postReactions.$inferSelect
export type InsertPostReaction = typeof postReactions.$inferInsert

export type MedicalRecord = typeof medicalRecords.$inferSelect
export type InsertMedicalRecord = typeof medicalRecords.$inferInsert

export type CareRecord = typeof careRecords.$inferSelect
export type InsertCareRecord = typeof careRecords.$inferInsert
