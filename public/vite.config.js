import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const firebaseBrowserMock = resolve(import.meta.dirname, 'e2e/firebase-browser-mock.js');

export default defineConfig({
  publicDir: 'pwa',
  resolve: {
    alias: process.env.MOL_E2E === '1'
      ? [
          { find: 'firebase/app', replacement: firebaseBrowserMock },
          { find: 'firebase/auth', replacement: firebaseBrowserMock },
          { find: 'firebase/firestore', replacement: firebaseBrowserMock },
        ]
      : [],
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeManifestIcons: false,
      manifest: {
        name: 'Mol',
        short_name: 'Mol',
        description: 'Treino, evolução e dieta no seu ritmo.',
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
        importScripts: ['/notification-sw.js'],
        navigateFallback: null,
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,webp,woff2}'],
        runtimeCaching: []
      }
    })
  ],
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 550,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const moduleId = id.replaceAll('\\', '/');
          if (moduleId.includes('/firebase/firestore/') || moduleId.includes('/@firebase/firestore/') || moduleId.includes('/@firebase/webchannel-wrapper/')) return 'firebase-firestore';
          if (moduleId.includes('/firebase/auth/') || moduleId.includes('/@firebase/auth/')) return 'firebase-auth';
          if (moduleId.includes('/@firebase/') || moduleId.includes('/node_modules/firebase/')) return 'firebase-core';
          if (moduleId.includes('/node_modules/lucide/')) return 'icons';
        }
      },
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
