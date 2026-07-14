// vite.config.js - CORRECTED
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',  // ✅ REQUIRED for Cloudflare Pages
  build: {
    outDir: 'dist',  // ✅ Should match Cloudflare's build output directory
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined, // Helps with smaller chunks
      },
    },
  },
})