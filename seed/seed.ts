import { drizzle, DrizzleD1Database } from 'drizzle-orm/d1'
import { eq } from 'drizzle-orm'
import * as schema from '../db/schema'
import type { InsertStray } from '../db/schema'
import { SQLiteInsertBuilder } from 'drizzle-orm/sqlite-core'

// Helper function to generate random locations around a center point
function generateRandomLocation(
  centerLat: number,
  centerLng: number,
  radiusKm: number = 1
) {
  // Convert radius from km to degrees (approximate)
  const radiusDeg = radiusKm / 111.32 // 1 degree ≈ 111.32 km

  const u = Math.random()
  const v = Math.random()
  const w = radiusDeg * Math.sqrt(u)
  const t = 2 * Math.PI * v
  const x = w * Math.cos(t)
  const y = w * Math.sin(t)

  const newLat = centerLat + y
  const newLng = centerLng + x

  return { lat: newLat, lng: newLng }
}

// Helper function to get a point 5km away
function getPoint5KmAway(
  lat: number,
  lng: number,
  direction: 'north' | 'south' | 'east' | 'west' = 'north'
) {
  const kmToDeg = 1 / 111.32
  const distance = 5 * kmToDeg

  switch (direction) {
    case 'north':
      return { lat: lat + distance, lng }
    case 'south':
      return { lat: lat - distance, lng }
    case 'east':
      return { lat, lng: lng + distance }
    case 'west':
      return { lat, lng: lng - distance }
    default:
      return { lat: lat + distance, lng }
  }
}

