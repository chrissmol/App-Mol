import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { loadBrand } from './scripts/brand.mjs';

// White label: BRAND=<marca> escolhe brands/<marca>.json (padrão: mol).
const { file: brandFile, brand } = loadBrand(process.env.BRAND);
const jsDir = resolve(import.meta.dirname, 'js').replaceAll('\\', '/');
// shortcut: troca a palavra "Mol" pelo nome da marca no build (HTML e strings do js/), em vez de
// placeholders em ~90 textos; rever se algum texto usar "Mol" fora do sentido de marca.
const brandName = text => brand.name === 'Mol' ? text : text.replace(/\bMol\b/g, () => brand.name);
const brandPlugin = {
  name: 'mol-brand',
  transformIndexHtml: brandName,
  transform: (code, id) => (id.replaceAll('\\', '/').startsWith(jsDir) ? brandName(code) : null),
};

const firebaseBrowserMock = resolve(import.meta.dirname, 'e2e/firebase-browser-mock.js');

export default defineConfig({
  publicDir: 'pwa',
  resolve: {
    alias: [{ find: '@brand', replacement: brandFile }].concat(process.env.MOL_E2E === '1'
      ? [
          { find: 'firebase/app', replacement: firebaseBrowserMock },
          { find: 'firebase/app-check', replacement: firebaseBrowserMock },
          { find: 'firebase/auth', replacement: firebaseBrowserMock },
          { find: 'firebase/firestore', replacement: firebaseBrowserMock },
          { find: 'firebase/ai', replacement: resolve(import.meta.dirname, 'e2e/firebase-ai-mock.js') },
          { find: 'firebase/remote-config', replacement: resolve(import.meta.dirname, 'e2e/firebase-remote-config-mock.js') },
        ]
      : []),
  },
  plugins: [brandPlugin],
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
        marmitas: resolve(import.meta.dirname, 'pages/marmitas.html'),
        perfil: resolve(import.meta.dirname, 'pages/perfil.html'),
        historico: resolve(import.meta.dirname, 'pages/historico.html'),
        progresso: resolve(import.meta.dirname, 'pages/progresso.html'),
        configuracoes: resolve(import.meta.dirname, 'pages/configuracoes.html'),
        evolucao: resolve(import.meta.dirname, 'pages/evolucao.html'),
        assistente: resolve(import.meta.dirname, 'pages/assistente.html'),
        dadosPessoais: resolve(import.meta.dirname, 'pages/dados-pessoais.html'),
        boasVindas: resolve(import.meta.dirname, 'pages/boas-vindas.html'),
        admin: resolve(import.meta.dirname, 'pages/admin.html')
      }
    }
  },
  test: { environment: 'node', include: ['tests/**/*.test.js'] }
});
