import build from '@hono/vite-build/cloudflare-pages'
import devServer from '@hono/vite-dev-server'
import adapter from '@hono/vite-dev-server/cloudflare'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    build({
      outputDir: './dist',
      entry: 'src/index.tsx',
      // Only route /api/* to the worker, everything else is static
      minify: true
    }),
    devServer({
      adapter,
      entry: 'src/index.tsx'
    })
  ]
})
