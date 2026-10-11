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
  // Começa na hora; o check-in é um cartão opcional dentro da sessão.
  await expect(page.locator('#detalhe-titulo')).toHaveText(/Upper/);
  await expect(page.getByRole('dialog', { name: /Como voc/ })).toHaveCount(0);
  const checkin = page.getByRole('region', { name: 'Como você está hoje?' });
  await expect(checkin).toBeVisible();
  await checkin.getByRole('group', { name: 'Energia' }).getByRole('button', { name: 'Alta' }).click();
  await expect(checkin.getByRole('group', { name: 'Energia' }).getByRole('button', { name: 'Alta' })).toHaveAttribute('aria-pressed', 'true');
  await checkin.getByRole('button', { name: 'Pular' }).click();
  await expect(checkin).toBeHidden();

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

test('excluir rotina não pergunta "tem certeza" e oferece Desfazer', async ({ page }) => {
  await openWorkout(page);
  await page.getByRole('button', { name: 'Excluir Upper' }).click();
  await expect(page.getByRole('dialog', { name: /Excluir rotina/ })).toHaveCount(0);
  const toast = page.getByRole('status').filter({ hasText: 'Rotina excluída: Upper.' });
  await expect(toast).toBeVisible();
  await toast.getByRole('button', { name: 'Desfazer' }).click();
  await expect(page.getByText('Rotina restaurada.')).toBeVisible();
});
