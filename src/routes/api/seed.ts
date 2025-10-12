import { createServerFn } from '@tanstack/react-start'
import { getDb } from '../../../db'
import seed from '../../../seed/seed'

// Seed the database with sample data
export const seedDatabase = createServerFn({ method: 'POST' }).handler(
  async () => {
    const db = await getDb()
    await seed(db as any)
    return { success: true, message: 'Database seeded successfully' }
  }
)
