const encoder = new TextEncoder()

const PRESIGN_MAX_EXPIRES_SECONDS = 60 * 60 * 24 * 7

const encodeRfc3986 = (value: string) =>
  encodeURIComponent(value).replace(/[!'()*]/g, (char) =>
    `%${char.charCodeAt(0).toString(16).toUpperCase()}`
  )

const normalizePath = (path: string) =>
  path
    .split('/')
    .map((segment) => encodeRfc3986(segment))
    .join('/')

const normalizeHeaderValue = (value: string) => value.trim().replace(/\s+/g, ' ')

const toHex = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')

const importHmacKey = async (key: string | ArrayBuffer) =>
  crypto.subtle.importKey(
    'raw',
    typeof key === 'string' ? encoder.encode(key) : key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

const hmacSha256 = async (key: string | ArrayBuffer, value: string) => {
  const cryptoKey = await importHmacKey(key)
  return crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(value))
}

const sha256Hex = async (value: string) => {
  const hashed = await crypto.subtle.digest('SHA-256', encoder.encode(value))
  return toHex(hashed)
}

const formatAmzDate = (date: Date) => {
  const iso = date.toISOString()
  return `${iso.slice(0, 10).replace(/-/g, '')}T${iso.slice(11, 19).replace(/:/g, '')}Z`
}

const createSigningKey = async (secretAccessKey: string, dateStamp: string) => {
  const dateKey = await hmacSha256(`AWS4${secretAccessKey}`, dateStamp)
  const regionKey = await hmacSha256(dateKey, 'auto')
  const serviceKey = await hmacSha256(regionKey, 's3')
  return hmacSha256(serviceKey, 'aws4_request')
}

export interface CreateR2PresignedPutUrlInput {
  accessKeyId: string
  secretAccessKey: string
  endpoint: string
  bucketName: string
  key: string
  contentType: string
  expiresInSeconds: number
}

export interface CreateR2PresignedPutUrlResult {
  uploadUrl: string
  expiresIn: number
  headers: Record<string, string>
}

export const createR2PresignedPutUrl = async (
  input: CreateR2PresignedPutUrlInput
): Promise<CreateR2PresignedPutUrlResult> => {
  const endpoint = new URL(input.endpoint)
  const endpointBasePath = endpoint.pathname.replace(/\/+$/, '')
  const objectPath = `${endpointBasePath}/${input.bucketName}/${input.key}`.replace(/\/{2,}/g, '/')
  const canonicalUri = normalizePath(objectPath.startsWith('/') ? objectPath : `/${objectPath}`)
  const host = endpoint.host
  const method = 'PUT'
  const contentType = normalizeHeaderValue(input.contentType)
  const now = new Date()
  const amzDate = formatAmzDate(now)
  const dateStamp = amzDate.slice(0, 8)
  const expiresIn = Math.min(Math.max(input.expiresInSeconds, 1), PRESIGN_MAX_EXPIRES_SECONDS)
  const credentialScope = `${dateStamp}/auto/s3/aws4_request`
  const signedHeaders = 'content-type;host'

  const queryEntries: [string, string][] = [
    ['X-Amz-Algorithm', 'AWS4-HMAC-SHA256'],
    ['X-Amz-Credential', `${input.accessKeyId}/${credentialScope}`],
    ['X-Amz-Date', amzDate],
    ['X-Amz-Expires', String(expiresIn)],
    ['X-Amz-SignedHeaders', signedHeaders],
  ]

  const canonicalQueryString = queryEntries
    .map(([key, value]) => [encodeRfc3986(key), encodeRfc3986(value)] as const)
    .sort(([keyA, valueA], [keyB, valueB]) => {
      if (keyA === keyB) {
        return valueA.localeCompare(valueB)
      }
      return keyA.localeCompare(keyB)
    })
    .map(([key, value]) => `${key}=${value}`)
    .join('&')

  const canonicalHeaders = `content-type:${contentType}\nhost:${host}\n`
  const canonicalRequest = `${method}\n${canonicalUri}\n${canonicalQueryString}\n${canonicalHeaders}\n${signedHeaders}\nUNSIGNED-PAYLOAD`
  const hashedCanonicalRequest = await sha256Hex(canonicalRequest)
  const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${hashedCanonicalRequest}`
  const signingKey = await createSigningKey(input.secretAccessKey, dateStamp)
  const signature = toHex(await hmacSha256(signingKey, stringToSign))

  const query = `${canonicalQueryString}&X-Amz-Signature=${signature}`

  return {
    uploadUrl: `${endpoint.origin}${canonicalUri}?${query}`,
    expiresIn,
    headers: {
      'Content-Type': contentType,
    },
  }
}
