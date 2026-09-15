import { expect, test } from '@playwright/test';

test('inicio destaca uma prioridade sem duplicar o card equivalente', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('__mol_e2e_user', 'true'));
  await page.goto('/index.html');

  await expect(page.locator('#daily-brief-card')).toBeVisible();
  await expect(page.locator('#daily-brief-title')).toContainText(/Upper|rotina/i);
  await expect(page.locator('#daily-brief-action')).toBeVisible();
  await expect(page.locator('#dashboard-card-grid')).toBeVisible();

  await expect(page.locator('#today-card')).toHaveClass(/hidden/);
  await expect(page.locator('#weekly-card')).toBeVisible();
});
