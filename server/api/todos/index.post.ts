import { db } from '#server/db/db'
import { todo } from '#server/db/schema'
import { requireAuth } from '#server/utils/auth'
import { createTodoSchema } from '#shared/types/todo'

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
      ...data,
      status: data.status, // ensured by z.enum().default()
      items: data.items, // ensured by z.array().default()
    })
    .returning()

  return newTodo[0]
})
