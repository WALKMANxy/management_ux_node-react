import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'
import fs from 'fs';

const env = loadEnv(
  'all',
  process.cwd()
);

const devkey = env.VITE_DEV_KEY
const devcrt = env.VITE_DEV_CRT



export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg','rcs_icon.png'],
      manifest: {
        name: 'RCS Next', // Matches your manifest and index.html
        short_name: 'RCS', // Matches your manifest
        description: 'Internal management application.', // Matches your manifest
        start_url: '/', // Matches the manifest start_url
        display: 'standalone', // Consistent with the manifest
        background_color: '#ffffff', // Matches the manifest
        theme_color: '#000000', // Matches the manifest
        orientation: 'portrait', // Consistent with the manifest
        icons: [
          {
            src: '/images/rcs_icon.png', // Consistent with the manifest
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/images/rcs_icon.png', // Consistent with the manifest
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'], // Caching patterns for PWA

      }
    })
  ],
  server: {
    https: {
      key: fs.readFileSync(devkey as string),
      cert: fs.readFileSync(devcrt as string),
    },
    host: 'localhost',
    port: 3000,
  },
});