import { drizzle } from 'drizzle-orm/d1'
import schema from './schema'
import { env } from 'cloudflare:workers'

export async function getDb() {
  return drizzle(env.DB, {
    schema,
    logger: true,
  })
}
