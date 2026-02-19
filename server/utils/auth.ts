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
  account: {
    accountLinking: {
      enabled: true,
      allowDifferentEmails: true,
      trustedProviders: ['google', 'email-password'],
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await resend.emails.send({
        from: 'Todoist <mada@scrapbooks.app>',
        to: user.email,
        subject: 'Reset your password',
        html: `
          <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
            <div style="padding: 40px 20px; text-align: center;">
              <h1 style="font-size: 24px; font-weight: 800; color: #111827; margin: 0; letter-spacing: -0.025em;">
                Todoist
              </h1>
            </div>
            
            <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              <h2 style="font-size: 20px; font-weight: 700; color: #111827; margin-top: 0; margin-bottom: 16px;">Reset your password</h2>
              
              <p style="font-size: 16px; line-height: 24px; color: #4b5563; margin-bottom: 24px;">
                Hello ${escapeHtml(user.name)},<br><br>
                We received a request to reset your password. Click the button below to secure your account:
              </p>
              
              <div style="text-align: center; margin-bottom: 32px;">
                <a href="${escapeHtml(url)}" style="display: inline-block; background-color: #000000; color: #ffffff; font-weight: 600; font-size: 16px; padding: 14px 32px; border-radius: 10px; text-decoration: none;">
                  Reset Password
                </a>
              </div>
              
              <p style="font-size: 14px; line-height: 20px; color: #6b7280; margin-bottom: 0; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
                <strong>Security tip:</strong> If you didn't request this, you can safely ignore this email. This link will expire soon for your safety.
              </p>
            </div>
            
            <div style="text-align: center; padding: 32px 20px;">
              <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                &copy; ${new Date().getFullYear()} Todoist. All rights reserved.
              </p>
            </div>
          </div>
        `,
      })
    },
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
          <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
            <div style="padding: 40px 20px; text-align: center;">
              <h1 style="font-size: 24px; font-weight: 800; color: #111827; margin: 0; letter-spacing: -0.025em;">
                Todoist
              </h1>
            </div>
            
            <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              <h2 style="font-size: 20px; font-weight: 700; color: #111827; margin-top: 0; margin-bottom: 16px;">Verify your email</h2>
              
              <p style="font-size: 16px; line-height: 24px; color: #4b5563; margin-bottom: 24px;">
                Welcome to Todoist, ${escapeHtml(user.name)}!<br><br>
                To get started, please verify your email address by clicking the button below:
              </p>
              
              <div style="text-align: center; margin-bottom: 32px;">
                <a href="${escapeHtml(url)}" style="display: inline-block; background-color: #000000; color: #ffffff; font-weight: 600; font-size: 16px; padding: 14px 32px; border-radius: 10px; text-decoration: none;">
                  Verify Email Address
                </a>
              </div>
              
              <p style="font-size: 14px; line-height: 20px; color: #6b7280; margin-bottom: 0; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
                If you didn't create an account, you can safely ignore this email.
              </p>
            </div>
            
            <div style="text-align: center; padding: 32px 20px;">
              <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                &copy; ${new Date().getFullYear()} Todoist. All rights reserved.
              </p>
            </div>
          </div>
        `,
      })
    },
  },
})

export const requireAuth = async (event: any) => {
  const session = await auth.api.getSession({
    headers: event.headers,
  })

  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }
  return session
}
