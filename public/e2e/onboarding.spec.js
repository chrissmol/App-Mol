import { expect, test } from '@playwright/test';

function setup(page, { newUser = false } = {}) {
  return page.addInitScript(({ newUser }) => {
    localStorage.setItem('__mol_e2e_user', 'true');
    localStorage.setItem('mol-accessibility', JSON.stringify({ theme: 'dark', contrast: false, largeText: false, reduceMotion: true, language: { mode: 'pt-BR', value: 'pt-BR' } }));
    // Só na primeira carga: as próximas navegações mantêm o que a tela gravou.
    if (!sessionStorage.getItem('__e2e_ready')) {
      sessionStorage.setItem('__e2e_ready', '1');
      localStorage.removeItem('__mol_e2e_profile');
      if (newUser) localStorage.setItem('__mol_e2e_new_user', '1');
      else localStorage.removeItem('__mol_e2e_new_user');
    }
  }, { newUser });
}

const profile = page => page.evaluate(() => JSON.parse(localStorage.getItem('__mol_e2e_profile') || '{}'));

test('conta nova cai nas boas-vindas e sai com meta calculada e pet escolhido', async ({ page }) => {
  await setup(page, { newUser: true });
  await page.goto('/index.html');
  await expect(page).toHaveURL(/boas-vindas\.html$/);
  await expect(page.getByRole('heading', { name: 'Quem vai te acompanhar?' })).toBeVisible();

  await page.getByText('Marlô', { exact: true }).click();
  await expect(page.getByText('Oi! Eu sou a Marlô.')).toBeVisible();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByText('Emagrecer').click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByText('Feminino').click();
  await page.getByLabel('Data de nascimento').fill('1996-10-11');
  await page.getByLabel('Altura (cm)').fill('165');
  await page.getByLabel('Peso atual (kg)').fill('68');
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByText('Treino 3–4 vezes por semana').click();
  await page.getByRole('button', { name: 'Continuar' }).click();

  await expect(page.getByRole('heading', { name: 'Seu plano inicial' })).toBeVisible();
  await expect(page.getByText(/kcal/).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continuar' })).toBeHidden();
  await expect(page.getByRole('button', { name: /primeiro treino com Marlô/ })).toBeVisible();
  expect(await profile(page)).toMatchObject({ assistentePet: 'marlo', onboardingConcluido: true, objetivo: 'Emagrecimento', sexo: 'feminino', nivelAtividade: 'moderado', metaSemanal: 3 });
  expect((await profile(page)).metaCalorias).toBeGreaterThan(1200);

  await page.getByRole('button', { name: 'Começar a usar o Mol' }).click();
  await expect(page).toHaveURL(/index\.html$/);
});

test('pular as boas-vindas não volta a pedir', async ({ page }) => {
  await setup(page, { newUser: true });
  await page.goto('/pages/boas-vindas.html');
  await page.getByRole('button', { name: 'Pular por agora' }).click();
  await expect(page).toHaveURL(/index\.html$/);
  await page.reload();
  await expect(page).toHaveURL(/index\.html$/);
  expect(await profile(page)).toMatchObject({ onboardingConcluido: true });
});

test('sem treino concluído, o Início mostra primeiros passos no lugar dos cartões vazios', async ({ page }) => {
  await setup(page);
  await page.goto('/index.html');
  const card = page.locator('#first-steps-card');
  await expect(card).toBeVisible();
  await expect(card.getByRole('link', { name: 'Concluir o primeiro treino' })).toBeVisible();
  await expect(page.locator('#last-session-card')).toBeHidden();
  await expect(page.locator('#weight-card')).toBeHidden();
});

test('voltar tem ícone e nome acessível, e a escolha marcada mostra ✓', async ({ page }) => {
  await setup(page, { newUser: true });
  await page.goto('/pages/boas-vindas.html');
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-label', 'Boas-vindas: passo 2 de 5');
  await page.getByText('Emagrecer').click();
  const mark = await page.locator('.onboarding-choice:has(input:checked)').evaluate(el => getComputedStyle(el, '::after').content);
  expect(mark).toContain('✓');
  const back = page.getByRole('button', { name: 'Voltar para o passo anterior' });
  await expect(back.locator('svg')).toBeVisible();
  expect((await back.boundingBox()).height).toBeGreaterThanOrEqual(44);
});
