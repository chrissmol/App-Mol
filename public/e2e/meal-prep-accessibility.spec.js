import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
const axe = await readFile(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8');

for (const theme of ['dark', 'light']) {
  test(`preparo calculado acessível no tema ${theme}`, async ({ page }, testInfo) => {
    await page.addInitScript(selected => {
      localStorage.setItem('__mol_e2e_user', 'true');
      localStorage.setItem('__mol_e2e_prep_diet', 'true');
      localStorage.setItem('mol-accessibility', JSON.stringify({ theme: selected }));
    }, theme);
    await page.goto('/pages/marmitas.html');
    await expect(page.locator('#prep-status')).toContainText('Dietas carregadas');
    await page.locator('#catalog-food').selectOption('Arroz branco cozido', { force: true });
    await page.locator('#add-ingredient').click();
    await page.locator('#catalog-food').selectOption('Peito de frango grelhado', { force: true });
    await page.locator('#add-ingredient').click();
    await page.getByRole('button', { name: 'Calcular preparo' }).click();
    await expect(page.locator('#prep-result')).toBeFocused();
    await page.addScriptTag({ content: axe });
    const violations = await page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } })).violations.filter(item => ['critical', 'serious'].includes(item.impact)).map(item => ({ id: item.id, targets: item.nodes.map(node => node.target) })));
    expect(violations).toEqual([]);
    await page.screenshot({ path: `${testInfo.outputDir}/marmitas-${theme}.png`, fullPage: true });
    await page.locator('#save-prep').click();
    await expect(page.locator('#history-list')).toContainText('Arroz branco cozido + Peito de frango grelhado');
  });
}
