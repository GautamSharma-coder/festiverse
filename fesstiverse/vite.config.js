import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import viteImagemin from 'vite-plugin-imagemin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'UDAAN x FESTIVERSE\'26',
        short_name: 'Festiverse\'26',
        description: 'The official Arts & Cultural Club App of GEC Samastipur',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        icons: [
          {
            src: '/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\/api\/(events|sponsors|team|faculty|gallery)/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-cache',
              expiration: { maxAgeSeconds: 300 }
            }
          },
          {
            urlPattern: /\.(?:woff2|png|webp|jpg|svg)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'asset-cache',
              expiration: { maxEntries: 60, maxAgeSeconds: 2592000 }
            }
          }
        ]
      }
    }),
    viteImagemin({
      pngquant: { quality: [0.65, 0.8], speed: 4 },
      optipng: { optimizationLevel: 5 },
      webp: { quality: 75 }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['gsap']
        }
      }
    },
    chunkSizeWarningLimit: 600
  }
})

