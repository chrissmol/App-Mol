import { JSDOM } from 'jsdom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { applyLanguage, resolveLanguagePreference, t } from '../js/utils/language.js';

function setupDom() {
  const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>', { url: 'http://localhost/' });
  vi.stubGlobal('window', dom.window);
  vi.stubGlobal('document', dom.window.document);
  vi.stubGlobal('localStorage', dom.window.localStorage);
  vi.stubGlobal('CustomEvent', dom.window.CustomEvent);
  return dom;
}

afterEach(() => vi.unstubAllGlobals());

describe('idioma do aplicativo', () => {
  it('resolve automaticamente o idioma principal do aparelho', () => {
    vi.stubGlobal('navigator', { languages: ['es-MX'], language: 'es-MX' });
    expect(resolveLanguagePreference({ mode: 'system', value: 'pt-BR' })).toBe('es-ES');
  });

  it('permite fixar idioma manualmente', () => {
    vi.stubGlobal('navigator', { languages: ['en-US'], language: 'en-US' });
    expect(resolveLanguagePreference({ mode: 'pt-BR', value: 'pt-BR' })).toBe('pt-BR');
  });



  it('traduz textos adicionados dinamicamente ao DOM', async () => {
    const dom = setupDom();
    vi.stubGlobal('navigator', { languages: ['en-US'], language: 'en-US' });
    applyLanguage({ mode: 'system', value: 'pt-BR' });
    const button = dom.window.document.createElement('button');
    button.textContent = 'Continuar com Google';
    button.setAttribute('aria-label', 'Buscar exercício');
    dom.window.document.body.appendChild(button);
    await new Promise(resolve => dom.window.setTimeout(resolve, 60));
    expect(button.textContent).toBe('Continue with Google');
    expect(button.getAttribute('aria-label')).toBe('Search exercise');
    dom.window.close();
  });

  it('aplica lang no html e traduz textos globais marcados', () => {
    const dom = setupDom();
    vi.stubGlobal('navigator', { languages: ['en-US'], language: 'en-US' });
    dom.window.document.body.innerHTML = '<span data-i18n="home">Início</span>';
    applyLanguage({ mode: 'system', value: 'pt-BR' });
    expect(dom.window.document.documentElement.lang).toBe('en-US');
    expect(dom.window.document.querySelector('[data-i18n="home"]').textContent).toBe('Home');
    expect(t('diet', 'Dieta', 'es-ES')).toBe('Dieta');
    dom.window.close();
  });
});
