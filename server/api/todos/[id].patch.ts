import { db } from '#server/db/db'
import { todo } from '#server/db/schema'
import { eq, and } from 'drizzle-orm'
import { requireAuth } from '#server/utils/auth'
import type { UpdateTodoPayload } from '#shared/types/todo'

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

  const body = await readBody<UpdateTodoPayload>(event)

  const updatedTodo = await db
    .update(todo)
    .set({
      ...body,
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
