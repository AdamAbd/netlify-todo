import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { todo, todoStatusEnum } from '#server/db/schema'
import { todoItemSchema } from '#shared/types/todo-item'

export const TODO_STATUSES = todoStatusEnum.enumValues
export const todoStatusSchema = z.enum(TODO_STATUSES)
export type TodoStatus = z.infer<typeof todoStatusSchema>

const todoInsertSchema = createInsertSchema(todo)
const todoSelectSchema = createSelectSchema(todo)

const todoPayloadSchema = todoInsertSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
})

const todoPayloadSchemaWithRules = todoPayloadSchema.extend({
  title: z.string().min(1, { error: 'Title is required' }).max(100, { error: 'Title is too long' }),
  description: z.string().max(500, { error: 'Description is too long' }).optional(),
  status: todoStatusSchema.default('backlog'),
  items: z.array(todoItemSchema).default([]),
  imageUrl: z.union([z.url({ error: 'Must be a valid URL' }), z.literal('')]).optional(),
})

export const createTodoSchema = todoPayloadSchemaWithRules
export const updateTodoSchema = todoPayloadSchemaWithRules
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    error: 'At least one field is required for update',
  })

export const todoSchema = todoSelectSchema.extend({
  title: z.string().min(1, { error: 'Title is required' }).max(100, { error: 'Title is too long' }),
  description: z.string().max(500, { error: 'Description is too long' }).nullable(),
  status: todoStatusSchema,
  items: z.array(todoItemSchema),
  imageUrl: z.url({ error: 'Must be a valid URL' }).nullable(),
  createdAt: z.union([z.date(), z.string()]),
  updatedAt: z.union([z.date(), z.string()]),
})

export const todoListSchema = z.array(todoSchema)

export type Todo = z.infer<typeof todoSchema>
export type CreateTodoPayload = z.infer<typeof createTodoSchema>
export type UpdateTodoPayload = z.infer<typeof updateTodoSchema>
