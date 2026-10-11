import { expect, test } from '@playwright/test';

async function openActiveWorkout(page) {
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
  await page.goto('/pages/treino.html');
  await page.getByRole('button', { name: /^Iniciar$/ }).first().click();
  await expect(page.locator('#detalhe-titulo')).toHaveText(/Upper/);
}

test('altera metodo de serie durante treino em andamento sem erro', async ({ page }) => {
  await openActiveWorkout(page);

  await page.locator('.set-type-badge.is-editable').first().click();
  await expect(page.getByRole('dialog', { name: /Tipo de s/i })).toBeVisible();
  await page.getByRole('button', { name: /Rest-Pause/i }).click();

  await expect(page.getByText(/Nao foi possivel alterar|Não foi possível alterar/i)).toHaveCount(0);
  const methodDialog = page.getByRole('dialog', { name: /Supino reto/i });
  await expect(methodDialog).toBeVisible();
  await expect(methodDialog.getByText(/Rest-Pause/i)).toBeVisible();
  await methodDialog.getByRole('button', { name: 'Fechar', exact: true }).click();
});
