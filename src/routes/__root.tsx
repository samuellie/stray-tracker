/// <reference types="vite/client" />
import {
  HeadContent,
  Link,
  Scripts,
  createRootRoute,
  Outlet,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import * as React from 'react'
import { DefaultCatchBoundary } from '~/components/DefaultCatchBoundary'
import { NotFound } from '~/components/NotFound'
import appCss from '~/styles/app.css?url'
import { seo } from '~/utils/seo'

// Service Worker Registration Hook
function useServiceWorker() {
  React.useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
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

export const Route = createRootRoute({
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

  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background font-sans">
        {/* Navigation Header */}
        <header className="border-b bg-white shadow-sm">
          <nav className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Link
                to="/"
                className="text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                🐾 Stray Tracker
              </Link>
              <div className="flex items-center gap-6">
                <Link
                  to="/"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                  activeProps={{
                    className: 'text-blue-600 font-medium',
                  }}
                  activeOptions={{ exact: true }}
                >
                  Home
                </Link>
                <Link
                  to="/animals"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                  activeProps={{
                    className: 'text-blue-600 font-medium',
                  }}
                >
                  Animals
                </Link>
                <Link
                  to="/sightings"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                  activeProps={{
                    className: 'text-blue-600 font-medium',
                  }}
                >
                  Sightings
                </Link>
                <Link
                  to="/report"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                  activeProps={{
                    className: 'text-blue-600 font-medium',
                  }}
                >
                  Report
                </Link>
                <Link
                  to="/shadcn-test"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                  activeProps={{
                    className: 'text-blue-600 font-medium',
                  }}
                >
                  UI Test
                </Link>
              </div>
            </div>
          </nav>
        </header>

        {/* Main Content */}
        <main className="flex-1">{children}</main>

        {/* Development Tools */}
        {process.env.NODE_ENV === 'development' && (
          <TanStackRouterDevtools position="bottom-right" />
        )}

        <Scripts />
      </body>
    </html>
  )
}
