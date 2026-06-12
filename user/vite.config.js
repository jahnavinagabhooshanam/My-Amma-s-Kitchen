import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: "Ammulu's Kitchen",
        short_name: 'Amma Kitchen',
        description: 'Authentic South Indian Food Ordering',
        theme_color: '#0A3622',
        background_color: '#F9F6F0',
        display: 'standalone',
        icons: [
          {
            src: 'assets/img/logo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'assets/img/logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  server: {
    open: true
  },
  preview: {},
  build: {
    cssMinify: 'esbuild',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            return 'vendor';
          }
        }
      }
    }
  }
})
