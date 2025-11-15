import { AuthQueryProvider } from '@daveyplate/better-auth-tanstack'
import { AuthUIProviderTanstack } from '@daveyplate/better-auth-ui/tanstack'
import { Link, useRouter } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { authClient } from '~/lib/auth-client'

export function AuthUIProvider({ children }: { children: ReactNode }) {
  const router = useRouter()

  return (
    <AuthQueryProvider>
      <AuthUIProviderTanstack
        authClient={authClient}
        account={{
          basePath: '/app/account',
        }}
        // social={{ // not yet
        //   providers: ['google', 'facebook', 'apple'],
        // }}
        navigate={href => router.navigate({ href })}
        replace={href => router.navigate({ href, replace: true })}
        Link={({ href, ...props }) => <Link to={href} {...props} />}
      >
        {children}
      </AuthUIProviderTanstack>
    </AuthQueryProvider>
  )
}
