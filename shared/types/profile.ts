import { z } from 'zod'
import { emailSchema, passwordSchema, userBaseSchema } from '#shared/types/user'

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { error: 'Name must be at least 2 characters' })
    .max(80, { error: 'Name must be at most 80 characters' }),
  image: z
    .preprocess(
      (val) => (val === '' || val === undefined ? null : val),
      z.url({ error: 'Must be a valid URL' }).nullable()
    )
    .optional(),
})

export const profileSchema = userBaseSchema.pick({
  id: true,
  name: true,
  email: true,
  emailVerified: true,
  image: true,
  createdAt: true,
  updatedAt: true,
})

export const connectedAccountSchema = z.object({
  id: z.string(),
  providerId: z.string(),
  accountId: z.string(),
  createdAt: z.union([z.date(), z.string()]),
})

export const connectedAccountsResponseSchema = z.object({
  connectedAccounts: z.array(connectedAccountSchema),
})

export const linkCredentialSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const linkCredentialRequestSchema = z.object({
  newPassword: passwordSchema,
})

export const changeEmailSchema = z.object({
  newEmail: emailSchema,
})

export type UpdateProfilePayload = z.infer<typeof updateProfileSchema>
export type Profile = z.infer<typeof profileSchema>
export type ConnectedAccount = z.infer<typeof connectedAccountSchema>
export type ConnectedAccountsResponse = z.infer<typeof connectedAccountsResponseSchema>
export type LinkCredentialPayload = z.infer<typeof linkCredentialSchema>
export type LinkCredentialRequest = z.infer<typeof linkCredentialRequestSchema>
export type ChangeEmailPayload = z.infer<typeof changeEmailSchema>
