(function bootstrapMolTheme() {
  'use strict';

  const storageKey = 'mol-accessibility';
  const allowedThemes = new Set(['system', 'dark', 'light']);
  const allowedVisualStyles = new Set(['classic', 'gamer', 'cave']);

  function bootstrapMolDeviceClasses() {
    const root = document.documentElement;
    const isStandalone = window.navigator.standalone === true || window.matchMedia?.('(display-mode: standalone)').matches;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    root.classList.add('mol-mobile-app');
    root.classList.toggle('mol-standalone', Boolean(isStandalone));
    root.classList.toggle('mol-ios', Boolean(isIOS));
    root.classList.toggle('mol-ios-standalone', Boolean(isIOS && isStandalone));
  }
  function normalizeLanguage(value) {
    const source = value && typeof value === 'object' ? value : {};
    const allowed = new Set(['system', 'pt-BR', 'en-US', 'es-ES']);
    return {
      mode: allowed.has(source.mode) ? source.mode : 'system',
      value: allowed.has(source.value) && source.value !== 'system' ? source.value : 'pt-BR',
    };
  }

  function normalize(value) {
    const source = value && typeof value === 'object' ? value : {};
    return {
      theme: allowedThemes.has(source.theme) ? source.theme : 'system',
      visualStyle: allowedVisualStyles.has(source.visualStyle) ? source.visualStyle : 'classic',
      contrast: source.contrast === true,
      largeText: source.largeText === true,
      reduceMotion: source.reduceMotion === true,
      language: normalizeLanguage(source.language),
    };
  }

  function read() {
    try { return normalize(JSON.parse(localStorage.getItem(storageKey) || '{}')); }
    catch { return normalize(); }
  }

  function resolve(preferences) {
    if (preferences.theme !== 'system') return preferences.theme;
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function apply(value) {
    const preferences = normalize(value);
    const theme = resolve(preferences);
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.dataset.visualStyle = preferences.visualStyle;
    root.dataset.highContrast = preferences.contrast ? 'true' : 'false';
    root.dataset.largeText = preferences.largeText ? 'true' : 'false';
    root.dataset.reduceMotion = preferences.reduceMotion ? 'true' : 'false';
    root.style.colorScheme = theme;
    const language = preferences.language.mode === 'system'
      ? ((navigator.languages && navigator.languages[0]) || navigator.language || preferences.language.value)
      : preferences.language.mode;
    const base = String(language).toLocaleLowerCase('en-US').split('-')[0];
    root.lang = base === 'en' ? 'en-US' : base === 'es' ? 'es-ES' : 'pt-BR';
    root.dataset.language = root.lang;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#f4f7f5' : '#070a08');
    if (document.body) {
      document.body.dataset.theme = theme;
      document.body.dataset.visualStyle = preferences.visualStyle;
      document.body.dataset.highContrast = root.dataset.highContrast;
      document.body.dataset.reduceMotion = root.dataset.reduceMotion;
    }
    return preferences;
  }

  function reapply() { return apply(read()); }

  bootstrapMolDeviceClasses();
  window.MolTheme = Object.freeze({ storageKey, normalize, read, resolve, apply, reapply });
  reapply();
  window.addEventListener('pageshow', reapply);
  window.addEventListener('storage', event => {
    if (event.key === storageKey) reapply();
  });
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => {
    if (read().theme === 'system') reapply();
  });
  document.addEventListener('DOMContentLoaded', reapply, { once: true });
})();
