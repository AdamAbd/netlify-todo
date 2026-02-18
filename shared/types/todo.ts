import { z } from 'zod'

export const TODO_STATUSES = ['backlog', 'in_progress', 'finished'] as const
export const todoStatusSchema = z.enum(TODO_STATUSES)
export type TodoStatus = z.infer<typeof todoStatusSchema>

export const todoItemSchema = z.object({
  label: z.string().min(1, { error: 'Label is required' }),
  checked: z.boolean().default(false),
})
export type TodoItem = z.infer<typeof todoItemSchema>

export const todoBaseSchema = z.object({
  title: z.string().min(1, { error: 'Title is required' }).max(100, { error: 'Title is too long' }),
  description: z.string().max(500, { error: 'Description is too long' }).optional(),
  status: todoStatusSchema.default('backlog'),
  items: z.array(todoItemSchema).default([]),
  imageUrl: z
    .preprocess(
      (val) => (val === '' || val === undefined ? null : val),
      z.url({ error: 'Must be a valid URL' }).nullable()
    )
    .optional(),
})

export const createTodoSchema = todoBaseSchema
export const updateTodoSchema = todoBaseSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    error: 'At least one field is required for update',
  })

export const todoSchema = todoBaseSchema.extend({
  id: z.string(),
  userId: z.string(),
  description: z.string().max(500, { error: 'Description is too long' }).nullable(),
  imageUrl: z.url({ error: 'Must be a valid URL' }).nullable(),
  createdAt: z.union([z.date(), z.string()]),
  updatedAt: z.union([z.date(), z.string()]),
})

export const todoListSchema = z.array(todoSchema)

export type Todo = z.infer<typeof todoSchema>
export type CreateTodoPayload = z.infer<typeof createTodoSchema>
export type UpdateTodoPayload = z.infer<typeof updateTodoSchema>
