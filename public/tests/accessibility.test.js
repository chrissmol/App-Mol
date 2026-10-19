import { access, readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import axe from 'axe-core';
import { describe, expect, it } from 'vitest';

const pages = [
  'index.html',
  'pages/login.html',
  'pages/treino.html',
  'pages/dieta.html',
  'pages/perfil.html',
  'pages/historico.html',
  'pages/progresso.html',
  'pages/configuracoes.html',
  'pages/evolucao.html',
  'pages/dados-pessoais.html'
];

describe('acessibilidade estrutural das páginas', () => {
  pages.forEach(page => {
    it(`${page} mantém metadados e cabeçalho da identidade Mol`, async () => {
      const html = await readFile(new URL(`../${page}`, import.meta.url), 'utf8');
      const document = new JSDOM(html).window.document;
      expect(document.documentElement.lang).toBe('pt-BR');
      expect(document.title).toBe('Mol');
      expect(document.querySelector('link[rel="icon"]')?.getAttribute('href')).toContain('mol-mark.svg');
      const viewport = document.querySelector('meta[name="viewport"]')?.getAttribute('content') || '';
      expect(viewport).toContain('width=device-width');
      expect(viewport).toContain('initial-scale=1');
      expect(viewport).toContain('viewport-fit=cover');
      expect(viewport).not.toContain('maximum-scale');
      expect(viewport).not.toContain('user-scalable');
      expect(document.querySelector('meta[name="mobile-web-app-capable"]')?.getAttribute('content')).toBe('yes');
      expect(document.querySelector('meta[name="apple-mobile-web-app-capable"]')?.getAttribute('content')).toBe('yes');
      expect(document.querySelector('meta[name="format-detection"]')?.getAttribute('content')).toContain('telephone=no');
      expect(document.querySelector('meta[name="theme-color"]')?.getAttribute('content')).toBe('#070a08');
      const importMap = JSON.parse(document.querySelector('script[type="importmap"]')?.textContent || '{}');
      for (const specifier of ['firebase/app', 'firebase/auth', 'firebase/firestore', 'lucide']) {
        expect(importMap.imports?.[specifier]).toBeTruthy();
        await expect(access(new URL(importMap.imports[specifier], new URL(`../${page}`, import.meta.url)))).resolves.toBeUndefined();
      }
      const backLink = document.querySelector('a#back[aria-label^="Voltar"]');
      if (backLink) expect(document.querySelector('.mol-brand')).toBeNull();
      else if (page !== 'pages/login.html') expect(document.querySelector('.mol-brand')).not.toBeNull();
    });

    it(`${page} não tem violações WCAG A/AA detectáveis sem layout`, async () => {
      const html = await readFile(new URL(`../${page}`, import.meta.url), 'utf8');
      const dom = new JSDOM(html, {
        runScripts: 'dangerously',
        url: `http://localhost/${page}`
      });
      dom.window.eval(axe.source);
      const result = await dom.window.axe.run(dom.window.document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
        rules: { 'color-contrast': { enabled: false } }
      });
      const violations = result.violations
        .map(({ id, help, nodes }) => ({
          id,
          help,
          targets: nodes.map(node => node.target.join(' '))
        }));
      dom.window.close();
      expect(violations).toEqual([]);
    });
  });
});
