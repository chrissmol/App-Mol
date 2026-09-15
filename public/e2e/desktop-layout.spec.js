import { expect, test } from '@playwright/test';

const desktopPages = [
  '/index.html',
  '/pages/treino.html',
  '/pages/dieta.html',
  '/pages/perfil.html',
  '/pages/historico.html',
  '/pages/progresso.html',
  '/pages/configuracoes.html',
  '/pages/evolucao.html',
  '/pages/dados-pessoais.html',
];

async function prepare(page, path) {
  await page.addInitScript(() => {
    localStorage.setItem('__mol_e2e_user', 'true');
    localStorage.setItem('mol-accessibility', JSON.stringify({
      theme: 'dark',
      contrast: false,
      largeText: false,
      reduceMotion: true,
      language: { mode: 'pt-BR', value: 'pt-BR' }
    }));
  });
  await page.goto(path);
  await page.waitForLoadState('networkidle');
}

test.describe('layout desktop', () => {
  for (const path of desktopPages) {
    test(`${path} não cria rolagem horizontal nem cards fora do viewport`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await prepare(page, path);

      const metrics = await page.evaluate(() => {
        const viewportWidth = document.documentElement.clientWidth;
        const elements = [...document.querySelectorAll('main, header, section, article, .glass-card, .mol-card, .mol-panel')];
        const offenders = elements
          .map(element => {
            const rect = element.getBoundingClientRect();
            return {
              tag: element.tagName.toLowerCase(),
              id: element.id,
              className: String(element.className || '').slice(0, 120),
              left: Math.round(rect.left),
              right: Math.round(rect.right),
              width: Math.round(rect.width)
            };
          })
          .filter(item => item.width > 0 && (item.left < -2 || item.right > viewportWidth + 2));
        return {
          viewportWidth,
          scrollWidth: document.documentElement.scrollWidth,
          bodyScrollWidth: document.body.scrollWidth,
          offenders
        };
      });

      expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.viewportWidth + 2);
      expect(metrics.bodyScrollWidth).toBeLessThanOrEqual(metrics.viewportWidth + 2);
      expect(metrics.offenders).toEqual([]);
    });
  }
});
