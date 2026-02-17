import { z } from 'zod'

export const TODO_STATUSES = ['backlog', 'in_progress', 'finished'] as const
export const todoStatusSchema = z.enum(TODO_STATUSES)
export type TodoStatus = z.infer<typeof todoStatusSchema>

export const todoItemSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  checked: z.boolean().default(false),
})
export type TodoItem = z.infer<typeof todoItemSchema>

export const todoBaseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  status: todoStatusSchema.default('backlog'),
  items: z.array(todoItemSchema).default([]),
  imageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
})

export const createTodoSchema = todoBaseSchema
export const updateTodoSchema = todoBaseSchema.partial()

export const todoSchema = todoBaseSchema.extend({
  id: z.string(),
  userId: z.string(),
  createdAt: z.union([z.date(), z.string()]),
  updatedAt: z.union([z.date(), z.string()]).nullable(),
})

export type Todo = z.infer<typeof todoSchema>
export type CreateTodoPayload = z.infer<typeof createTodoSchema>
export type UpdateTodoPayload = z.infer<typeof updateTodoSchema>
