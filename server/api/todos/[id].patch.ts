import { z } from 'zod'
import { db } from '#server/db/db'
import { todo } from '#server/db/schema'
import { eq, and } from 'drizzle-orm'
import { requireAuth } from '#server/utils/auth'

const updateTodoSchema = z.object({
  title: z.string().min(1).optional(),
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
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID is required',
    })
  }

  const body = await readBody(event)
  const result = updateTodoSchema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: result.error.flatten().fieldErrors,
    })
  }

  const data = result.data

  const updatedTodo = await db
    .update(todo)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(eq(todo.id, id), eq(todo.userId, userId)))
    .returning()

  if (!updatedTodo.length) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Todo not found',
    })
  }

  return updatedTodo[0]
})
