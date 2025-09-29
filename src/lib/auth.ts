import { betterAuth } from 'better-auth'
import { withCloudflare } from 'better-auth-cloudflare'
import { reactStartCookies } from 'better-auth/react-start'

export const auth = betterAuth(
  withCloudflare(
    {
      // Configure KV for session storage
      kv: {
        bindEnv: 'CACHE',
      },
      // Note: D1 configuration will be set up in the actual handler with runtime env
    },
    {
      // Better Auth main configuration
      // Base URL for production
      baseURL:
        process.env.NODE_ENV === 'development'
          ? 'http://localhost:8787'
          : process.env.CF_PAGES_URL || 'https://stray-tracker.pages.dev',
      plugins: [
        reactStartCookies(), // Cookies integration for TanStack Start
      ],
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
      // Social OAuth providers
      socialProviders: {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID || '',
          clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        },
        facebook: {
          clientId: process.env.FACEBOOK_CLIENT_ID || '',
          clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
        },
        instagram: {
          clientId: process.env.INSTAGRAM_CLIENT_ID || '',
          clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || '',
        },
      },
      // IP address detection for rate limiting in Cloudflare
      advanced: {
        ipAddress: {
          ipAddressHeaders: ['cf-connecting-ip'],
        },
      },
    }
  )
)

export type Auth = typeof auth
