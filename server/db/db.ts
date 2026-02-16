import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

// Requires DATABASE_URL to be set in the runtime config (as defined in nuxt.config.ts)
const config = useRuntimeConfig()

const client = neon(config.databaseUrl)

export const db = drizzle({ client, schema })
