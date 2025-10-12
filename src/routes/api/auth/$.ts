import { createFileRoute } from '@tanstack/react-router'
import { createAuth } from '~/lib/auth'
import { env } from 'cloudflare:workers'

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: ({ request }) => {
        return createAuth(env).handler(request)
      },
      POST: ({ request }) => {
        return createAuth(env).handler(request)
      },
    },
  },
})
