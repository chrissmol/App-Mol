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
  await page.getByRole('button', { name: 'Iniciar treino' }).first().click();
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
  await page.getByRole('button', { name: 'Mais opções de Upper' }).click();
  await expect(page.getByRole('menuitem', { name: 'Editar' })).toBeFocused();
  await page.getByRole('menuitem', { name: 'Excluir Upper' }).click();
  await expect(page.getByRole('dialog', { name: /Excluir rotina/ })).toHaveCount(0);
  const toast = page.getByRole('status').filter({ hasText: 'Rotina excluída: Upper.' });
  await expect(toast).toBeVisible();
  await toast.getByRole('button', { name: 'Desfazer' }).click();
  await expect(page.getByText('Rotina restaurada.')).toBeVisible();
});

test('treino em andamento: barra nas outras telas volta direto para a sessão', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('__mol_e2e_user', 'true');
    const now = new Date();
    localStorage.setItem('mol-workout-draft-e2e-user', JSON.stringify({ versao: 2, rotinaId: 'routine-upper', nomeRotina: 'Upper', exercicios: [{ nome: 'Supino reto', grupo: 'Peito', repsMin: 8, repsMax: 12, series: [{ tipo: 'N', kg: '', reps: '', rir: '2', concluida: false }] }], tempoSegundos: 60, atualizadoEm: now.toISOString(), iniciadaEm: new Date(now.getTime() - 65000).toISOString() }));
  });
  await page.goto('/pages/dieta.html');
  const bar = page.getByRole('link', { name: /Treino em andamento/ });
  await expect(bar).toBeVisible();
  await expect(bar).toContainText('Upper');
  await bar.click();
  await expect(page.locator('#detalhe-titulo')).toHaveText(/Upper/);
  await expect(page.getByRole('dialog', { name: /Retomar treino/ })).toHaveCount(0);
});

test('treino em tela cheia no celular: sem dock, e minimizar não encerra a sessão', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'O dock só sai em telas de toque.');
  await openWorkout(page);
  await page.getByRole('button', { name: /^Iniciar/ }).first().click();
  await expect(page.locator('#detalhe-titulo')).toHaveText(/Upper/);
  await expect(page.locator('.mol-app-nav')).toBeHidden();
  await page.getByRole('button', { name: 'Minimizar treino' }).click();
  await expect(page).toHaveURL(/index\.html$/);
  await expect(page.getByText('Treino em andamento').first()).toBeVisible();
});
