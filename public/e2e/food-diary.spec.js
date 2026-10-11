import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('__mol_e2e_user', 'true');
    localStorage.setItem('mol-accessibility', JSON.stringify({ theme: 'dark', contrast: false, largeText: false, reduceMotion: true, language: { mode: 'pt-BR', value: 'pt-BR' } }));
    if (!sessionStorage.getItem('__e2e_ready')) { sessionStorage.setItem('__e2e_ready', '1'); localStorage.removeItem('__mol_e2e_diary'); }
  });
});

test('diário: marcar refeição, somar água e registrar extra, e continua após recarregar', async ({ page }) => {
  await page.goto('/pages/dieta.html');
  await expect(page.getByRole('heading', { name: 'Consumido hoje' })).toBeVisible();
  await expect(page.locator('#diet-total')).toHaveText('0 kcal');

  const breakfast = page.getByRole('button', { name: 'Comi: Café da manhã' });
  await breakfast.click();
  await expect(breakfast).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#diet-total')).toHaveText('89 kcal');

  await page.getByRole('button', { name: /Somar um copo/ }).click();
  await expect(page.locator('#diet-water')).toContainText('0,25 L');

  await page.getByRole('button', { name: 'Registrar extra' }).click();
  await page.locator('#food-query').fill('banana');
  await page.locator('[data-food-index]').first().click();
  await page.getByRole('button', { name: 'Registrar no diário' }).click();
  await expect(page.locator('#diary-extra')).toContainText('Banana');

  await page.reload();
  await expect(page.getByRole('button', { name: 'Comi: Café da manhã' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#diet-water')).toContainText('0,25 L');

  await page.getByRole('button', { name: 'Comi: Café da manhã' }).click();
  await expect(page.getByRole('button', { name: 'Comi: Café da manhã' })).toHaveAttribute('aria-pressed', 'false');
});

test('outro dia da semana mostra o planejado, sem diário', async ({ page }) => {
  await page.goto('/pages/dieta.html');
  const other = (new Date().getDay() + 1) % 7;
  await page.locator(`[data-day="${other}"]`).click();
  await expect(page.getByRole('heading', { name: 'Planejado neste dia' })).toBeVisible();
  await expect(page.getByRole('button', { name: /^Comi:/ })).toHaveCount(0);
  await expect(page.locator('#diet-water')).toBeEmpty();
});
