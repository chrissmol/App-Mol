import { expect, test } from '@playwright/test';

const pages = ['/index.html', '/pages/perfil.html', '/pages/dieta.html', '/pages/treino.html', '/pages/configuracoes.html'];
const themes = ['dark', 'light'];
const styles = ['classic', 'gamer', 'cave'];

for (const theme of themes) for (const style of styles) {
  test.describe(`visual ${theme}/${style}`, () => {
    for (const path of pages) {
      test(`${path} aplica preferencia sem cortar conteudo`, async ({ page }) => {
        await page.setViewportSize({ width: 1024, height: 1366 });
        await page.addInitScript(({ themeName, styleName }) => localStorage.setItem('mol-accessibility', JSON.stringify({ theme: themeName, visualStyle: styleName, language: { mode: 'pt-BR', value: 'pt-BR' } })), { themeName: theme, styleName: style });
        await page.goto(path);
        await page.waitForLoadState('networkidle');
        await expect.poll(() => page.evaluate(() => [document.documentElement.dataset.theme, document.documentElement.dataset.visualStyle])).toEqual([theme, style]);
        const metrics = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
        expect(metrics.scroll).toBeLessThanOrEqual(metrics.width + 2);
      });
    }
  });
}
