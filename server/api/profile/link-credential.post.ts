import { auth, requireAuth } from '#server/utils/auth'
import { linkCredentialRequestSchema } from '#shared/types/profile'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const body = await readBody(event)
  const parsedBody = linkCredentialRequestSchema.safeParse(body)

  if (!parsedBody.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: z.treeifyError(parsedBody.error),
    })
  }

  const result = await auth.api.setPassword({
    body: {
      newPassword: parsedBody.data.newPassword,
    },
    headers: event.headers,
  })

  if (!result?.status) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to link credential account',
    })
  }

  return {
    success: true,
  }
})
