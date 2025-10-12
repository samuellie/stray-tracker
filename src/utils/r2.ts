import { env } from 'cloudflare:workers'
import { AwsClient } from 'aws4fetch'

export interface UploadedFile {
  key: string
  url: string
  fileName: string
  fileSize: number
  mimeType: string
}

export interface TempUploadResult {
  sessionId: string
  files: UploadedFile[]
}

/**
 * Upload a file to animal photos R2 bucket temporary storage
 */
export async function uploadSightingPhotoToTempStorage(
  file: File,
  sessionId: string,
  index: number
): Promise<UploadedFile> {
  const bucket = env.ANIMAL_PHOTOS_BUCKET

  // Generate unique key for temporary storage
  const fileExtension = file.name.split('.').pop() || 'jpg'
  const key = `temp/${sessionId}/${index}-${Date.now()}.${fileExtension}`

  // Upload to R2
  await bucket.put(key, file, {
    httpMetadata: {
      contentType: file.type,
    },
  })

  // Generate public URL (assuming bucket is configured for public access)
  const url = `https://stray-tracker-animal-photos.pages.dev/${key}`

  return {
    key,
    url,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
  }
}

/**
 * Move animal photo file from temporary to permanent storage
 */
export async function finalizeAnimalPhotoUpload(
  tempKey: string,
  permanentKey: string
): Promise<UploadedFile> {
  const bucket = env.ANIMAL_PHOTOS_BUCKET as R2Bucket

  // Get the temporary object
  const tempObject = await bucket.get(tempKey)
  if (!tempObject) {
    throw new Error(`Temporary file not found: ${tempKey}`)
  }

  // Copy to permanent location
  await bucket.put(permanentKey, tempObject.body, {
    httpMetadata: tempObject.httpMetadata,
  })

  // Delete temporary file
  await bucket.delete(tempKey)

  // Generate permanent URL
  const url = `https://stray-tracker-animal-photos.pages.dev/${permanentKey}`

  return {
    key: permanentKey,
    url,
    fileName: permanentKey.split('/').pop() || 'unknown',
    fileSize: tempObject.size,
    mimeType:
      tempObject.httpMetadata?.contentType || 'application/octet-stream',
  }
}

/**
 * Clean up temporary animal photo files for a session
 */
export async function cleanupTempAnimalPhotoFiles(
  sessionId: string
): Promise<void> {
  const bucket = env.ANIMAL_PHOTOS_BUCKET as R2Bucket

  // List all objects in the temp session directory
  const objects = await bucket.list({
    prefix: `temp/${sessionId}/`,
  })

  // Delete all temporary files
  const deletePromises = objects.objects.map(obj => bucket.delete(obj.key))
  await Promise.all(deletePromises)
}

/**
 * Clean up old temporary animal photo files (for cron job)
 */
export async function cleanupOldTempAnimalPhotoFiles(
  maxAgeHours: number = 24
): Promise<number> {
  const bucket = env.ANIMAL_PHOTOS_BUCKET as R2Bucket

  const cutoffTime = Date.now() - maxAgeHours * 60 * 60 * 1000

  // List all temp objects
  const objects = await bucket.list({
    prefix: 'temp/',
  })

  let deletedCount = 0

  for (const obj of objects.objects) {
    // Extract timestamp from key (format: temp/sessionId/timestamp-...)
    const keyParts = obj.key.split('/')
    if (keyParts.length >= 3) {
      const fileName = keyParts[2]
      const timestamp = parseInt(fileName.split('-')[1])

      if (!isNaN(timestamp) && timestamp < cutoffTime) {
        await bucket.delete(obj.key)
        deletedCount++
      }
    }
  }

  return deletedCount
}
