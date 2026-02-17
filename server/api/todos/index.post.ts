import { db } from '#server/db/db'
import { todo } from '#server/db/schema'
import { requireAuth } from '#server/utils/auth'
import type { CreateTodoPayload } from '#shared/types/todo'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const userId = session.user.id
  const body = await readBody<CreateTodoPayload>(event)

  const newTodo = await db
    .insert(todo)
    .values({
      id: crypto.randomUUID(),
      userId,
      title: body.title,
      description: body.description,
      status: body.status || 'backlog',
      items: body.items || [],
      imageUrl: body.imageUrl,
    })
    .returning()

  return newTodo[0]
})
