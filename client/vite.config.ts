import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  // Set base URL for GitHub Pages deployment
  base: process.env.NODE_ENV === 'production' ? '/QuickPoll/' : '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Ensure proper asset handling for GitHub Pages
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  // Preview configuration for local testing of production build
  preview: {
    port: 4173,
    strictPort: true,
  },
})
