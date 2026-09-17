import { expect, test } from '@playwright/test';

const pages = ['/index.html', '/pages/treino.html', '/pages/dieta.html', '/pages/perfil.html', '/pages/configuracoes.html', '/pages/evolucao.html'];

for (const viewport of [{ width: 2560, height: 1440 }, { width: 1024, height: 1366 }]) {
  test.describe(`layout ${viewport.width}px`, () => {
    for (const path of pages) {
      test(`${path} permanece legivel e sem overflow`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.addInitScript(() => localStorage.setItem('__mol_e2e_user', 'true'));
        await page.goto(path);
        await page.waitForLoadState('networkidle');
        const metrics = await page.evaluate(() => ({
          viewport: document.documentElement.clientWidth,
          scroll: document.documentElement.scrollWidth,
          cards: [...document.querySelectorAll('.glass-card, .mol-card')].filter(element => {
            const rect = element.getBoundingClientRect();
            return rect.width > 0 && (rect.left < -2 || rect.right > document.documentElement.clientWidth + 2);
          }).length
        }));
        expect(metrics.scroll).toBeLessThanOrEqual(metrics.viewport + 2);
        expect(metrics.cards).toBe(0);
      });
    }
  });
}
