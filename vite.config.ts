import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Totem 100% offline: depois do primeiro carregamento, o service
    // worker faz cache de tudo (app, fontes, imagens e o JSON de
    // clientes) e serve local mesmo sem internet.
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg,png,jpg,jpeg,webp,json,woff,woff2}'],
        // Alguns assets (satélite, galerias) passam do limite padrão de
        // 2MB do Workbox mesmo já otimizados — sobe o teto do precache.
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
      },
      manifest: {
        name: 'Essencial Energia',
        short_name: 'Essencial Energia',
        start_url: '/',
        display: 'fullscreen',
        background_color: '#070404',
        theme_color: '#070404',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    host: true,
    port: 5173,
  },
  build: {
    target: 'es2022',
    sourcemap: false,
  },
})
