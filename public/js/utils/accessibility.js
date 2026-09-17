import { watchAuthState } from '../modules/auth.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase-config.js';

const STORAGE_KEY = 'mol-accessibility';
const PROFILE_FIELD = 'preferenciasAcessibilidade';
const languageDefaults = { mode: 'system', value: 'pt-BR' };
const defaults = { theme: 'system', visualStyle: 'classic', contrast: false, largeText: false, reduceMotion: false, language: languageDefaults };

function normalizeLanguage(value = {}) {
  const source = value && typeof value === 'object' ? value : {};
  const mode = ['system', 'pt-BR', 'en-US', 'es-ES'].includes(source.mode) ? source.mode : 'system';
  const language = ['pt-BR', 'en-US', 'es-ES'].includes(source.value) ? source.value : languageDefaults.value;
  return { mode, value: language };
}

export function normalizeAccessibility(value = {}) {
  const legacyTheme = value.theme === '' ? 'dark' : value.theme;
  return {
    theme: ['system', 'dark', 'light'].includes(legacyTheme) ? legacyTheme : defaults.theme,
    visualStyle: ['classic', 'gamer', 'cave'].includes(value.visualStyle) ? value.visualStyle : defaults.visualStyle,
    contrast: value.contrast === true,
    largeText: value.largeText === true,
    reduceMotion: value.reduceMotion === true,
    language: normalizeLanguage(value.language)
  };
}

export function getAccessibilityPreferences() {
  try { return normalizeAccessibility(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')); }
  catch { return { ...defaults }; }
}

export function applyAccessibilityPreferences(value, { cache = true } = {}) {
  const preferences = normalizeAccessibility(value);
  if (cache) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences)); }
    catch (error) { console.warn('Preferências de acessibilidade não armazenadas neste dispositivo:', error.message); }
  }
  if (window.MolTheme) {
    window.MolTheme.apply(preferences);
  } else {
    const resolvedTheme = preferences.theme === 'system'
      ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : preferences.theme;
    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.dataset.visualStyle = preferences.visualStyle;
    document.documentElement.dataset.highContrast = preferences.contrast ? 'true' : 'false';
    document.documentElement.dataset.largeText = preferences.largeText ? 'true' : 'false';
    document.documentElement.dataset.reduceMotion = preferences.reduceMotion ? 'true' : 'false';
    document.documentElement.style.colorScheme = resolvedTheme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', resolvedTheme === 'light' ? '#f4f7f5' : '#070a08');
    document.body.dataset.theme = resolvedTheme;
    document.body.dataset.visualStyle = preferences.visualStyle;
    document.body.dataset.highContrast = document.documentElement.dataset.highContrast;
    document.body.dataset.reduceMotion = document.documentElement.dataset.reduceMotion;
  }
  return preferences;
}

export async function syncAccessibilityForUser(user) {
  if (!user) return applyAccessibilityPreferences(getAccessibilityPreferences());
  const reference = doc(db, 'users', user.uid);
  const snapshot = await getDoc(reference);
  const remote = snapshot.data()?.[PROFILE_FIELD];
  if (remote) return applyAccessibilityPreferences(remote);
  const local = getAccessibilityPreferences();
  await setDoc(reference, { [PROFILE_FIELD]: local }, { merge: true });
  return applyAccessibilityPreferences(local);
}

export async function saveAccessibilityPreferences(value, user = auth.currentUser) {
  const preferences = applyAccessibilityPreferences(value);
  if (user) await setDoc(doc(db, 'users', user.uid), { [PROFILE_FIELD]: preferences }, { merge: true });
  return preferences;
}

export function reapplyStoredAccessibilityPreferences() {
  return applyAccessibilityPreferences(getAccessibilityPreferences(), { cache: false });
}

export function initializeAccessibility() {
  reapplyStoredAccessibilityPreferences();
  if (!window.MolTheme && !window.__molAccessibilityMediaListener) {
    window.__molAccessibilityMediaListener = true;
    matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => {
      const preferences = getAccessibilityPreferences();
      if (preferences.theme === 'system') applyAccessibilityPreferences(preferences, { cache: false });
    });
  }
  if (!window.MolTheme && !window.__molAccessibilityLifecycleListener) {
    window.__molAccessibilityLifecycleListener = true;
    // O Safari restaura páginas pelo BFCache ao voltar com o gesto lateral.
    // Nessa restauração os módulos não executam novamente, então o tema salvo
    // precisa ser reaplicado quando a página volta a ficar visível.
    window.addEventListener('pageshow', reapplyStoredAccessibilityPreferences);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) reapplyStoredAccessibilityPreferences();
    });
    window.addEventListener('storage', event => {
      if (event.key === STORAGE_KEY) reapplyStoredAccessibilityPreferences();
    });
  }
  if (!window.__molAccessibilityAuthListener) {
    window.__molAccessibilityAuthListener = true;
    watchAuthState( user => {
      if (user) syncAccessibilityForUser(user).catch(error => console.warn('Preferências de acessibilidade não sincronizadas:', error.message));
    });
  }
}
