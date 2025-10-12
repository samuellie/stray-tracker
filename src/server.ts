// DO NOT DELETE THIS FILE!!!
// This file is a good smoke test to make sure the custom server entry is working
import handler from '@tanstack/react-start/server-entry'
import { cleanupOldTempAnimalPhotoFiles } from '~/utils/r2'

console.log("[server-entry]: using custom server entry in 'src/server.ts'")

export default {
  async fetch(request: Request) {
    return handler.fetch(request, { context: { fromFetch: true } })
  },

  // Handle scheduled events (cron jobs)
  async scheduled(event: ScheduledEvent, env: any, ctx: ExecutionContext) {
    console.log('[cron]: Running scheduled cleanup job')

    try {
      const deletedCount = await cleanupOldTempAnimalPhotoFiles(24) // 24 hours
      console.log(`[cron]: Cleaned up ${deletedCount} old temporary files`)
    } catch (error) {
      console.error('[cron]: Failed to cleanup temporary files:', error)
    }
  },
}
