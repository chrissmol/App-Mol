import { expect, test } from '@playwright/test';

async function openDiet(page) {
  await page.addInitScript(() => {
    localStorage.setItem('__mol_e2e_user', 'true');
    localStorage.setItem('mol-accessibility', JSON.stringify({
      theme: 'dark',
      contrast: false,
      largeText: false,
      reduceMotion: true,
      language: { mode: 'pt-BR', value: 'pt-BR' }
    }));
  });
  await page.goto('/pages/dieta.html');
  await expect(page.getByRole('heading', { name: 'Dieta', exact: true })).toBeVisible();
  await expect(page.locator('#diet-content')).toBeVisible();
  await expect(page.locator('#diet-status')).toBeHidden();
}

test('tocar na refeição abre ela já editável, sem modo separado', async ({ page }) => {
  await openDiet(page);
  await expect(page.getByRole('tab', { name: /Edi/ })).toBeHidden();
  await page.locator('[data-open-meal="meal-breakfast"]').click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('Banana').first()).toBeVisible();
  await expect(dialog.getByRole('button', { name: /Adicionar alimento/i })).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Nome, horário e dias' })).toBeVisible();
  await expect(dialog.getByRole('button', { name: /^Excluir$/i })).toBeVisible();
});

test('link direto da refeicao abre visualizacao focada sem controles de edicao', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('__mol_e2e_user', 'true');
    localStorage.setItem('mol-accessibility', JSON.stringify({
      theme: 'dark',
      contrast: false,
      largeText: false,
      reduceMotion: true,
      language: { mode: 'pt-BR', value: 'pt-BR' }
    }));
  });
  await page.goto('/pages/dieta.html?meal=meal-breakfast&day=1');
  const focused = page.locator('#focused-meal-section');
  await expect(focused).toBeVisible();
  await expect(focused.getByRole('heading', { name: /Caf/ })).toBeVisible();
  await expect(focused.getByText('Banana').first()).toBeVisible();
  await expect(focused.getByRole('button', { name: /Ver plano completo/i })).toBeVisible();
  await expect(focused.getByRole('button', { name: /Adicionar alimento/i })).toHaveCount(0);
  await expect(focused.getByRole('button', { name: /^Editar$/i })).toHaveCount(0);
  await focused.getByRole('button', { name: /Ver plano completo/i }).click();
  await expect(page.locator('#meal-list')).toBeVisible();
});

test('importar plano fica no cabeçalho das refeições', async ({ page }) => {
  await openDiet(page);
  await page.getByRole('button', { name: 'Importar plano' }).click();
  await expect(page.getByRole('dialog', { name: 'Importar plano' })).toBeVisible();
});

test('dieta abre no dia de hoje quando a URL nao informa o dia', async ({ page }) => {
  await openDiet(page);
  const today = String(await page.evaluate(() => new Date().getDay()));
  await expect(page.locator(`#diet-day-selector [data-day="${today}"]`)).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#diet-day-selector [aria-pressed="true"]')).toHaveCount(1);
});
