import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['assets/mol-mark.svg'],
      manifest: {
        name: 'Mol',
        short_name: 'Mol',
        description: 'Treino, evoluÃ§Ã£o e dieta no seu ritmo.',
        theme_color: '#070a08',
        background_color: '#070a08',
        display: 'standalone',
        lang: 'pt-BR',
        start_url: '/',
        icons: [{ src: '/assets/mol-mark.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,webp,woff2}'],
        runtimeCaching: [{
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*$/i,
          handler: 'StaleWhileRevalidate',
          options: { cacheName: 'google-fonts-stylesheets' }
        }]
      }
    })
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, 'index.html'),
        login: resolve(import.meta.dirname, 'pages/login.html'),
        treino: resolve(import.meta.dirname, 'pages/treino.html'),
        dieta: resolve(import.meta.dirname, 'pages/dieta.html'),
        perfil: resolve(import.meta.dirname, 'pages/perfil.html'),
        historico: resolve(import.meta.dirname, 'pages/historico.html'),
        progresso: resolve(import.meta.dirname, 'pages/progresso.html'),
        configuracoes: resolve(import.meta.dirname, 'pages/configuracoes.html'),
        evolucao: resolve(import.meta.dirname, 'pages/evolucao.html'),
        dadosPessoais: resolve(import.meta.dirname, 'pages/dados-pessoais.html')
      }
    }
  },
  test: { environment: 'node', include: ['tests/**/*.test.js'] }
});
