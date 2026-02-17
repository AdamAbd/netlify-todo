import { z } from 'zod'
import { db } from '#server/db/db'
import { todo } from '#server/db/schema'
import { requireAuth } from '#server/utils/auth'

const createTodoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['backlog', 'in_progress', 'finished']).optional(),
  items: z
    .array(
      z.object({
        label: z.string(),
        checked: z.boolean(),
      })
    )
    .optional(),
  imageUrl: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const userId = session.user.id

  const body = await readBody(event)
  const result = createTodoSchema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: result.error.flatten().fieldErrors,
    })
  }

  const data = result.data

  const newTodo = await db
    .insert(todo)
    .values({
      id: crypto.randomUUID(),
      userId,
      title: data.title,
      description: data.description,
      status: data.status || 'backlog',
      items: data.items || [],
      imageUrl: data.imageUrl,
    })
    .returning()

  return newTodo[0]
})
