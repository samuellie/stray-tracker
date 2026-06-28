import type { Stray, Sighting, SightingPhoto } from 'db/schema'
import type { users } from 'db/auth.schema'

/** The user shape as stored in the database (richer than better-auth's session user). */
export type User = typeof users.$inferSelect

/** A sighting enriched with its photos and reporting user. */
export type SightingDetails = Sighting & {
  sightingPhotos: SightingPhoto[]
  user: User
}

/** A stray paired with one of its sightings — the shape passed between the map, list, popup and dialog. */
export type SightingWithDetails = Stray & {
  sighting: SightingDetails
}

/** A stray with its caretaker and full sighting history, as returned by getStrayById. */
export type StrayWithRelations = Stray & {
  caretaker?: User | null
  sightings: SightingDetails[]
}

/** The shape returned by createSighting: the new sighting with its stray, user and photos. */
export type CreatedSighting = Sighting & {
  stray: Stray
  user: User
  sightingPhotos: SightingPhoto[]
}

/** A timeline entry from searchSightings: a sighting with its stray and thumbnail photo. */
export type TimelineSighting = Sighting & {
  stray: Stray | null
  sightingPhotos: SightingPhoto[]
  user?: User
}
