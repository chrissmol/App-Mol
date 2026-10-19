import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('__mol_e2e_user', 'true');
    localStorage.setItem('mol-accessibility', JSON.stringify({ theme: 'dark', contrast: false, largeText: false, reduceMotion: true, language: { mode: 'pt-BR', value: 'pt-BR' } }));
    if (!sessionStorage.getItem('__e2e_ready')) { sessionStorage.setItem('__e2e_ready', '1'); localStorage.removeItem('__mol_e2e_diary'); }
  });
});

test('diário: marcar refeição, somar água e registrar extra, e continua após recarregar', async ({ page }) => {
  await page.goto('/pages/dieta.html');
  await expect(page.getByRole('heading', { name: 'Consumido hoje' })).toBeVisible();
  await expect(page.locator('#diet-total')).toHaveText('0 kcal');

  const breakfast = page.getByRole('button', { name: 'Comi: Café da manhã' });
  await breakfast.click();
  await expect(breakfast).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#diet-total')).toHaveText('89 kcal');

  await page.getByRole('button', { name: /Somar um copo/ }).click();
  await expect(page.locator('#diet-water')).toContainText('0,25 L');

  await page.getByRole('button', { name: 'Registrar extra' }).click();
  await page.locator('#food-query').fill('banana');
  await page.locator('[data-food-index]').first().click();
  await page.getByRole('button', { name: 'Registrar no diário' }).click();
  await expect(page.locator('#diary-extra')).toContainText('Banana');

  await page.reload();
  await expect(page.getByRole('button', { name: 'Comi: Café da manhã' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#diet-water')).toContainText('0,25 L');

  await page.getByRole('button', { name: 'Comi: Café da manhã' }).click();
  await expect(page.getByRole('button', { name: 'Comi: Café da manhã' })).toHaveAttribute('aria-pressed', 'false');
});

test('outro dia da semana mostra o planejado, sem diário', async ({ page }) => {
  await page.goto('/pages/dieta.html');
  const other = (new Date().getDay() + 1) % 7;
  await page.locator(`[data-day="${other}"]`).click();
  await expect(page.getByRole('heading', { name: 'Planejado neste dia' })).toBeVisible();
  await expect(page.getByRole('button', { name: /^Comi:/ })).toHaveCount(0);
  await expect(page.locator('#diet-water')).toBeEmpty();
});

test('código de barras: sem câmera, digita o código e o formulário vem preenchido pelo rótulo', async ({ page }) => {
  await page.route('https://world.openfoodfacts.org/**', route => route.fulfill({ json: { product: { product_name: 'Granola Mol', brands: 'Marca X', nutriments: { 'energy-kcal_100g': 390, proteins_100g: 9.5, carbohydrates_100g: 66.7, fat_100g: 10 } } } }));
  await page.goto('/pages/dieta.html');
  await page.getByRole('button', { name: 'Registrar extra' }).click();
  await page.getByRole('button', { name: 'Código de barras' }).click();
  const scanner = page.getByRole('dialog', { name: 'Ler código de barras' });
  await expect(scanner).toBeVisible();
  await scanner.getByLabel('Código de barras').fill('123');
  await scanner.getByRole('button', { name: 'Buscar' }).click();
  await expect(scanner.getByText('de 8 a 14 números')).toBeVisible();
  await scanner.getByLabel('Código de barras').fill('7891000100103');
  await scanner.getByRole('button', { name: 'Buscar' }).click();
  await expect(scanner).toBeHidden();
  await expect(page.locator('#food-name')).toHaveValue('Granola Mol · Marca X');
  await expect(page.locator('#food-kcal')).toHaveValue('390');
  await page.locator('#food-grams').fill('40');
  await page.getByRole('button', { name: 'Registrar no diário' }).click();
  await expect(page.locator('#diary-extra')).toContainText('Granola Mol');
});

test('Início mostra o consumido do dia contra a meta', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('__mol_e2e_diary', JSON.stringify({ itens: [{ nome: 'Banana', gramas: 200, kcal100: 89, proteina100: 1, carbo100: 23, gordura100: 0 }], aguaMl: 0 })));
  await page.goto('/index.html');
  await expect(page.locator('#next-meal-today')).toHaveText('Hoje: 178 de 2.400 kcal registradas');
});

test('pet comemora a refeição registrada e o dia de descanso aparece no Início', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('mol-assistant-pet', 'marlo'));
  await page.goto('/pages/dieta.html');
  await page.getByRole('button', { name: 'Comi: Café da manhã' }).click();
  const moment = page.getByRole('status').filter({ hasText: 'Refeição salva' });
  await expect(moment).toBeVisible();
  await expect(moment.locator('img[src*="/assets/pets/marlo/refeicao"]')).toHaveCount(1);

  await page.addInitScript(() => localStorage.setItem('__mol_e2e_routine_days', JSON.stringify([(new Date().getDay() + 1) % 7])));
  await page.goto('/index.html');
  await expect(page.locator('#today-eyebrow')).toHaveText('Dia de descanso');
  await expect(page.locator('#today-badge img[src*="/assets/pets/marlo/descanso"]')).toHaveCount(1);
});

test('busca de alimento mostra produtos do mercado (Open Food Facts) e preenche o formulário', async ({ page }) => {
  await page.route('https://mol-alimentos.chrisouzamol.workers.dev/**', route => route.fulfill({ json: { produtos: [{ codigo: '1', nome: 'Granola Tradicional', marca: 'Marca Y', kcal100: 410, proteina100: 9, carbo100: 70, gordura100: 11 }] }, headers: { 'Access-Control-Allow-Origin': '*' } }));
  await page.goto('/pages/dieta.html');
  await page.getByRole('button', { name: 'Registrar extra' }).click();
  await page.locator('#food-query').fill('granola');
  const online = page.locator('#food-online');
  await expect(online).toContainText('Produtos do mercado');
  await online.getByRole('button', { name: /Granola Tradicional/ }).click();
  await expect(page.locator('#food-name')).toHaveValue('Granola Tradicional · Marca Y');
  await expect(page.locator('#food-kcal')).toHaveValue('410');
});

test('dia de treino destaca a proteína e "Comi tudo" marca o plano inteiro', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('__mol_e2e_sessions', JSON.stringify([['s1', { userId: 'e2e-user', nomeRotina: 'Perna', concluidoEm: new Date().toISOString() }]])));
  await page.goto('/pages/dieta.html');
  await expect(page.locator('#protein-focus')).toContainText('Você treinou Perna hoje. Faltam 180 g de proteína');
  await expect(page.locator('#calorie-left')).toHaveText('2.400');
  await page.getByRole('button', { name: 'Comi tudo do plano hoje' }).click();
  await expect(page.getByRole('button', { name: 'Comi: Café da manhã' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'Comi: R3 - Lanche' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#diet-total')).toHaveText('279 kcal');
  await expect(page.locator('#calorie-left')).toHaveText('2.121');

  await page.getByRole('button', { name: 'Foto do prato' }).click();
  await expect(page.getByRole('dialog', { name: 'Foto do prato' })).toBeVisible();
});
