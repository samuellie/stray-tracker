import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { defineConfig } from 'vite'
import tsConfigPaths from 'vite-tsconfig-paths'
import viteReact from '@vitejs/plugin-react'
import { cloudflare } from '@cloudflare/vite-plugin'

// Plugin to inject build timestamp into service worker
function injectServiceWorkerVersion() {
  return {
    name: 'inject-sw-version',
    apply: 'build' as const,
    generateBundle(_options: any, bundle: any) {
      const swFile = bundle['sw.js']
      if (swFile && 'code' in swFile) {
        const buildTimestamp = Date.now()
        swFile.code = swFile.code.replace(
          'BUILD_TIMESTAMP',
          buildTimestamp.toString()
        )
        console.log(`[SW] Injected version: 1.0.0-${buildTimestamp}`)
      }
    }
  }
}

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    tsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tanstackStart(),
    viteReact(),
    injectServiceWorkerVersion(),
  ],
})
