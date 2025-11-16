/// <reference types="vite/client" />
import {
  HeadContent,
  Scripts,
  Outlet,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as React from 'react'
import { DefaultCatchBoundary } from '~/components/DefaultCatchBoundary'
import { NotFound } from '~/components/NotFound'
import appCss from '~/styles/app.css?url'
import { seo } from '~/utils/seo'
import { Toaster } from '~/components/ui/sonner'
import { ThemeProvider } from 'next-themes'
import { AuthUIProvider } from '~/components/AuthUIProvider'
import { authClient } from '~/lib/auth-client'

// Service Worker Registration Hook
function useServiceWorker() {
  React.useEffect(() => {
    if ('serviceWorker' in navigator && !import.meta.env.DEV) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then(registration => {
          console.log('SW registered: ', registration)
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError)
        })
    }
  }, [])
}

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  beforeLoad: () => {
    // Service worker registration is handled in the RootComponent
  },
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      ...seo({
        title: 'Stray Tracker - Help Find Lost Pets',
        description:
          'Community-driven app for tracking and helping stray animals in your area.',
      }),
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/favicon-16x16.png',
      },
      { rel: 'manifest', href: '/site.webmanifest' },
      { rel: 'icon', href: '/favicon.ico' },
    ],
  }),
  errorComponent: DefaultCatchBoundary,
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
})

function RootComponent() {
  // Register service worker
  useServiceWorker()

  const { queryClient } = Route.useRouteContext()

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AuthUIProvider>
          <Toaster richColors />
          <RootDocument>
            <Outlet />
          </RootDocument>
        </AuthUIProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background font-sans">
        {/* Main Content */}
        {children}
        {/* Development Tools */}
        {import.meta.env.DEV && (
          <TanStackRouterDevtools position="bottom-right" />
        )}

        <Scripts />
      </body>
    </html>
  )
}
