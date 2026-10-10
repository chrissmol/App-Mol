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
}

test('visualizacao da dieta nao expoe controles de edicao da refeicao', async ({ page }) => {
  await openDiet(page);
  await page.getByRole('button', { name: /Caf/ }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('Banana').first()).toBeVisible();
  await expect(dialog.getByRole('button', { name: /Adicionar alimento/i })).toHaveCount(0);
  await expect(dialog.getByRole('button', { name: /^Editar$/i })).toHaveCount(0);
  await expect(dialog.getByRole('button', { name: /^Excluir$/i })).toHaveCount(0);
  await expect(dialog.getByRole('button', { name: /Remover/i })).toHaveCount(0);
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

test('edicao da dieta concentra os controles de alterar refeicao', async ({ page }) => {
  await openDiet(page);
  await page.getByRole('tab', { name: /Edi/ }).click();
  await page.getByRole('button', { name: /Visualizar/ }).first().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('button', { name: /Adicionar alimento/i })).toBeVisible();
  await expect(dialog.getByRole('button', { name: /^Editar$/i })).toBeVisible();
  await expect(dialog.getByRole('button', { name: /^Excluir$/i })).toBeVisible();
});

test('dieta abre no dia de hoje quando a URL nao informa o dia', async ({ page }) => {
  await openDiet(page);
  const today = String(await page.evaluate(() => new Date().getDay()));
  await expect(page.locator(`#diet-day-selector [data-day="${today}"]`)).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#diet-day-selector [aria-pressed="true"]')).toHaveCount(1);
});
