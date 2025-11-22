import { betterAuth } from 'better-auth'
import { admin } from 'better-auth/plugins'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { withCloudflare } from 'better-auth-cloudflare'
import { reactStartCookies } from 'better-auth/react-start'
import schema from '../../db/schema'
import { drizzle } from 'drizzle-orm/d1'

const createAuth = (env?: Env, cf?: IncomingRequestCfProperties) => {
  const db = env
    ? drizzle(env.DB, { schema: schema, logger: true })
    : ({} as any)
  return betterAuth(
    withCloudflare(
      {
        geolocationTracking: false,
        autoDetectIpAddress: false,
        // Configure KV for session storage
        cf: cf || {},
        d1: {
          db,
          options: {
            usePlural: true,
            debugLogs: true,
          },
        },
        kv: env?.CACHE,
        r2: env
          ? {
              bucket: env.USER_PROFILE_BUCKET,
              maxFileSize: 1 * 1024 * 1024, // 1MB
              allowedTypes: ['.jpg', '.jpeg', '.png', '.gif'],
              additionalFields: {
                category: { type: 'string', required: false },
                isPublic: { type: 'boolean', required: false },
                description: { type: 'string', required: false },
              },
            }
          : undefined,
      },
      {
        // Better Auth main configuration
        // Base URL for production
        baseURL: import.meta.env.DEV
          ? 'http://localhost:8787'
          : env?.CF_PAGES_URL || 'https://stray-tracker.pages.dev',
        plugins: [
          admin(),
          reactStartCookies(), // Cookies integration for TanStack Start
        ],
        session: {
          updateAge: 60 * 30, // 30 minutes
        },
        // Rate limiting for Cloudflare
        rateLimit: {
          enabled: true,
          window: 60, // time window in seconds
          max: 100, // max requests in the window
        },
        // Email and password authentication
        emailAndPassword: {
          enabled: true,
        },
        trustedOrigins: ['http://localhost:3000', 'http://localhost:8787'],
        // Social OAuth providers
        // socialProviders: {
        //   google: {
        //     clientId: process.env.GOOGLE_CLIENT_ID || '',
        //     clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        //   },
        //   facebook: {
        //     clientId: process.env.FACEBOOK_CLIENT_ID || '',
        //     clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
        //   },
        // },
        // // IP address detection for rate limiting in Cloudflare
        advanced: {
          ipAddress: {
            ipAddressHeaders: ['cf-connecting-ip'],
          },
        },
        ...(env
          ? {}
          : {
              database: drizzleAdapter({} as D1Database, {
                provider: 'sqlite',
                usePlural: true,
                debugLogs: true,
              }),
            }),
      }
    )
  )
}

// Export for CLI schema generation
export const auth = createAuth()

// Export for runtime usage
export { createAuth }
