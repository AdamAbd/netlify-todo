import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '#server/db/db'

// Requires BETTER_AUTH_SECRET and BETTER_AUTH_URL to be set in the runtime config (as defined in nuxt.config.ts)
const config = useRuntimeConfig()

export const auth = betterAuth({
  secret: config.betterAuthSecret,
  baseURL: config.betterAuthUrl,
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  emailAndPassword: {
    enabled: true,
  },
})
