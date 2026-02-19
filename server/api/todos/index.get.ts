import { db } from '#server/db/db'
import { todo } from '#server/db/schema'
import { mapTodoListToDto } from '#server/mappers/todo.mapper'
import { and, asc, count, desc, eq, ilike, or } from 'drizzle-orm'
import { requireAuth } from '#server/utils/auth'
import { todosQuerySchema } from '#shared/types/todo'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const userId = session.user.id
  const query = getQuery(event)

  const parsedQuery = todosQuerySchema.safeParse({
    search: Array.isArray(query.search) ? query.search[0] : query.search,
    sortBy: Array.isArray(query.sortBy) ? query.sortBy[0] : query.sortBy,
    sortOrder: Array.isArray(query.sortOrder) ? query.sortOrder[0] : query.sortOrder,
    page: Array.isArray(query.page) ? query.page[0] : query.page,
    pageSize: Array.isArray(query.pageSize) ? query.pageSize[0] : query.pageSize,
  })

  if (!parsedQuery.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: z.treeifyError(parsedQuery.error),
    })
  }

  const { search, sortBy, sortOrder, page, pageSize } = parsedQuery.data

  const whereClause = and(
    eq(todo.userId, userId),
    search
      ? or(ilike(todo.title, `%${search}%`), ilike(todo.description, `%${search}%`))
      : undefined
  )

  const totalResult = await db.select({ total: count() }).from(todo).where(whereClause)
  const totalItems = Number(totalResult[0]?.total ?? 0)
  const totalPages = totalItems > 0 ? Math.ceil(totalItems / pageSize) : 0
  const currentPage = totalPages > 0 ? Math.min(page, totalPages) : 1
  const offset = (currentPage - 1) * pageSize

  const sortColumn = {
    createdAt: todo.createdAt,
    updatedAt: todo.updatedAt,
    title: todo.title,
    status: todo.status,
  }[sortBy]

  const todos = await db.query.todo.findMany({
    where: whereClause,
    orderBy: [sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn)],
    limit: pageSize,
    offset,
  })

  return {
    data: mapTodoListToDto(todos),
    filters: {
      search,
      sortBy,
      sortOrder,
    },
    pagination: {
      page: currentPage,
      pageSize,
      totalItems,
      totalPages,
      hasPreviousPage: currentPage > 1 && totalPages > 0,
      hasNextPage: currentPage < totalPages,
    },
  }
})
