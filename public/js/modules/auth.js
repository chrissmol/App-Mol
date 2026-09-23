/**
 * auth.js
 * ------------------------------------------------------------------
 * Módulo responsável por TODA a lógica de autenticação do Mol.
 * Nenhuma página deve chamar o Firebase Auth diretamente — sempre
 * passe por estas funções. Isso mantém o app fácil de manter e
 * testar (Single Responsibility Principle).
 * ------------------------------------------------------------------
 */

import {
  createUserWithEmailAndPassword,
  getRedirectResult,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth, authReady, getDb, googleProvider } from "../config/firebase-config.js";
import { subscribeAfterAuthReady } from '../utils/auth-state.js';

const AUTH_THROTTLE_KEY = 'mol-auth-throttle-v1';
const AUTH_THROTTLE_WINDOW_MS = 10 * 60 * 1000;
const AUTH_THROTTLE_LOCK_MS = 2 * 60 * 1000;
const AUTH_THROTTLE_MAX_ATTEMPTS = 5;

function readAuthThrottle() {
  try { return JSON.parse(window.localStorage.getItem(AUTH_THROTTLE_KEY) || '{}'); }
  catch { return {}; }
}

function writeAuthThrottle(state) {
  try { window.localStorage.setItem(AUTH_THROTTLE_KEY, JSON.stringify(state)); }
  catch { /* localStorage pode estar indisponível em modo privado/restrito. */ }
}

function clearAuthThrottle() {
  try { window.localStorage.removeItem(AUTH_THROTTLE_KEY); }
  catch { /* noop */ }
}

function authThrottleError(lockedUntil) {
  const seconds = Math.max(1, Math.ceil((lockedUntil - Date.now()) / 1000));
  return Object.assign(new Error('Muitas tentativas de login em sequência.'), {
    code: 'auth/client-rate-limited',
    retryAfterSeconds: seconds,
  });
}

function assertAuthAttemptAllowed() {
  const now = Date.now();
  const state = readAuthThrottle();
  if (Number(state.lockedUntil || 0) > now) throw authThrottleError(Number(state.lockedUntil));
}

function recordAuthAttemptFailure(error) {
  if (['auth/popup-closed-by-user', 'auth/cancelled-popup-request', 'auth/popup-blocked'].includes(error?.code)) return;
  const now = Date.now();
  const state = readAuthThrottle();
  const firstAttemptAt = Number(state.firstAttemptAt || now);
  const withinWindow = now - firstAttemptAt <= AUTH_THROTTLE_WINDOW_MS;
  const attempts = withinWindow ? Number(state.attempts || 0) + 1 : 1;
  const nextState = { firstAttemptAt: withinWindow ? firstAttemptAt : now, attempts };
  if (attempts >= AUTH_THROTTLE_MAX_ATTEMPTS) nextState.lockedUntil = now + AUTH_THROTTLE_LOCK_MS;
  writeAuthThrottle(nextState);
}

/**
 * Abre o popup de login do Google e autentica o usuário.
 * Se for o primeiro acesso, cria o documento do usuário no Firestore
 * (coleção "users") com dados iniciais de perfil.
 *
 * @returns {Promise<import("firebase/auth").User>}
 */
export async function loginWithGoogle() {
  assertAuthAttemptAllowed();
  try {
    await authReady;
    const result = await signInWithPopup(auth, googleProvider);
    clearAuthThrottle();
    return result.user;
  } catch (error) {
    recordAuthAttemptFailure(error);
    throw error;
  }
}

/** Entra com e-mail/senha em uma conta já existente. */
export async function loginWithEmail(email, password) {
  assertAuthAttemptAllowed();
  try {
    await authReady;
    const result = await signInWithEmailAndPassword(auth, email, password);
    clearAuthThrottle();
    return result.user;
  } catch (error) {
    recordAuthAttemptFailure(error);
    throw error;
  }
}

/** Cria uma conta nova com e-mail/senha. */
export async function registerWithEmail(email, password, name) {
  assertAuthAttemptAllowed();
  try {
    await authReady;
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (name) await updateProfile(result.user, { displayName: name });
    clearAuthThrottle();
    return result.user;
  } catch (error) {
    recordAuthAttemptFailure(error);
    throw error;
  }
}

/** Envia e-mail de redefinição de senha. */
export function resetPassword(email) {
  return authReady.then(() => sendPasswordResetEmail(auth, email));
}

/** Usa navegação completa quando o navegador bloqueia popups. */
export function loginWithGoogleRedirect() {
  assertAuthAttemptAllowed();
  return authReady.then(() => signInWithRedirect(auth, googleProvider));
}

/** Finaliza o retorno do login por redirecionamento, quando existir. */
export async function getGoogleRedirectUser() {
  assertAuthAttemptAllowed();
  try {
    await authReady;
    const result = await getRedirectResult(auth);
    if (!result?.user) return null;
    clearAuthThrottle();
    return result.user;
  } catch (error) {
    // Uma tentativa antiga por popup pode ficar registrada no navegador. Isso
    // não é falha do fluxo atual por redirecionamento e não deve bloquear login.
    if (error?.code === 'auth/popup-closed-by-user' || error?.code === 'auth/cancelled-popup-request') return null;
    recordAuthAttemptFailure(error);
    throw error;
  }
}

/** Cria somente os dados ausentes do perfil; uma falha aqui não desfaz o login. */
export async function ensureUserProfile(user) {
  if (!user) return null;

  const { doc, getDoc, setDoc, serverTimestamp } = await import('firebase/firestore');
  const userRef = doc(await getDb(), "users", user.uid);
  const userSnap = await getDoc(userRef);

  // Só cria o perfil se ainda não existir (evita sobrescrever dados)
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      name: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      createdAt: serverTimestamp(),
      // Valores padrão do app — ajustáveis depois na tela de Perfil
      dailyCalorieGoal: 2400,
      metaCalorias: 2400,
      macroGoals: { protein: 180, carbs: 250, fat: 70 },
      metaSemanal: 3,
    });
  }

  return user;
}

/** Desconecta o usuário atual. */
export function logout() {
  return signOut(auth);
}

/**
 * Observa mudanças no estado de autenticação (login/logout).
 * Use isso no topo de cada página protegida para redirecionar
 * usuários não autenticados de volta para o login.
 *
 * @param {(user: import("firebase/auth").User | null) => void} callback
 */
export function watchAuthState(callback) {
  return subscribeAfterAuthReady(authReady, listener => onAuthStateChanged(auth, listener), callback);
}

/**
 * Guard único para páginas privadas. Impede redirecionamentos repetidos e
 * mantém o caminho atual para uma futura retomada após o login.
 */
export function watchProtectedPage(callback, redirectTo) {
  let redirecting = false;
  const loginPath = redirectTo || (location.pathname.includes('/pages/') ? './login.html' : './pages/login.html');
  return watchAuthState(user => {
    if (user) {
      redirecting = false;
      callback(user);
      return;
    }
    if (redirecting) return;
    redirecting = true;
    try { sessionStorage.setItem('mol-return-to', location.pathname + location.search); }
    catch { /* armazenamento de sessão pode estar indisponível */ }
    location.replace(loginPath);
  });
}

/**
 * Helper de "route guard": redireciona para login.html se não
 * houver usuário autenticado. Use no topo de páginas protegidas:
 *
 *   import { requireAuth } from "../js/modules/auth.js";
 *   requireAuth();
 */
export function requireAuth(redirectTo = "../pages/login.html") {
  return watchProtectedPage(() => {}, redirectTo);
}
