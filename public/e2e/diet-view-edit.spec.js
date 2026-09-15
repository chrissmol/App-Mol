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
  await expect(page.getByRole('heading', { name: 'Dieta' })).toBeVisible();
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

test('edicao da dieta concentra os controles de alterar refeicao', async ({ page }) => {
  await openDiet(page);
  await page.getByRole('tab', { name: /Edi/ }).click();
  await page.getByRole('button', { name: /Visualizar/ }).first().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('button', { name: /Adicionar alimento/i })).toBeVisible();
  await expect(dialog.getByRole('button', { name: /^Editar$/i })).toBeVisible();
  await expect(dialog.getByRole('button', { name: /^Excluir$/i })).toBeVisible();
});
