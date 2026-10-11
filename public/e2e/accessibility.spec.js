import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const pages = [
  '/index.html',
  '/pages/treino.html',
  '/pages/dieta.html',
  '/pages/marmitas.html',
  '/pages/assistente.html',
  '/pages/perfil.html',
  '/pages/historico.html',
  '/pages/progresso.html',
  '/pages/configuracoes.html',
  '/pages/evolucao.html',
  '/pages/dados-pessoais.html',
  '/pages/boas-vindas.html',
  '/pages/login.html',
];

const axeSource = await readFile(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8');

function isPrivatePage(path) {
  return !path.endsWith('/pages/login.html');
}

async function prepare(page, path, theme = 'dark') {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(({ needsAuth, selectedTheme }) => {
    if (needsAuth) localStorage.setItem('__mol_e2e_user', 'true');
    localStorage.setItem('mol-accessibility', JSON.stringify({
      theme: selectedTheme,
      contrast: false,
      largeText: false,
      reduceMotion: false,
      language: { mode: 'pt-BR', value: 'pt-BR' }
    }));
  }, { needsAuth: isPrivatePage(path), selectedTheme: theme });
  await page.goto(path);
  await page.addScriptTag({ content: axeSource });
}

test.describe('acessibilidade automatizada', () => {
  test.describe.configure({ mode: 'serial' });

  for (const theme of ['dark', 'light']) {
    for (const path of pages) {
      test(`${path} não tem violações sérias no tema ${theme}`, async ({ page }) => {
        await prepare(page, path, theme);
        const results = await page.evaluate(async () => window.axe.run(document, {
          resultTypes: ['violations'],
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] }
        }));
        const relevant = results.violations.filter(item => ['serious', 'critical'].includes(item.impact));
        expect(relevant, JSON.stringify(relevant.map(item => ({ id: item.id, impact: item.impact, nodes: item.nodes.map(node => node.target) })), null, 2)).toEqual([]);
      });
    }
  }
});
