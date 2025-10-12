import { createServerFn } from '@tanstack/react-start'
import { cleanupOldTempAnimalPhotoFiles } from '~/utils/r2'

/**
 * Cron job endpoint to cleanup old temporary animal photo files
 * This should be called periodically to remove temporary files older than 24 hours
 */
export const cleanupTempFiles = createServerFn({ method: 'POST' }).handler(
  async () => {
    try {
      const deletedCount = await cleanupOldTempAnimalPhotoFiles(24) // 24 hours

      console.log(`Cleaned up ${deletedCount} old temporary files`)

      return {
        success: true,
        deletedCount,
        message: `Successfully cleaned up ${deletedCount} temporary files`,
      }
    } catch (error) {
      console.error('Failed to cleanup temporary files:', error)
      throw new Error('Failed to cleanup temporary files')
    }
  }
)

/**
 * Manual cleanup endpoint for testing/admin purposes
 * Can be called with custom max age in hours
 */
export const manualCleanup = createServerFn({ method: 'POST' })
  .inputValidator((input: { maxAgeHours?: number }) => {
    if (
      input.maxAgeHours !== undefined &&
      (typeof input.maxAgeHours !== 'number' || input.maxAgeHours <= 0)
    ) {
      throw new Error('maxAgeHours must be a positive number')
    }
    return input
  })
  .handler(async ({ data: { maxAgeHours = 24 } }) => {
    try {
      const deletedCount = await cleanupOldTempAnimalPhotoFiles(maxAgeHours)

      return {
        success: true,
        deletedCount,
        maxAgeHours,
        message: `Successfully cleaned up ${deletedCount} temporary files older than ${maxAgeHours} hours`,
      }
    } catch (error) {
      console.error('Failed to perform manual cleanup:', error)
      throw new Error('Failed to perform manual cleanup')
    }
  })