export default async function seed(db: DrizzleD1Database<typeof schema>) {
  const drizzleDb = db

  console.log('🌱 Starting seed...')

  // Find all users in the database
  const users = await drizzleDb.select().from(schema.users)

  if (users.length === 0) {
    throw new Error(
      'No users found in the database. Please create users first.'
    )
  }

  console.log(`✅ Found ${users.length} users`)

  // Define center locations
  const centerLat = 3.1072086999999984
  const centerLng = 101.67908995767199

  // Generate 20 strays
  const strays: InsertStray[] = []

  // 10 strays around the center location
  for (let i = 0; i < 10; i++) {
    const location = generateRandomLocation(centerLat, centerLng, 0.5) // within 0.5km
    strays.push({
      name: `Stray Cat ${i + 1}`,
      species: 'cat' as const,
      breed: [
        'Persian',
        'Siamese',
        'Maine Coon',
        'British Shorthair',
        'Ragdoll',
      ][Math.floor(Math.random() * 5)],
      age: ['puppy', 'young', 'adult', 'senior'][
        Math.floor(Math.random() * 4)
      ] as any,
      size: ['small', 'medium', 'large'][Math.floor(Math.random() * 3)] as any,
      colors: ['Black', 'White', 'Gray', 'Orange', 'Calico'][
        Math.floor(Math.random() * 5)
      ],
      markings: ['Solid', 'Striped', 'Spotted', 'Patched'][
        Math.floor(Math.random() * 4)
      ],
      status: 'spotted' as const,
      description: `A friendly stray cat spotted in the area.`,
      primaryLocation: location,
    })
  }

  // 10 strays about 5km away
  const directions: ('north' | 'south' | 'east' | 'west')[] = [
    'north',
    'south',
    'east',
    'west',
  ]
  for (let i = 0; i < 10; i++) {
    const direction = directions[i % 4]
    const baseLocation = getPoint5KmAway(centerLat, centerLng, direction)
    const location = generateRandomLocation(
      baseLocation.lat,
      baseLocation.lng,
      0.5
    )

    strays.push({
      name: `Stray Dog ${i + 1}`,
      species: 'dog' as const,
      breed: [
        'Golden Retriever',
        'Labrador',
        'German Shepherd',
        'Bulldog',
        'Beagle',
      ][Math.floor(Math.random() * 5)],
      age: ['puppy', 'young', 'adult', 'senior'][
        Math.floor(Math.random() * 4)
      ] as any,
      size: ['small', 'medium', 'large'][Math.floor(Math.random() * 3)] as any,
      colors: ['Brown', 'Black', 'White', 'Golden', 'Mixed'][
        Math.floor(Math.random() * 5)
      ],
      markings: ['Solid', 'Striped', 'Spotted', 'Patched'][
        Math.floor(Math.random() * 4)
      ],
      status: 'spotted' as const,
      description: `A stray dog found approximately 5km ${direction} of the center area.`,
      primaryLocation: location,
    })
  }

  const batchSize = 10
  let insertedStrays = []
  for (let i = 0; i < strays.length; i += batchSize) {
    const batch = strays.slice(i, i + batchSize)
    const result = await drizzleDb
      .insert(schema.strays)
      .values(batch)
      .returning({ id: schema.strays.id })
    insertedStrays.push(...result)
  }
  console.log(`✅ Created ${insertedStrays.length} strays`)

  // Create sightings and photos for each stray
  for (let i = 0; i < insertedStrays.length; i++) {
    const stray = insertedStrays[i]
    const strayData = strays[i]

    // Create 10 sightings per stray
    const sightings = []
    const sightingUsers: string[] = [] // Keep track of which user created each sighting
    for (let j = 0; j < 10; j++) {
      const randomUser = users[Math.floor(Math.random() * users.length)]
      const sightingLocation = generateRandomLocation(
        strayData.primaryLocation!.lat,
        strayData.primaryLocation!.lng,
        0.2
      )
      sightings.push({
        strayId: stray.id,
        userId: randomUser.id,
        lat: sightingLocation.lat,
        lng: sightingLocation.lng,
        location: {
          address1: `Street ${j + 1}`,
          city: 'Kuala Lumpur',
          postcode: '50000',
          country: 'Malaysia',
        },
        description: `Sighting ${j + 1} of ${strayData!.name}`,
        sightingTime: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
        ), // Random time in last 30 days
        weatherCondition: ['Sunny', 'Cloudy', 'Rainy', 'Clear'][
          Math.floor(Math.random() * 4)
        ],
        confidence: Math.floor(Math.random() * 10) + 1,
        notes: `Additional notes for sighting ${j + 1}`,
      })
      sightingUsers.push(randomUser.id)
    }

    const batchSizeSightings = 5
    let insertedSightings = []
    for (let i = 0; i < sightings.length; i += batchSizeSightings) {
      const batch = sightings.slice(i, i + batchSizeSightings)
      const result = await drizzleDb
        .insert(schema.sightings)
        .values(batch)
        .returning({ id: schema.sightings.id })
      insertedSightings.push(...result)
    }
    console.log(
      `✅ Created ${insertedSightings.length} sightings for stray ${stray.id}`
    )

    // Create 10 photos per sighting
    const photoPromises: Promise<any>[] = []
    insertedSightings.forEach((sighting, index) => {
      const photos = []
      const sightingUserId = sightingUsers[index]
      for (let k = 0; k < 10; k++) {
        photos.push({
          sightingId: sighting.id,
          userId: sightingUserId,
          url: `https://picsum.photos/400/300?random=${Math.random()}`,
          fileName: `sighting_${sighting.id}_photo_${k + 1}.jpg`,
          fileSize: Math.floor(Math.random() * 1000000) + 100000, // Random size between 100KB-1MB
          mimeType: 'image/jpeg',
          caption: `Photo ${k + 1} of sighting ${sighting.id}`,
        })
      }

      // Insert photos in batches of 5
      for (let i = 0; i < photos.length; i += 5) {
        const batch = photos.slice(i, i + 5)
        photoPromises.push(
          drizzleDb.insert(schema.sightingPhotos).values(batch)
        )
      }
    })
    await Promise.all(photoPromises)
    console.log(
      `✅ Created photos for ${insertedSightings.length} sightings of stray ${stray.id}`
    )
  }

  console.log('🎉 Seed completed successfully!')
}
