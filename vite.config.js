import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      }
    }
  },
  server: {
    port: 3000,
    open: true,
    fs: {
      // Allow serving files from one level up
      strict: false
    }
  },
  base: '/',
  publicDir: false // Disable public directory for dev server
})
