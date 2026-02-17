import { db } from '#server/db/db'
import { todo } from '#server/db/schema'
import { eq, and } from 'drizzle-orm'
import { requireAuth } from '#server/utils/auth'

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

  const deletedTodo = await db
    .delete(todo)
    .where(and(eq(todo.id, id), eq(todo.userId, userId)))
    .returning()

  if (!deletedTodo.length) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Todo not found',
    })
  }

  return { success: true }
})
