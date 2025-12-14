// Service Worker for Stray Tracker PWA
// IMPORTANT: This version should be updated on each deployment
// You can use a build script to inject the build timestamp or git hash
const VERSION = '1.0.0-2025-12-14T07-28-46-250Z' // This will be replaced during build
const CACHE_NAME = `stray-tracker-${VERSION}`
const STATIC_CACHE_NAME = `stray-tracker-static-${VERSION}`
const DYNAMIC_CACHE_NAME = `stray-tracker-dynamic-${VERSION}`

// Resources to cache on install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/offline.html'
]

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Install')
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('[ServiceWorker] Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .catch(error => {
        console.log('[ServiceWorker] Error caching static assets:', error)
      })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activate')
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME)
          .map(cacheName => {
            console.log('[ServiceWorker] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          })
      )
    })
  )
  self.clients.claim()
})

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests and external requests
  if (request.method !== 'GET' || !url.origin.includes(self.location.origin)) {
    return
  }

  // Handle API requests - network first, then cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache successful API responses
          if (response.ok) {
            const responseClone = response.clone()
            caches.open(DYNAMIC_CACHE_NAME).then(cache => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
        .catch(() => {
          // Return cached response if network fails
          return caches.match(request)
        })
    )
    return
  }

  // Handle static assets - cache first, then network
  if (STATIC_ASSETS.includes(url.pathname) ||
      url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
    event.respondWith(
      caches.match(request)
        .then(response => {
          return response || fetch(request).then(response => {
            if (response.ok) {
              const responseClone = response.clone()
              caches.open(STATIC_CACHE_NAME).then(cache => {
                cache.put(request, responseClone)
              })
            }
            return response
          })
        })
        .catch(() => {
          // Return offline page for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/offline.html')
          }
        })
    )
    return
  }

  // Default strategy - network first
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok) {
          const responseClone = response.clone()
          caches.open(DYNAMIC_CACHE_NAME).then(cache => {
            cache.put(request, responseClone)
          })
        }
        return response
      })
      .catch(() => {
        return caches.match(request)
          .then(response => {
            // Return offline page for navigation requests
            if (!response && request.mode === 'navigate') {
              return caches.match('/offline.html')
            }
            return response
          })
      })
  )
})

// Background sync for offline actions
self.addEventListener('sync', event => {
  console.log('[ServiceWorker] Background sync triggered:', event.tag)

  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  try {
    // Get pending offline actions from IndexedDB or similar
    const pendingActions = await getPendingActions()

    for (const action of pendingActions) {
      try {
        await fetch(action.url, action.options)
        // Remove from pending actions
        await removePendingAction(action.id)
      } catch (error) {
        console.log('[ServiceWorker] Background sync failed for action:', action, error)
      }
    }
  } catch (error) {
    console.log('[ServiceWorker] Background sync error:', error)
  }
}

// Push notification event
self.addEventListener('push', event => {
  console.log('[ServiceWorker] Push received')

  if (!event.data) return

  const data = event.data.json()

  const options = {
    body: data.body,
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.primaryKey
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// Notification click event
self.addEventListener('notificationclick', event => {
  console.log('[ServiceWorker] Notification clicked')

  event.notification.close()

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        const url = event.notification.data?.url || '/'

        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus()
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(url)
        }
      })
  )
})

// Helper functions for pending actions (would be implemented with IndexedDB)
async function getPendingActions() {
  // Placeholder - implement with IndexedDB
  return []
}

async function removePendingAction(id) {
  // Placeholder - implement with IndexedDB
}

// Message event - handle commands from the app
self.addEventListener('message', event => {
  console.log('[ServiceWorker] Message received:', event.data)

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: VERSION })
  }
})

