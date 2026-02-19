import { z } from 'zod'
import { TODO_STATUSES } from '#shared/constants/todo-status'

export { TODO_STATUSES } from '#shared/constants/todo-status'
export const todoStatusSchema = z.enum(TODO_STATUSES)
export type TodoStatus = z.infer<typeof todoStatusSchema>

export const todoItemSchema = z.object({
  label: z.string().min(1, { error: 'Label is required' }),
  checked: z.boolean(),
})
export type TodoItem = z.infer<typeof todoItemSchema>

export const todoBaseSchema = z.object({
  title: z.string().min(1, { error: 'Title is required' }).max(100, { error: 'Title is too long' }),
  description: z.string().max(500, { error: 'Description is too long' }).optional(),
  status: todoStatusSchema,
  items: z.array(todoItemSchema),
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
  createdAt: z.iso.datetime({ offset: true }),
  updatedAt: z.iso.datetime({ offset: true }),
})

export const todoListSchema = z.array(todoSchema)

export const todoSortBySchema = z.enum(['createdAt', 'updatedAt', 'title', 'status'])
export const todoSortOrderSchema = z.enum(['asc', 'desc'])

export const todosQuerySchema = z.object({
  search: z
    .string()
    .trim()
    .max(100, { error: 'Search is too long' })
    .optional()
    .transform((value) => (value ? value : undefined)),
  sortBy: todoSortBySchema.default('createdAt'),
  sortOrder: todoSortOrderSchema.default('desc'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(9),
})

export const todosPaginationSchema = z.object({
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  totalItems: z.number().int().min(0),
  totalPages: z.number().int().min(0),
  hasPreviousPage: z.boolean(),
  hasNextPage: z.boolean(),
})

export const todoListResponseSchema = z.object({
  data: todoListSchema,
  filters: z.object({
    search: z.string().optional(),
    sortBy: todoSortBySchema,
    sortOrder: todoSortOrderSchema,
  }),
  pagination: todosPaginationSchema,
})

export type Todo = z.infer<typeof todoSchema>
export type CreateTodoPayload = z.infer<typeof createTodoSchema>
export type UpdateTodoPayload = z.infer<typeof updateTodoSchema>
export type TodoSortBy = z.infer<typeof todoSortBySchema>
export type TodoSortOrder = z.infer<typeof todoSortOrderSchema>
export type TodosQuery = z.infer<typeof todosQuerySchema>
export type TodosPagination = z.infer<typeof todosPaginationSchema>
export type TodoListResponse = z.infer<typeof todoListResponseSchema>
