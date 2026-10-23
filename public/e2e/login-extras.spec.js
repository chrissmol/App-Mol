import { expect, test } from '@playwright/test';

test('login: mostrar senha e lembrar o último e-mail', async ({ page }) => {
  await page.goto('/pages/login.html');
  const password = page.locator('#authPassword');
  await page.locator('#authEmail').fill('ana@exemplo.com');
  await page.locator('#authEmail').blur();
  await password.fill('segredo1');
  await expect(password).toHaveAttribute('type', 'password');
  await page.getByRole('button', { name: 'Mostrar senha' }).click();
  await expect(password).toHaveAttribute('type', 'text');
  await expect(page.getByRole('button', { name: 'Ocultar senha' })).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(page.locator('#authEmail')).toHaveValue('ana@exemplo.com');
  await expect(page.locator('#authPassword')).toHaveValue('');
});

test('login: link por e-mail pede o e-mail e confirma o envio', async ({ page }) => {
  await page.goto('/pages/login.html');
  await page.locator('#consentCheck').check();
  await page.locator('#emailLinkBtn').click();
  await expect(page.locator('#loginError')).toContainText('Digite seu e-mail');
  await page.locator('#authEmail').fill('ana@exemplo.com');
  await page.locator('#emailLinkBtn').click();
  await expect(page.locator('#loginError')).toContainText('Enviamos um link de acesso');
});
