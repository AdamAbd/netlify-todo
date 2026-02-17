import { z } from 'zod'

export const userBaseSchema = z.object({
  id: z.string(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  emailVerified: z.boolean(),
  image: z.string().optional(),
  createdAt: z.union([z.date(), z.string()]),
  updatedAt: z.union([z.date(), z.string()]),
})

export const registerSchema = userBaseSchema
  .omit({ id: true, emailVerified: true, image: true, createdAt: true, updatedAt: true })
  .extend({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const loginSchema = userBaseSchema.omit({
  id: true,
  emailVerified: true,
  image: true,
  createdAt: true,
  updatedAt: true,
})

export type User = z.infer<typeof userBaseSchema>
