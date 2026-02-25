import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'eletrovagas-logo.svg'], // Seus arquivos estáticos
      manifest: {
        name: 'EletroVagas',
        short_name: 'EletroVagas',
        description: 'Gestão de Carregadores para Condomínios',
        theme_color: '#2563eb', // Azul do seu site
        background_color: '#ffffff',
        display: 'standalone', // Faz parecer app nativo (sem barra do navegador)
        orientation: 'portrait',
        start_url: '/login', 
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})