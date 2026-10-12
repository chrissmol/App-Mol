import { expect, test } from '@playwright/test';

test('inicio destaca uma prioridade sem duplicar o card equivalente', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('__mol_e2e_user', 'true'));
  await page.goto('/index.html');

  await expect(page.locator('#daily-brief-card')).toBeVisible();
  await expect(page.locator('#daily-brief-title')).toContainText(/Upper|rotina/i);
  await expect(page.locator('#daily-brief-action')).toBeVisible();
  await expect(page.locator('#dashboard-card-grid')).toBeVisible();

  await expect(page.locator('#today-card')).toHaveClass(/hidden/);
  // Sem treino concluído, a semana vazia dá lugar aos primeiros passos.
  await expect(page.locator('#first-steps-card')).toBeVisible();
  await expect(page.locator('#weekly-card')).toBeHidden();
});

test('resumo semanal com o pet na segunda-feira', async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 9, 12, 10));
  await page.addInitScript(() => {
    localStorage.setItem('__mol_e2e_user', 'true');
    localStorage.setItem('mol-assistant-pet', 'marlo');
    localStorage.setItem('mol-accessibility', JSON.stringify({ language: { mode: 'pt-BR', value: 'pt-BR' } }));
    const at = day => new Date(2026, 9, day, 18).toISOString();
    localStorage.setItem('__mol_e2e_sessions', JSON.stringify([['s1', { userId: 'e2e-user', concluidoEm: at(7), volumeTotal: 1200 }], ['s2', { userId: 'e2e-user', concluidoEm: at(9), volumeTotal: 1300 }], ['s3', { userId: 'e2e-user', concluidoEm: at(11), volumeTotal: 1500 }]]));
  });
  await page.goto('/index.html');
  const card = page.locator('#weekly-review-card');
  await expect(card).toBeVisible();
  await expect(card).toContainText('Você manteve a rotina nesta semana.');
  await expect(card).toContainText('3/3');
  await expect(card).toContainText('4.000 kg');
  await expect(card.locator('img[src*="/assets/pets/marlo/conquista"]')).toHaveCount(1);
});
