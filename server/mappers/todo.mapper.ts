import type { todo } from '#server/db/schema'
import { todoListSchema, todoSchema } from '#shared/types/todo'

type TodoRow = typeof todo.$inferSelect

const toIsoDateString = (value: Date | string) => {
  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    throw new TypeError(`Invalid date value: ${String(value)}`)
  }

  return date.toISOString()
}

const mapTodoRow = (row: TodoRow) => ({
  id: row.id,
  title: row.title,
  description: row.description ?? null,
  status: row.status,
  items: row.items ?? [],
  imageUrl: row.imageUrl ?? null,
  userId: row.userId,
  createdAt: toIsoDateString(row.createdAt),
  updatedAt: toIsoDateString(row.updatedAt),
})

export const mapTodoToDto = (row: TodoRow) => {
  return todoSchema.parse(mapTodoRow(row))
}

export const mapTodoListToDto = (rows: TodoRow[]) => {
  return todoListSchema.parse(rows.map(mapTodoRow))
}
