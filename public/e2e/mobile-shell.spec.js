import { expect, test } from '@playwright/test';

function isPrivatePage(path) {
  return !path.endsWith('/pages/login.html');
}

async function authenticateWhenPrivate(page, path) {
  if (!isPrivatePage(path)) return;
  await page.addInitScript(() => localStorage.setItem('__mol_e2e_user', 'true'));
}

const pages = [
  '/index.html',
  '/pages/treino.html',
  '/pages/dieta.html',
  '/pages/perfil.html',
  '/pages/historico.html',
  '/pages/progresso.html',
  '/pages/configuracoes.html',
  '/pages/evolucao.html',
  '/pages/dados-pessoais.html',
  '/pages/login.html',
];


test.describe('shell móvel sem backend', () => {
  for (const path of pages) {
    test(`${path} cabe na largura do dispositivo`, async ({ page }) => {
      await authenticateWhenPrivate(page, path);
      const response = await page.goto(path);
      expect(response?.ok()).toBeTruthy();
      const sizes = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        content: document.documentElement.scrollWidth,
      }));
      expect(sizes.content).toBeLessThanOrEqual(sizes.viewport + 1);
    });
  }

  test('tema claro é aplicado antes da primeira pintura', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('mol-accessibility', JSON.stringify({
        theme: 'light',
        contrast: false,
        largeText: false,
      }));
    });
    await authenticateWhenPrivate(page, '/pages/treino.html');
    await page.goto('/pages/treino.html');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(page.locator('body')).toHaveCSS('color', 'rgb(23, 32, 27)');
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(244, 247, 245)');
    await expect(page.locator('.mol-panel').first()).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  });

  test('tema escuro é preservado ao navegar entre páginas', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('mol-accessibility', JSON.stringify({
        theme: 'dark',
        contrast: false,
        largeText: false,
      }));
    });
    await authenticateWhenPrivate(page, '/pages/perfil.html');
    await page.goto('/pages/perfil.html');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.goto('/pages/dieta.html');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('login não cria rolagem vertical sem necessidade', async ({ page }) => {
    await page.goto('/pages/login.html');
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientHeight,
      content: document.documentElement.scrollHeight,
    }));
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport + 1);
  });

  test('barra inferior permanece presa à área visível', async ({ page }) => {
    await authenticateWhenPrivate(page, '/pages/treino.html');
    await page.goto('/pages/treino.html');
    const nav = page.locator('nav.fixed');
    await expect(nav).toBeVisible();
    await expect(nav.locator('.mol-nav-inner')).toBeVisible();
    const box = await nav.boundingBox();
    const viewport = page.viewportSize();
    const metrics = await nav.evaluate(element => ({
      height: element.getBoundingClientRect().height,
      cssHeight: Number.parseFloat(getComputedStyle(element).height),
      safeArea: Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--mol-bottom-nav-safe-area')) || 0,
    }));
    expect(Math.abs((box?.y || 0) + (box?.height || 0) - (viewport?.height || 0))).toBeLessThanOrEqual(1);
    expect(metrics.height).toBeCloseTo(metrics.cssHeight, 1);
    expect(metrics.height).toBeGreaterThanOrEqual(68 + metrics.safeArea);
    expect(metrics.height).toBeLessThanOrEqual(80 + metrics.safeArea);
  });
});
