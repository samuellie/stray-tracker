import { createFileRoute } from '@tanstack/react-router'
import { createAuth } from '~/lib/auth'

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: ({ request }) => {
        return createAuth().handler(request)
      },
      POST: ({ request }) => {
        return createAuth().handler(request)
      },
    },
  },
})
