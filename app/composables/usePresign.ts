import { presignResponseSchema } from '#shared/types/presign'

interface UploadImageResult {
  key: string
  imageUrl: string
}

interface UploadImageOptions {
  key?: string
}

const extractErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message
  }

  if (typeof error === 'object' && error !== null) {
    const maybeError = error as { statusMessage?: string; message?: string }
    return maybeError.statusMessage ?? maybeError.message ?? fallback
  }

  return fallback
}

export function usePresign() {
  const isUploading = ref(false)
  const uploadError = ref<string | null>(null)

  const uploadImage = async (
    file: File,
    options: UploadImageOptions = {}
  ): Promise<UploadImageResult> => {
    isUploading.value = true
    uploadError.value = null

    try {
      const rawPresign = await $fetch('/api/presign', {
        method: 'POST',
        body: {
          fileName: file.name,
          contentType: file.type,
          size: file.size,
          key: options.key,
        },
      })

      const presign = presignResponseSchema.parse(rawPresign)

      const uploadResponse = await fetch(presign.uploadUrl, {
        method: presign.method,
        headers: presign.headers,
        body: file,
      })

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed with status ${uploadResponse.status}`)
      }

      if (!presign.publicUrl) {
        throw new Error('R2 public URL is not configured.')
      }

      return {
        key: presign.key,
        imageUrl: presign.publicUrl,
      }
    } catch (error) {
      const message = extractErrorMessage(error, 'Failed to upload image.')
      uploadError.value = message
      throw new Error(message)
    } finally {
      isUploading.value = false
    }
  }

  const clearUploadError = () => {
    uploadError.value = null
  }

  return {
    uploadImage,
    isUploading,
    uploadError,
    clearUploadError,
  }
}
