import { expect, test } from '@playwright/test';

async function navigateMain(page, targetPage) {
  const sidebarItem = page.locator(`.mol-sidebar__item[data-sidebar-page="${targetPage}"]`);
  if (await sidebarItem.isVisible()) {
    await sidebarItem.click();
    return;
  }

  const dock = page.locator('.mol-app-nav');
  await expect(dock.locator('.mol-dock__trigger')).toBeVisible();
  await dock.locator('.mol-dock__trigger').click();
  await expect(dock.locator('.mol-dock__menu')).toBeVisible();
  await dock.locator(`.mol-dock__item[data-page="${targetPage}"]`).click();
}

test('login, navegação privada, dieta e tema permanecem estáveis', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  await page.goto('/pages/login.html');
  await page.locator('#consentCheck').check();
  await page.locator('#googleLoginBtn').click();
  await page.waitForURL('**/index.html');
  await expect(page.locator('#user-name')).toHaveText('Christian');

  await navigateMain(page, 'treino.html');
  await page.waitForURL('**/pages/treino.html');
  await expect(page.getByRole('heading', { name: /^(Treino|Training|Entreno)$/ })).toBeVisible();
  await expect(page).not.toHaveURL(/login\.html/);

  await navigateMain(page, 'dieta.html');
  await page.waitForURL('**/pages/dieta.html');
  await expect(page.getByRole('heading', { name: /Dieta|Diet/ })).toBeVisible();
  await expect(page.locator('#diet-content')).toBeVisible();

  await page.goto('/pages/configuracoes.html#aparencia');
  await page.getByRole('button', { name: /Claro|Light/ }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.goBack();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page).not.toHaveURL(/login\.html/);
  expect(pageErrors).toEqual([]);
});
