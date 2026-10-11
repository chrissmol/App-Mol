import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('__mol_e2e_user', 'true');
    localStorage.setItem('mol-accessibility', JSON.stringify({ theme: 'dark', contrast: false, largeText: false, reduceMotion: true, language: { mode: 'pt-BR', value: 'pt-BR' } }));
  });
});

test('Configurações tem um único "voltar", que muda conforme a tela', async ({ page }) => {
  await page.goto('/pages/configuracoes.html');
  const backs = page.locator('.app-page-back:visible');
  await expect(backs).toHaveCount(1);
  await expect(backs).toHaveText('Perfil');

  await page.getByRole('button', { name: /Dispositivo e app/ }).click();
  await expect(backs).toHaveCount(1);
  await expect(backs).toHaveText('Configurações');
  await expect(page).toHaveURL(/#dispositivo$/);

  await backs.click();
  await expect(page.locator('#config-home')).toBeVisible();
  await expect(backs).toHaveText('Perfil');
  await expect(page).toHaveURL(/configuracoes\.html$/);
});

test('fim das telas não guarda espaço vazio em dobro', async ({ page }) => {
  for (const path of ['/pages/perfil.html', '/pages/dieta.html', '/index.html']) {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    const emptyAtEnd = await page.evaluate(() => {
      const main = document.querySelector('main');
      const visible = [...main.querySelectorAll('*')].filter(element => element.offsetParent && element.getBoundingClientRect().height > 0);
      const lastBottom = Math.max(...visible.map(element => element.getBoundingClientRect().bottom + window.scrollY));
      // Tela que cabe sem rolar não tem "sobra" no fim: o resto é só a altura da tela.
      if (document.documentElement.scrollHeight <= window.innerHeight + 1) return 0;
      return document.documentElement.scrollHeight - lastBottom;
    });
    // Reserva do dock (~84 px) e um respiro; antes o Perfil somava 180 px.
    expect(emptyAtEnd, path).toBeLessThanOrEqual(110);
  }
});

test('no celular, o dock some enquanto a pessoa digita', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Só em telas de toque.');
  await page.goto('/pages/assistente.html');
  const dock = page.locator('.mol-app-nav');
  await expect(dock).toBeVisible();
  await page.getByLabel('Mensagem para o assistente').focus();
  await expect(dock).toBeHidden();
  await page.getByLabel('Mensagem para o assistente').blur();
  await expect(dock).toBeVisible();
});
