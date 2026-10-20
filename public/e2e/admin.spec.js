import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const axeSource = await readFile(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8');

async function openAdmin(page, theme = 'dark') {
  await page.addInitScript(selectedTheme => {
    localStorage.setItem('__mol_e2e_user', 'true');
    localStorage.setItem('__mol_e2e_email', 'chrisouzamol@gmail.com');
    localStorage.setItem('__mol_e2e_snapshots', JSON.stringify({
      presence: [{ online: true, name: 'Ana', email: 'ana@exemplo.com', page: '/index.html' }],
      clientErrors: [{ message: 'Falha ao salvar', email: 'ana@exemplo.com', page: '/dieta.html', stack: 'at x' }],
    }));
    localStorage.setItem('mol-accessibility', JSON.stringify({ theme: selectedTheme, contrast: false, largeText: false, reduceMotion: false, language: { mode: 'pt-BR', value: 'pt-BR' } }));
  }, theme);
  await page.goto('/pages/admin.html');
}

test('admin: voltar para o perfil, status em texto e limpar pede confirmação', async ({ page }) => {
  await openAdmin(page);
  await expect(page.getByRole('link', { name: 'Voltar para o perfil' })).toBeVisible();
  await expect(page.locator('#presence-list')).toContainText('Online');
  await expect(page.locator('#error-list')).toContainText('Falha ao salvar');
  const clear = page.locator('#clear-errors');
  expect((await clear.boundingBox()).height).toBeGreaterThanOrEqual(44);
  await clear.click();
  await expect(page.locator('#mol-confirm')).toContainText('Limpar a lista de erros?');
  await page.getByRole('button', { name: 'Cancelar' }).click();
  await expect(page.locator('#mol-confirm')).toHaveCount(0);
});

test('admin: conta comum vê acesso restrito', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('__mol_e2e_user', 'true'));
  await page.goto('/pages/admin.html');
  await expect(page.locator('#admin-status')).toHaveText('Acesso restrito ao administrador.');
});

for (const theme of ['dark', 'light']) {
  test(`admin: sem violações sérias no tema ${theme}`, async ({ page }) => {
    await openAdmin(page, theme);
    await expect(page.locator('#error-list')).toContainText('Falha ao salvar');
    await page.addScriptTag({ content: axeSource });
    const results = await page.evaluate(() => window.axe.run(document, { resultTypes: ['violations'], runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'] } }));
    const relevant = results.violations.filter(item => ['serious', 'critical'].includes(item.impact));
    expect(relevant, JSON.stringify(relevant.map(i => ({ id: i.id, nodes: i.nodes.map(n => n.target) })))).toEqual([]);
  });
}
