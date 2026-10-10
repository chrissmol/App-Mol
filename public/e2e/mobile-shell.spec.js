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
  '/pages/marmitas.html',
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

  test('dock móvel fica acima da área segura e abre a navegação', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'desktop', 'Dock móvel não é exibido no desktop.');
    await authenticateWhenPrivate(page, '/pages/treino.html');
    await page.goto('/pages/treino.html');
    const nav = page.locator('.mol-app-nav');
    await expect(nav).toBeVisible();
    const trigger = nav.locator('.mol-dock__trigger');
    await expect(trigger).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(nav.locator('.mol-dock__menu')).toBeVisible();
    await expect(nav.locator('.mol-dock__item')).toHaveCount(6);
    const box = await trigger.boundingBox();
    const viewport = page.viewportSize();
    expect((viewport?.height || 0) - ((box?.y || 0) + (box?.height || 0))).toBeGreaterThanOrEqual(12);
  });

  test('dock móvel no iOS instalado não depende do rodapé da viewport', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'iphone', 'Validação de PWA iOS roda no projeto iPhone.');
    await page.addInitScript(() => {
      localStorage.setItem('__mol_e2e_user', 'true');
      Object.defineProperty(navigator, 'standalone', { configurable: true, get: () => true });
      Object.defineProperty(navigator, 'platform', { configurable: true, get: () => 'MacIntel' });
      Object.defineProperty(navigator, 'maxTouchPoints', { configurable: true, get: () => 5 });
      window.matchMedia = query => ({
        matches: query.includes('display-mode: standalone'),
        media: query,
        onchange: null,
        addListener() {},
        removeListener() {},
        addEventListener() {},
        removeEventListener() {},
        dispatchEvent: () => false,
      });
    });
    await page.goto('/pages/treino.html');
    await expect(page.locator('html')).toHaveClass(/mol-ios-standalone/);
    const nav = page.locator('.mol-app-nav');
    await expect(nav).toBeVisible();
    const metrics = await nav.locator('.mol-dock__trigger').evaluate(element => {
      const rect = element.getBoundingClientRect();
      return {
        bottomGap: Math.round(window.innerHeight - rect.bottom),
        height: Math.round(rect.height),
        opacity: getComputedStyle(element).opacity,
      };
    });
    expect(metrics.bottomGap).toBeGreaterThanOrEqual(12);
    expect(metrics.height).toBeGreaterThanOrEqual(60);
    expect(metrics.opacity).toBe('1');
  });

  test('desktop usa sidebar e não exibe dock móvel', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Validação desktop roda apenas no projeto desktop.');
    await authenticateWhenPrivate(page, '/pages/treino.html');
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/pages/treino.html');
    await expect(page.locator('.mol-sidebar')).toBeVisible();
    await expect(page.locator('.mol-app-nav')).toBeHidden();
  });
});
