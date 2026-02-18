import { db } from '#server/db/db'
import { todo } from '#server/db/schema'
import { mapTodoToDto } from '#server/mappers/todo.mapper'
import { requireAuth } from '#server/utils/auth'
import { createTodoSchema } from '#shared/types/todo'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const userId = session.user.id

  const body = await readBody(event)
  const result = createTodoSchema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: z.treeifyError(result.error),
    })
  }

  const data = result.data

  const newTodo = await db
    .insert(todo)
    .values({
      id: crypto.randomUUID(),
      userId,
      ...data,
      status: data.status, // ensured by z.enum().default()
      items: data.items, // ensured by z.array().default()
    })
    .returning()

  const createdTodo = newTodo[0]
  if (!createdTodo) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create todo',
    })
  }

  return mapTodoToDto(createdTodo)
})
