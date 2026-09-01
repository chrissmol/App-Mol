(function bootstrapMolTheme() {
  'use strict';

  const storageKey = 'mol-accessibility';
  const allowedThemes = new Set(['system', 'dark', 'light']);

  function normalize(value) {
    const source = value && typeof value === 'object' ? value : {};
    return {
      theme: allowedThemes.has(source.theme) ? source.theme : 'system',
      contrast: source.contrast === true,
      largeText: source.largeText === true,
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
    root.dataset.highContrast = preferences.contrast ? 'true' : 'false';
    root.dataset.largeText = preferences.largeText ? 'true' : 'false';
    root.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#f4f7f5' : '#070a08');
    if (document.body) {
      document.body.dataset.theme = theme;
      document.body.dataset.highContrast = root.dataset.highContrast;
    }
    return preferences;
  }

  function reapply() { return apply(read()); }

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
