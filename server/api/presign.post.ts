import { requireAuth } from '#server/utils/auth'
import { createR2PresignedPutUrl } from '#server/utils/r2-presign'
import { presignRequestSchema } from '#shared/types/presign'
import { z } from 'zod'

const mimeToExtensionMap: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif': 'gif',
}

const encodePath = (value: string) =>
  value
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')

const resolveFileExtension = (fileName: string, contentType: string) => {
  const extensionFromFileName = fileName.match(/\.([a-zA-Z0-9]+)$/)?.[1]?.toLowerCase()
  if (extensionFromFileName) {
    return extensionFromFileName
  }

  return mimeToExtensionMap[contentType] ?? 'bin'
}

const hasFileExtension = (value: string) => {
  const fileName = value.split('/').pop() ?? ''
  return /\.[a-zA-Z0-9]+$/.test(fileName)
}

const normalizeRequestedKey = (value: string) =>
  value
    .trim()
    .replace(/^\/+/, '')
    .replace(/\/{2,}/g, '/')

const hasPathTraversalSegment = (value: string) =>
  value.split('/').some((segment) => segment === '.' || segment === '..')

const resolveObjectKey = ({
  requestedKey,
  fallbackPrefix,
  extension,
}: {
  requestedKey?: string
  fallbackPrefix: string
  extension: string
}) => {
  const randomFileName = `${crypto.randomUUID()}.${extension}`

  if (!requestedKey) {
    return `${fallbackPrefix}/${randomFileName}`
  }

  const normalizedKey = normalizeRequestedKey(requestedKey)
  if (!normalizedKey) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: {
        key: ['Key is invalid'],
      },
    })
  }

  if (hasPathTraversalSegment(normalizedKey)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: {
        key: ['Key cannot contain path traversal segment'],
      },
    })
  }

  if (requestedKey.trim().endsWith('/')) {
    return `${normalizedKey.replace(/\/+$/, '')}/${randomFileName}`
  }

  const keyWithoutTrailingSlash = normalizedKey.replace(/\/+$/, '')
  if (!hasFileExtension(keyWithoutTrailingSlash)) {
    return `${keyWithoutTrailingSlash}.${extension}`
  }

  return keyWithoutTrailingSlash
}

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const config = useRuntimeConfig()
  const body = await readBody(event)
  const parsedBody = presignRequestSchema.safeParse(body)

  if (!parsedBody.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: z.treeifyError(parsedBody.error),
    })
  }

  const requiredR2Keys: Array<keyof (typeof config)['r2']> = [
    'accessKeyId',
    'secretAccessKey',
    'endpoint',
    'bucketName',
  ]

  const missingR2Keys = requiredR2Keys.filter((key) => !config.r2[key])
  if (missingR2Keys.length > 0) {
    throw createError({
      statusCode: 500,
      statusMessage: `Missing R2 configuration: ${missingR2Keys.join(', ')}`,
    })
  }

  const payload = parsedBody.data
  const allowedMimeTypes = String(config.presign.allowedMimeTypes ?? '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
  const contentType = payload.contentType.trim().toLowerCase()
  const maxSizeBytes = Number(config.presign.fileMaxSizeBytes ?? 0)
  const expiresInSeconds = Number(config.presign.filePresignExpiresInSeconds ?? 120)

  if (!allowedMimeTypes.includes(contentType)) {
    throw createError({
      statusCode: 415,
      statusMessage: 'Unsupported Media Type',
      data: {
        allowedMimeTypes,
      },
    })
  }

  if (payload.size > maxSizeBytes) {
    throw createError({
      statusCode: 413,
      statusMessage: 'Payload Too Large',
      data: {
        maxSizeBytes,
      },
    })
  }

  const safeUserId = session.user.id.replace(/[^a-zA-Z0-9_-]/g, '_')
  const extension = resolveFileExtension(payload.fileName, contentType)

  // Construct the key to be userId/key/fileName as requested.
  // We prepend the user ID for isolation and security.
  // If a key is provided, we append a trailing slash to treat it as a directory.
  const key = resolveObjectKey({
    requestedKey: payload.key ? `${safeUserId}/${payload.key}/` : undefined,
    fallbackPrefix: safeUserId,
    extension,
  })

  const signedUpload = await createR2PresignedPutUrl({
    accessKeyId: String(config.r2.accessKeyId),
    secretAccessKey: String(config.r2.secretAccessKey),
    endpoint: String(config.r2.endpoint),
    bucketName: String(config.r2.bucketName),
    key,
    contentType,
    expiresInSeconds,
  })

  const publicBaseUrl = config.r2.publicUrl?.trim().replace(/\/+$/, '')
  const publicUrl = publicBaseUrl ? `${publicBaseUrl}/${encodePath(key)}` : null

  return {
    key,
    uploadUrl: signedUpload.uploadUrl,
    publicUrl,
    method: 'PUT' as const,
    headers: signedUpload.headers,
    expiresIn: signedUpload.expiresIn,
    maxSizeBytes,
  }
})
