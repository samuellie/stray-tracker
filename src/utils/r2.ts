import { env } from 'cloudflare:workers'
import { AwsClient } from 'aws4fetch'

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
