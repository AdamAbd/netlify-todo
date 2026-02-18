import { z } from 'zod'

export const emailSchema = z.string().email('Invalid email address')
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters')

export const userBaseSchema = z.object({
  id: z.string(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: emailSchema,
  emailVerified: z.boolean(),
  image: z.string().nullable().optional(),
  createdAt: z.union([z.date(), z.string()]),
  updatedAt: z.union([z.date(), z.string()]),
})

export const registerSchema = z
  .object({
    name: userBaseSchema.shape.name,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type User = z.infer<typeof userBaseSchema>
export type LoginPayload = z.infer<typeof loginSchema>
export type RegisterPayload = z.infer<typeof registerSchema>
export type ForgotPasswordPayload = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordPayload = z.infer<typeof resetPasswordSchema>
