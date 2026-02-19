import { db } from '#server/db/db'
import { account } from '#server/db/schema'
import { requireAuth } from '#server/utils/auth'
import { asc, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const userId = session.user.id

  const connectedAccounts = await db.query.account.findMany({
    where: eq(account.userId, userId),
    columns: {
      id: true,
      providerId: true,
      accountId: true,
      createdAt: true,
    },
    orderBy: [asc(account.createdAt)],
  })

  return {
    connectedAccounts,
  }
})
