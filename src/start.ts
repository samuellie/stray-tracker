import { createMiddleware, createStart } from '@tanstack/react-start'
import { QueryClient } from '@tanstack/react-query'
import { env } from 'cloudflare:workers'
declare module '@tanstack/react-start' {
  interface Register {
    server: {
      requestContext: {
        fromFetch: boolean
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
  .server(({ next, context }) => {
    return next({
      context: {
        fromFnMw: true,
        env: env,
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
