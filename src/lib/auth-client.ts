import { createAuthClient } from 'better-auth/react'
import { cloudflareClient } from 'better-auth-cloudflare/client'
import { adminClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  plugins: [cloudflareClient(), adminClient()],
})
