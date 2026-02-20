import { db } from '#server/db/db'
import { todo } from '#server/db/schema'
import { mapTodoToDto } from '#server/mappers/todo.mapper'
import { eq, and } from 'drizzle-orm'
import { requireAuth } from '#server/utils/auth'
import { updateTodoSchema } from '#shared/types/todo'
import { z } from 'zod'

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
      data: z.treeifyError(result.error),
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

  const updatedTodoRow = updatedTodo[0]

  if (!updatedTodoRow) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Todo not found',
    })
  }

  return mapTodoToDto(updatedTodoRow)
})
