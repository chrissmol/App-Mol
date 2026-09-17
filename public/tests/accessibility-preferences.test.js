import { JSDOM } from 'jsdom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { applyAccessibilityPreferences, normalizeAccessibility } from '../js/utils/accessibility.js';

afterEach(() => vi.unstubAllGlobals());

describe('preferências universais de acessibilidade', () => {
  it('normaliza valores persistidos inválidos', () => {
    expect(normalizeAccessibility({ theme: 'sepia', visualStyle: 'rainbow', contrast: 'true', largeText: 1, reduceMotion: 'yes', language: { mode: 'fr-FR' } })).toEqual({ theme: 'system', visualStyle: 'classic', density: 'comfortable', cardStyle: 'elevated', dashboardLayout: 'automatic', sound: true, vibration: true, animations: true, contrast: false, largeText: false, reduceMotion: false, language: { mode: 'system', value: 'pt-BR' } });
  });

  it('aplica tema, contraste, texto e cor do navegador ao documento inteiro', () => {
    const dom = new JSDOM('<!doctype html><html><head><meta name="theme-color" content="#070a08"></head><body></body></html>', { url: 'http://localhost/' });
    vi.stubGlobal('window', dom.window);
    vi.stubGlobal('document', dom.window.document);
    vi.stubGlobal('localStorage', dom.window.localStorage);
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false, addEventListener: vi.fn() })));
    applyAccessibilityPreferences({ theme: 'light', visualStyle: 'gamer', contrast: true, largeText: true, reduceMotion: true, language: { mode: 'en-US', value: 'en-US' } });
    expect(dom.window.document.documentElement.dataset.theme).toBe('light');
    expect(dom.window.document.documentElement.dataset.visualStyle).toBe('gamer');
    expect(dom.window.document.body.dataset).toMatchObject({ theme: 'light', visualStyle: 'gamer', highContrast: 'true', reduceMotion: 'true' });
    expect(dom.window.document.documentElement.style.colorScheme).toBe('light');
    expect(dom.window.document.documentElement.dataset.largeText).toBe('true');
    expect(dom.window.document.querySelector('meta[name="theme-color"]').content).toBe('#f4f7f5');
    expect(JSON.parse(dom.window.localStorage.getItem('mol-accessibility'))).toEqual({ theme: 'light', visualStyle: 'gamer', density: 'comfortable', cardStyle: 'elevated', dashboardLayout: 'automatic', sound: true, vibration: true, animations: true, contrast: true, largeText: true, reduceMotion: true, language: { mode: 'en-US', value: 'en-US' } });
    dom.window.close();
  });
});
