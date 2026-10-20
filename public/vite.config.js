import { cpSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { brandReplacer, loadBrand } from './scripts/brand.mjs';

// White label: BRAND=<marca> escolhe brands/<marca>.json (padrão: mol).
const { file: brandFile, brand } = loadBrand(process.env.BRAND);
const jsDir = resolve(import.meta.dirname, 'js').replaceAll('\\', '/');
const cssDir = resolve(import.meta.dirname, 'css').replaceAll('\\', '/');
const brandText = brandReplacer(brand, loadBrand('mol').brand);
// Logo da marca (brands/<marca>/logo.svg) no lugar de assets/mol-mark.svg; sem ela fica a do Mol.
const brandLogo = resolve(import.meta.dirname, 'brands', brand.id, 'logo.svg');
const hasBrandLogo = existsSync(brandLogo);
const brandPets = resolve(import.meta.dirname, 'brands', brand.id, 'pets');
const brandPlugin = {
  name: 'mol-brand',
  transformIndexHtml: {
    order: 'pre',
    // No HTML o Vite processa a logo como asset, então o caminho aponta direto para o arquivo da marca.
    handler: html => brandText(hasBrandLogo ? html.replace(/(?:\.{1,2}\/)*assets\/mol-mark\.svg/g, `/brands/${brand.id}/logo.svg`) : html),
  },
  transform(code, id) {
    const file = id.replaceAll('\\', '/').split('?')[0];
    return file.startsWith(jsDir) || file.startsWith(cssDir) ? brandText(code) : null;
  },
  // Cópia estática (pwa/assets) usada pelos caminhos fixos em JS, favicon e service worker.
  writeBundle({ dir }) {
    if (hasBrandLogo) cpSync(brandLogo, resolve(dir, 'assets/mol-mark.svg'));
    // Arte dos pets da marca (brands/<marca>/pets/<id>/<estado>.webp) em /assets/pets/<id>/.
    if (existsSync(brandPets)) cpSync(brandPets, resolve(dir, 'assets/pets'), { recursive: true });
  },
};

const firebaseBrowserMock = resolve(import.meta.dirname, 'e2e/firebase-browser-mock.js');

export default defineConfig({
  publicDir: 'pwa',
  resolve: {
    alias: [
      { find: '@brand', replacement: brandFile },
    ].concat(process.env.MOL_E2E === '1'
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
