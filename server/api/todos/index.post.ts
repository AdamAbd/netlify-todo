import { db } from '#server/db/db'
import { todo } from '#server/db/schema'
import { mapTodoToDto } from '#server/mappers/todo.mapper'
import { requireAuth } from '#server/utils/auth'
import { DEFAULT_TODO_STATUS } from '#shared/constants/todo-status'
import { createTodoSchema } from '#shared/types/todo'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const userId = session.user.id

  const body = await readBody(event)
  const normalizedBody =
    typeof body === 'object' && body !== null
      ? {
          ...body,
          status: (body as { status?: unknown }).status ?? DEFAULT_TODO_STATUS,
          items: (body as { items?: unknown }).items ?? [],
        }
      : body

  const result = createTodoSchema.safeParse(normalizedBody)

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
      status: data.status,
      items: data.items,
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
