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
    // Espera ativa (até 2 s) em vez de 60 ms fixos: no CI carregado o observador às vezes demorava mais.
    await vi.waitFor(() => {
      expect(button.textContent).toBe('Continue with Google');
      expect(button.getAttribute('aria-label')).toBe('Search exercise');
    }, { timeout: 2000, interval: 20 });
    dom.window.close();
  });

  it('traduz textos novos e frases com números, em inglês e espanhol', async () => {
    const dom = setupDom();
    vi.stubGlobal('navigator', { languages: ['en-US'], language: 'en-US' });
    dom.window.document.body.innerHTML = '<p id="a">Passo 2 de 5</p><p id="b">Hoje: 178 de 2.400 kcal registradas</p><p id="c">Consumido hoje</p><p id="d">Para calcular sua meta, preencha: sexo, peso atual.</p>';
    applyLanguage({ mode: 'system', value: 'pt-BR' });
    const text = id => dom.window.document.getElementById(id).textContent;
    expect(text('a')).toBe('Step 2 of 5');
    expect(text('b')).toBe('Today: 178 of 2.400 kcal logged');
    expect(text('c')).toBe('Eaten today');
    expect(text('d')).toBe('To calculate your goal, fill in: sex, current weight.');
    applyLanguage({ mode: 'es-ES', value: 'es-ES' });
    expect(text('a')).toBe('Paso 2 de 5');
    expect(text('c')).toBe('Consumido hoy');
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

describe('cobertura das telas em inglês e espanhol', () => {
  it('traduz todo texto fixo das páginas HTML', async () => {
    const { readFileSync, readdirSync } = await import('node:fs');
    const root = new URL('../', import.meta.url);
    const files = ['index.html', ...readdirSync(new URL('pages/', root)).map(name => `pages/${name}`)];
    // Marcas, unidades e números iguais em qualquer idioma não precisam de tradução.
    const sameEverywhere = /^(.|Mol|kg|cm|kcal|0 kcal|kg volume|Volume|\+30 s|Meta: [\d.]+ kcal)$/;
    const missing = {};
    for (const code of ['en-US', 'es-ES']) {
      vi.stubGlobal('navigator', { languages: [code], language: code });
      for (const file of files) {
        const dom = new JSDOM(readFileSync(new URL(file, root), 'utf8'), { url: 'http://localhost/' });
        vi.stubGlobal('window', dom.window);
        vi.stubGlobal('document', dom.window.document);
        vi.stubGlobal('localStorage', dom.window.localStorage);
        vi.stubGlobal('CustomEvent', dom.window.CustomEvent);
        const originals = new Map();
        const walker = dom.window.document.createTreeWalker(dom.window.document.body, 4);
        while (walker.nextNode()) {
          const node = walker.currentNode;
          const clean = node.nodeValue.replace(/\s+/g, ' ').trim();
          if (!clean || ['SCRIPT', 'STYLE', 'OPTION'].includes(node.parentElement.tagName) || !/[A-Za-zÀ-ÿ]/.test(clean) || sameEverywhere.test(clean)) continue;
          originals.set(node, clean);
        }
        applyLanguage({ mode: 'system', value: 'pt-BR' });
        for (const [node, clean] of originals) {
          // Palavra igual nos dois idiomas (ex.: "Perfil", "Meta") conta se existir no dicionário.
          if (node.nodeValue.replace(/\s+/g, ' ').trim() === clean && t(clean, null, code) === null) (missing[`${code} ${file}`] ||= []).push(clean);
        }
        dom.window.close();
      }
      vi.unstubAllGlobals();
    }
    expect(missing).toEqual({});
  });
});
