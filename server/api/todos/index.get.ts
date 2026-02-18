import { db } from '#server/db/db'
import { todo } from '#server/db/schema'
import { mapTodoListToDto } from '#server/mappers/todo.mapper'
import { eq, desc } from 'drizzle-orm'
import { requireAuth } from '#server/utils/auth'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const userId = session.user.id

  const todos = await db.query.todo.findMany({
    where: eq(todo.userId, userId),
    orderBy: [desc(todo.createdAt)],
  })

  return mapTodoListToDto(todos)
})
