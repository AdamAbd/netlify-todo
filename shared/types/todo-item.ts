import { z } from 'zod'

export const todoItemSchema = z.object({
  label: z.string().min(1, { error: 'Label is required' }),
  checked: z.boolean().default(false),
})

export type TodoItem = z.infer<typeof todoItemSchema>
