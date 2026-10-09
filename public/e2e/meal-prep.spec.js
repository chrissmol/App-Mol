import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('__mol_e2e_user', 'true');
    localStorage.setItem('__mol_e2e_prep_diet', 'true');
  });
  await page.goto('/pages/marmitas.html');
  await expect(page.locator('#prep-status')).toContainText('Dietas carregadas');
});

test('calcula cinco potes, salva cardápio, reabre e recalcula', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.locator('#count-0').fill('5');
  await page.locator('#count-0').dispatchEvent('change');
  await page.locator('#prep-title').fill('Arroz com frango');
  await page.locator('#catalog-food').selectOption('Arroz branco cozido', { force: true });
  await page.getByRole('button', { name: 'Adicionar ingrediente', exact: true }).click();
  await page.locator('#catalog-food').selectOption('Peito de frango grelhado', { force: true });
  await page.getByRole('button', { name: 'Adicionar ingrediente', exact: true }).click();
  await page.getByRole('button', { name: 'Calcular preparo' }).click();
  await expect(page.locator('#result-content')).toContainText('5 marmitas');
  await expect(page.locator('#result-content')).toContainText('750 g prontos');
  await page.getByRole('button', { name: 'Salvar no histórico' }).click();
  await expect(page.locator('#history-list')).toContainText('Arroz com frango');
  await page.locator('#history-list summary').first().click();
  await page.getByRole('button', { name: 'Preparar novamente' }).click();
  await expect(page.locator('#prep-title')).toHaveValue('Arroz com frango');
  await expect(page.locator('#prep-result')).toBeHidden();
  await page.locator('#count-0').fill('10');
  await page.locator('#count-0').dispatchEvent('change');
  await page.getByRole('button', { name: 'Calcular preparo' }).click();
  await expect(page.locator('#result-content')).toContainText('10 marmitas');
  expect(errors).toEqual([]);
});

test('mantém a tela sem overflow em temas e preferências de acessibilidade', async ({ page }) => {
  for (const theme of ['light', 'dark']) {
    await page.evaluate(selected => {
      document.documentElement.dataset.theme = selected;
      document.documentElement.dataset.largeText = 'true';
      document.documentElement.dataset.reduceMotion = 'true';
    }, theme);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await expect(page.getByRole('heading', { name: 'Marmitas', exact: true })).toBeVisible();
  }
});
