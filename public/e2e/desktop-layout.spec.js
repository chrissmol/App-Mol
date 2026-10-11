import { expect, test } from '@playwright/test';

const desktopPages = [
  '/index.html',
  '/pages/treino.html',
  '/pages/dieta.html',
  '/pages/perfil.html',
  '/pages/historico.html',
  '/pages/progresso.html',
  '/pages/configuracoes.html',
  '/pages/configuracoes.html#dispositivo',
  '/pages/marmitas.html',
  '/pages/assistente.html',
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
    test(`${path} não espreme cards em colunas estreitas`, async ({ page }) => {
      // Elemento sem regra de largura numa grade de 12 colunas caía em ~72 px.
      await page.setViewportSize({ width: 1440, height: 900 });
      await prepare(page, path);
      const narrow = await page.evaluate(() => [...document.querySelectorAll('main section, main article, main .glass-card, main > div, main > nav')]
        .filter(element => element.offsetParent && (element.innerText || '').trim().length > 20)
        .map(element => ({ id: element.id || String(element.className).slice(0, 60), width: Math.round(element.getBoundingClientRect().width) }))
        .filter(item => item.width > 0 && item.width < 160));
      expect(narrow).toEqual([]);
    });

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
