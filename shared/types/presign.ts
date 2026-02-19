import { z } from 'zod'

export const presignRequestSchema = z.object({
  fileName: z.string().trim().min(1, { error: 'File name is required' }).max(255),
  contentType: z.string().trim().min(1, { error: 'Content type is required' }).max(100),
  size: z.coerce.number().int().positive({ error: 'File size must be greater than 0' }),
  key: z
    .preprocess(
      (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
      z
        .string()
        .trim()
        .min(1, { error: 'Key is required' })
        .max(512, { error: 'Key is too long' })
        .regex(/^[a-zA-Z0-9/_\-.]+$/, {
          error: 'Key contains invalid characters',
        })
        .optional()
    )
    .optional(),
})

export const presignResponseSchema = z.object({
  key: z.string(),
  uploadUrl: z.url(),
  publicUrl: z.url().nullable(),
  method: z.literal('PUT'),
  headers: z.record(z.string(), z.string()),
  expiresIn: z.number().int().positive(),
  maxSizeBytes: z.number().int().positive(),
})

export type PresignRequestPayload = z.infer<typeof presignRequestSchema>
export type PresignResponsePayload = z.infer<typeof presignResponseSchema>
