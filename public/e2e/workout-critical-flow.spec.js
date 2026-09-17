import { expect, test } from '@playwright/test';

async function openWorkout(page) {
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
  await expect(page.getByRole('heading', { name: /Treinos/ })).toBeVisible();
}

test('iniciar treino, concluir serie e voltar cancelando nao gera erro', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  await openWorkout(page);
  await page.getByRole('button', { name: /^Iniciar$/ }).first().click();
  await expect(page.getByRole('dialog', { name: /Como voc/ })).toBeVisible();
  await page.getByRole('button', { name: /Iniciar treino/ }).click();

  await expect(page.locator('#detalhe-titulo')).toHaveText(/Upper/);
  await page.locator('input[id^="kg-"]').first().fill('80');
  await page.locator('input[id^="reps-"]').first().fill('10');
  await page.locator('input[id^="rir-"]').first().fill('2');
  await page.getByRole('button', { name: /Concluir s/ }).first().click();
  await expect(page.locator('#rest-label')).toContainText(/Descanso/i);

  await page.locator('#btn-voltar').click();
  await expect(page.getByRole('dialog', { name: /Encerrar treino/ })).toBeVisible();
  await page.getByRole('button', { name: /^Cancelar$/ }).click();
  await expect(page.locator('#detalhe-titulo')).toHaveText(/Upper/);
  expect(pageErrors).toEqual([]);
});
