import { createMiddleware } from '@tanstack/react-start'

// Infer the session type from better-auth

// Role validation middleware factory
export const createRoleMw = (allowedRoles: string[]) => {
  return createMiddleware({ type: 'function' }).server(
    async ({ next, context }) => {
      const { session } = context

      if (!session?.user) {
        throw new Error('Authentication required')
      }

      const userRole = (session.user as any).role

      if (!userRole || !allowedRoles.includes(userRole)) {
        throw new Error(
          `Access denied. Required roles: ${allowedRoles.join(', ')}`
        )
      }

      return next({
        context: {
          ...context,
          userRole,
        },
      })
    }
  )
}

// Predefined role middlewares for common use cases
export const adminOnlyMw = createRoleMw(['admin'])
export const moderatorMw = createRoleMw(['admin', 'moderator'])
export const userMw = createRoleMw(['admin', 'moderator', 'user'])
