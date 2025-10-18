import { createMiddleware, createStart } from '@tanstack/react-start'
import { QueryClient } from '@tanstack/react-query'
import { env } from 'cloudflare:workers'
import { auth, createAuth } from './lib/auth'
import { getRequest } from '@tanstack/react-start/server'

type Session = typeof auth.$Infer.Session

declare module '@tanstack/react-start' {
  interface Register {
    server: {
      requestContext: {
        fromFetch: boolean
        session?: Session
      }
    }
  }
}

export const serverMw = createMiddleware().server(({ next, context }) => {
  const nonce = Math.random().toString(16).slice(2, 10)
  return next({
    context: {
      fromServerMw: true,
      env: env,
      nonce,
    },
  })
})

export const fnMw = createMiddleware({ type: 'function' })
  .middleware([serverMw])
  .server(async ({ next, context }) => {
    const { headers } = getRequest()
    const session = await createAuth(env).api.getSession({ headers })

    return next({
      context: {
        fromFnMw: true,
        env: env,
        session,
      },
    })
  })

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

export const startInstance = createStart(() => {
  return {
    defaultSsr: true,
    requestMiddleware: [serverMw],
    functionMiddleware: [fnMw],
    queryClient,
  }
})
