import { drizzle } from 'drizzle-orm/d1'
import schema from './schema'
import { getBindings } from '~/utils/bindings'

export async function getDb() {
  const env = await getBindings()

  return drizzle(env.DB, {
    schema,
    logger: true,
  })
}
