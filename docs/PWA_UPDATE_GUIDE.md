# PWA Update Guide

## Problem
When deploying updates to the Stray Tracker PWA, users with the app installed on their phones weren't receiving updates. The app would continue using the old cached version.

## Solution
The PWA update mechanism has been enhanced with the following changes:

### 1. Dynamic Cache Versioning
**File: `public/sw.js`**

The service worker now uses a dynamic version that includes a build timestamp:

```javascript
const VERSION = '1.0.0-BUILD_TIMESTAMP' // Replaced during build
const CACHE_NAME = `stray-tracker-${VERSION}`
```

This ensures that each deployment creates a new cache version, forcing the browser to recognize the update.

### 2. Build-Time Version Injection
**File: `vite.config.ts`**

A custom Vite plugin automatically injects the build timestamp during the build process:

```typescript
function injectServiceWorkerVersion() {
  return {
    name: 'inject-sw-version',
    apply: 'build',
    generateBundle(_options, bundle) {
      const swFile = bundle['sw.js']
      if (swFile && 'code' in swFile) {
        const buildTimestamp = Date.now()
        swFile.code = swFile.code.replace(
          'BUILD_TIMESTAMP',
          buildTimestamp.toString()
        )
      }
    }
  }
}
```

### 3. Update Detection & User Notification
**File: `src/routes/__root.tsx`**

The service worker registration now includes:

- **Automatic update checks** every 60 seconds
- **Update detection** when a new service worker is available
- **User notification** with a prompt to reload and apply updates
- **Automatic reload** when the user accepts the update

```typescript
// Check for updates every 60 seconds
setInterval(() => {
  registration.update()
}, 60000)

// Handle updates
registration.addEventListener('updatefound', () => {
  const newWorker = registration.installing
  if (!newWorker) return

  newWorker.addEventListener('statechange', () => {
    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
      if (window.confirm('A new version of the app is available. Reload to update?')) {
        newWorker.postMessage({ type: 'SKIP_WAITING' })
        window.location.reload()
      }
    }
  })
})
```

### 4. Service Worker Message Handling
**File: `public/sw.js`**

The service worker can now receive messages from the app:

```javascript
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting() // Activate immediately
  }
})
```

## How It Works

### Deployment Flow
1. **Build**: Run `npm run build`
   - Vite plugin injects current timestamp into `sw.js`
   - Service worker gets unique version (e.g., `1.0.0-1732372434123`)

2. **Deploy**: Deploy the built files to your hosting
   - New `sw.js` file is uploaded with new version

3. **User Opens App**:
   - Browser checks for service worker updates
   - Detects new `sw.js` file (different content)
   - Downloads and installs new service worker
   - Triggers `updatefound` event

4. **User Notification**:
   - App shows confirmation dialog: "A new version of the app is available. Reload to update?"
   - User clicks OK
   - New service worker activates immediately
   - Page reloads with new version

### Automatic Update Checks
- Every 60 seconds, the app checks for updates
- When user navigates between pages
- When user focuses the browser tab

## Testing Updates Locally

### Option 1: Manual Testing
1. Build the app: `npm run build`
2. Serve the build: `npm run preview` or deploy to staging
3. Open in browser and install PWA
4. Make a change to your app
5. Build again: `npm run build`
6. Deploy the new build
7. Open the PWA - you should see the update prompt within 60 seconds

### Option 2: Force Update Check
In browser console:
```javascript
navigator.serviceWorker.getRegistration().then(reg => reg.update())
```

### Option 3: Clear Service Worker (for testing)
In browser DevTools:
1. Open Application tab
2. Go to Service Workers
3. Click "Unregister"
4. Reload page

## Best Practices

### 1. Always Build Before Deploying
```bash
npm run build
```
This ensures the timestamp is injected.

### 2. Monitor Service Worker Status
Check browser console for logs:
- `[SW] Injected version: 1.0.0-XXXXX` - during build
- `SW registered:` - when service worker registers
- `New service worker available` - when update is detected

### 3. Test on Real Devices
- Install PWA on phone
- Deploy update
- Open app and wait ~60 seconds
- Should see update prompt

### 4. Handle Update Rejection
If user clicks "Cancel" on the update prompt:
- Old version continues running
- Next time they open the app, they'll be prompted again
- Update check runs every 60 seconds

## Troubleshooting

### Updates Not Detected
1. **Check build output**: Ensure timestamp was injected
   ```bash
   npm run build
   # Look for: [SW] Injected version: 1.0.0-XXXXX
   ```

2. **Verify deployment**: Check that new `sw.js` is deployed
   - Open `https://your-domain.com/sw.js` in browser
   - Check the VERSION constant

3. **Clear cache**: On the device
   - Settings → Browser → Clear cache
   - Or uninstall and reinstall PWA

### Service Worker Not Registering
1. **HTTPS required**: PWA only works on HTTPS (or localhost)
2. **Check scope**: Service worker scope is `/`
3. **Check console**: Look for registration errors

### Update Prompt Not Showing
1. **Check if update exists**: New service worker must be different
2. **Wait 60 seconds**: Automatic check interval
3. **Check console**: Look for "New service worker available"

## Future Enhancements

Consider implementing:
1. **Toast notification** instead of `window.confirm()`
2. **Silent updates** with notification badge
3. **Version display** in app settings
4. **Update changelog** shown to users
5. **Rollback mechanism** for problematic updates

## Related Files
- `/public/sw.js` - Service worker implementation
- `/src/routes/__root.tsx` - Service worker registration
- `/vite.config.ts` - Build-time version injection
