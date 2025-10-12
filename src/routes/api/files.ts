import { createServerFn } from '@tanstack/react-start'
import { env } from 'cloudflare:workers'
import z from 'zod'

export interface UploadUrl {
  url: string
  key: string
  fields?: Record<string, string>
}

/**
 * generate a session key first
 */
export const generateSessionKey = createServerFn({ method: 'GET' }).handler(
  async () => {
    return crypto.randomUUID()
  }
)

/**
 * Upload api to upload images into R2 sighting bucket temporary path
 */
export const uploadSightingPhoto = createServerFn({ method: 'POST' })
  .inputValidator(z.instanceof(FormData))
  .handler(async ({ data: formData }) => {
    const file = formData.get('file') as File
    if (!(file instanceof File)) throw new Error('[file] not found')
    const sessionId = formData.get('sessionId')
    if (!sessionId) throw new Error('[sessionId] not found')
    const bucket = env.ANIMAL_PHOTOS_BUCKET

    // if want can check for existing list of sessionId,
    // but security not really concern if its authed users
    const key = `${sessionId}/${file.name}`

    // Upload to R2
    const uploadedObj = await bucket.put(key, file, {
      httpMetadata: {
        contentDisposition: `attachment; filename="${file.name}"`,
        contentType: file.type,
      },
    })

    return { key: uploadedObj.key }
  })
