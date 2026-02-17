import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '#server/db/db'
import { Resend } from 'resend'
import { escapeHtml } from './html'

// Requires BETTER_AUTH_SECRET, BETTER_AUTH_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and RESEND_API_KEY to be set in the runtime config (as defined in nuxt.config.ts)
const config = useRuntimeConfig()

if (
  !config.betterAuthSecret ||
  !config.betterAuthUrl ||
  !config.googleClientId ||
  !config.googleClientSecret ||
  !config.resendApiKey
) {
  throw new Error(
    'BETTER_AUTH_SECRET, BETTER_AUTH_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and RESEND_API_KEY are required for better-auth'
  )
}

const resend = new Resend(config.resendApiKey)

export const auth = betterAuth({
  secret: config.betterAuthSecret,
  baseURL: config.betterAuthUrl,
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  socialProviders: {
    google: {
      clientId: config.googleClientId,
      clientSecret: config.googleClientSecret,
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await resend.emails.send({
        from: 'Todoist <mada@scrapbooks.app>',
        to: user.email,
        subject: 'Verify your email address',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
            <h2 style="color: #111827; font-size: 24px; font-weight: 700; margin-bottom: 16px;">Verify your email</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
              Welcome to Todoist, ${escapeHtml(user.name)}! To get started, please verify your email address by clicking the button below.
            </p>
            <a href="${escapeHtml(url)}" style="display: inline-block; background-color: #000; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
              Verify Email Address
            </a>
            <p style="color: #9ca3af; font-size: 14px; margin-top: 32px;">
              If you didn't create an account, you can safely ignore this email.
            </p>
            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
            <p style="color: #9ca3af; font-size: 12px;">
              &copy; ${new Date().getFullYear()} Todoist. All rights reserved.
            </p>
          </div>
        `,
      })
    },
  },
})
