import { expect, test } from '@playwright/test';

// IA simulada (e2e/firebase-ai-mock.js): respostas fixas conforme a pergunta.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('__mol_e2e_user', 'true');
    localStorage.setItem('mol-accessibility', JSON.stringify({ theme: 'dark', contrast: false, largeText: false, reduceMotion: true, language: { mode: 'pt-BR', value: 'pt-BR' } }));
  });
});

async function ask(page, text) {
  const input = page.getByLabel('Mensagem para o assistente');
  await input.fill(text);
  await input.press('Enter');
  await expect(page.locator('.assistant-typing')).toHaveCount(0);
}

test('conversa, recusa fora do escopo, proposta confirmada e desfeita', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/pages/assistente.html');
  await expect(page.getByRole('heading', { name: 'Assistente', exact: true })).toBeVisible();
  await expect(page.getByText(/passam pelo Gemini/)).toBeVisible();
  await page.getByRole('button', { name: 'Entendi' }).click();
  await expect(page.getByText(/passam pelo Gemini/)).toBeHidden();

  await ask(page, 'Quanto carbo tem no arroz?');
  await expect(page.locator('.assistant-msg--assistant').last()).toContainText('28,1 g de carboidrato');

  await ask(page, 'Me ajuda com python?');
  await expect(page.locator('.assistant-msg--assistant').last()).toHaveText('Só consigo ajudar com treino, exercícios, dieta, refeições, marmitas, peso e o uso do Mol.');

  await ask(page, 'Troca a banana do café por aveia');
  const card = page.locator('.assistant-proposal');
  await expect(card.getByRole('heading', { name: 'Alterar dieta' })).toBeVisible();
  await expect(card.locator('.assistant-proposal__block--before')).toContainText('Banana');
  await expect(card.locator('.assistant-proposal__block--after')).toContainText('Aveia em flocos');
  await card.getByRole('button', { name: 'Confirmar' }).click();
  await expect(card).toContainText('Salvo.');
  await card.getByRole('button', { name: 'Desfazer' }).click();
  await expect(card).toContainText('Desfeito');
  expect(errors).toEqual([]);
});

test('descartar proposta não altera nada e sugestões enviam a pergunta', async ({ page }) => {
  await page.goto('/pages/assistente.html');
  await page.getByRole('button', { name: 'Registra meu peso de hoje' }).click();
  const card = page.locator('.assistant-proposal');
  await expect(card.getByRole('heading', { name: 'Registrar peso' })).toBeVisible();
  await expect(card).toContainText('80,5 kg hoje');
  await card.getByRole('button', { name: 'Descartar' }).click();
  await expect(card).toContainText('Descartada. Nada foi alterado.');
});

test('anexa planilha CSV e recebe proposta de dieta', async ({ page }) => {
  await page.goto('/pages/assistente.html');
  await page.locator('[data-file]').setInputFiles({ name: 'dieta.csv', mimeType: 'text/csv', buffer: Buffer.from('Refeição;Alimento;g\nCafé;Aveia;40') });
  await expect(page.locator('.assistant-attachment')).toContainText('dieta.csv');
  await page.getByRole('button', { name: 'Enviar' }).click();
  await expect(page.locator('.assistant-msg--user').last()).toContainText('dieta.csv');
  await expect(page.locator('.assistant-proposal').getByRole('heading', { name: 'Alterar dieta' })).toBeVisible();
});

test('atalhos da Dieta e do Treino abrem a gaveta do assistente', async ({ page }) => {
  await page.goto('/pages/dieta.html');
  await page.getByRole('button', { name: 'Ajustar dieta com o assistente' }).click();
  const sheet = page.getByRole('dialog', { name: 'Assistente da dieta' });
  await expect(sheet).toBeVisible();
  await expect(sheet.getByText('importar sua dieta')).toBeVisible();
  await expect(sheet.getByLabel('Mensagem para o assistente')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(sheet).toBeHidden();

  await page.goto('/pages/treino.html');
  await page.getByRole('button', { name: 'Montar ou ajustar treino com o assistente' }).click();
  await expect(page.getByRole('dialog', { name: 'Assistente do treino' })).toBeVisible();
  await page.getByRole('button', { name: 'Fechar assistente' }).click();
  await expect(page.getByRole('dialog', { name: 'Assistente do treino' })).toBeHidden();
});
