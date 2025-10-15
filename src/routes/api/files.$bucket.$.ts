import { env } from 'cloudflare:workers'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/files/$bucket/$')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { _splat, bucket } = params
        //example key from param https://stray-tracker-animal-photos.pages.dev/22bf3b55-76b2-4cce-b523-685967162a68/cat-lying.webp

        const bucketMap: Record<string, R2Bucket> = {
          'animal-photos': env.ANIMAL_PHOTOS_BUCKET,
          'user-uploads': env.USER_UPLOADS_BUCKET,
          'user-profiles': env.USER_PROFILE_BUCKET,
        }

        const bucketEnv = bucketMap[bucket]
        if (!bucketEnv) {
          throw new Error('Invalid bucket')
        }

        // Extract actual key from the full URL format
        console.log(_splat)

        const object = await bucketEnv.get(_splat as string)
        if (!object) {
          return new Response('File not found', { status: 404 })
        }

        return new Response(object.body, {
          headers: {
            'Content-Type':
              object.httpMetadata?.contentType || 'application/octet-stream',
            'Cache-Control': 'public, max-age=31536000',
          },
        })
      },
    },
  },
})
