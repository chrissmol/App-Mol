import { expect, test } from '@playwright/test';

const pages = [
  '/index.html',
  '/pages/treino.html',
  '/pages/dieta.html',
  '/pages/historico.html',
  '/pages/progresso.html',
  '/pages/evolucao.html',
];

test.describe('saude do console', () => {
  for (const path of pages) {
    test(`${path} nao emite erros ou warnings do app`, async ({ page }) => {
      const messages = [];
      page.on('console', message => {
        if (!['error', 'warning'].includes(message.type())) return;
        const text = message.text();
        if (text.includes('NO_COLOR')) return;
        messages.push({ type: message.type(), text });
      });
      page.on('pageerror', error => messages.push({ type: 'pageerror', text: error.message }));
      await page.addInitScript(() => localStorage.setItem('__mol_e2e_user', 'true'));
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      expect(messages).toEqual([]);
    });
  }
});
