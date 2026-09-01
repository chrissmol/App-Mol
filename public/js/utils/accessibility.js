import { watchAuthState } from '../modules/auth.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase-config.js';

const STORAGE_KEY = 'mol-accessibility';
const PROFILE_FIELD = 'preferenciasAcessibilidade';
const defaults = { theme: 'system', contrast: false, largeText: false };

export function normalizeAccessibility(value = {}) {
  const legacyTheme = value.theme === '' ? 'dark' : value.theme;
  return {
    theme: ['system', 'dark', 'light'].includes(legacyTheme) ? legacyTheme : defaults.theme,
    contrast: value.contrast === true,
    largeText: value.largeText === true
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
  const resolvedTheme = preferences.theme === 'system'
    ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : preferences.theme;
  const themeValue = resolvedTheme === 'light' ? 'light' : 'dark';
  document.documentElement.dataset.theme = themeValue;
  document.body.dataset.theme = themeValue;
  document.documentElement.style.colorScheme = themeValue;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', resolvedTheme === 'light' ? '#f4f7f5' : '#070a08');
  document.body.dataset.highContrast = preferences.contrast ? 'true' : '';
  document.documentElement.dataset.largeText = preferences.largeText ? 'true' : '';
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

function reapplyStoredAccessibilityPreferences() {
  return applyAccessibilityPreferences(getAccessibilityPreferences(), { cache: false });
}

export function initializeAccessibility() {
  reapplyStoredAccessibilityPreferences();
  if (!window.__molAccessibilityMediaListener) {
    window.__molAccessibilityMediaListener = true;
    matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => {
      const preferences = getAccessibilityPreferences();
      if (preferences.theme === 'system') applyAccessibilityPreferences(preferences, { cache: false });
    });
  }
  if (!window.__molAccessibilityLifecycleListener) {
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
