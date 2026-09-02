import { expect, test } from '@playwright/test';

test('login, navegação privada, dieta e tema permanecem estáveis', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  await page.goto('/pages/login.html');
  await page.locator('#googleLoginBtn').click();
  await page.waitForURL('**/index.html');
  await expect(page.locator('#user-name')).toHaveText('Christian');
  const skipTutorial = page.getByRole('button', { name: 'Pular' });
  await skipTutorial.click({ timeout: 5000 }).catch(() => {});

  await page.locator('[data-page="treino.html"]').click();
  await page.waitForURL('**/pages/treino.html');
  await expect(page.getByRole('heading', { name: 'Treinos' })).toBeVisible();
  await expect(page).not.toHaveURL(/login\.html/);

  await page.locator('[data-page="dieta.html"]').click();
  await page.waitForURL('**/pages/dieta.html');
  await expect(page.getByRole('heading', { name: 'Dieta' })).toBeVisible();
  await expect(page.locator('#diet-content')).toBeVisible();

  await page.goto('/pages/configuracoes.html');
  await page.getByRole('button', { name: 'Claro' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.goBack();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page).not.toHaveURL(/login\.html/);
  expect(pageErrors).toEqual([]);
});
