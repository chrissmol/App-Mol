/**
 * firebase-config.js
 * ------------------------------------------------------------------
 * Inicializa o Firebase e exporta Auth e Firestore.
 */

// Importa os SDKs do Firebase
import { initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  browserPopupRedirectResolver,
  GoogleAuthProvider,
  indexedDBLocalPersistence,
  inMemoryPersistence,
  initializeAuth,
} from 'firebase/auth';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import brand from '@brand';

// Config do projeto Firebase da marca (brands/<marca>.json, escolhida por BRAND no build).
// authDomain fica na mesma origem do app: necessário para signInWithRedirect em
// Safari/iOS e navegadores com storage particionado.
const firebaseConfig = brand.firebase;

// Inicializa o app Firebase
export const app = initializeApp(firebaseConfig);

// App Check usa uma Site Key pública. O enforcement permanece desligado no Firebase
// até concluirmos a fase de monitoramento e validarmos todos os fluxos do app.
// A inicialização é adiada (setTimeout 0) para não competir por rede/CPU com as
// primeiras leituras de auth/Firestore no carregamento crítico da página — como
// o enforcement está desligado, nenhuma leitura depende do token estar pronto.
export let appCheck = null;
function initAppCheckDeferred() {
  try {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // Desenvolvimento: só usa App Check com o token de depuração do .env.local
      // (cadastrado no console). Sem ele, segue sem App Check como antes.
      const debugToken = import.meta.env.VITE_APPCHECK_DEBUG_TOKEN;
      if (!debugToken) return null;
      /** @type {any} */ (self).FIREBASE_APPCHECK_DEBUG_TOKEN = debugToken;
    }
    return initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(brand.appCheckSiteKey),
      isTokenAutoRefreshEnabled: true
    });
  } catch (error) {
    console.warn('[Mol] App Check indisponível; seguindo sem token:', error?.message || error);
    return null;
  }
}
if (typeof window !== 'undefined') {
  setTimeout(() => { appCheck = initAppCheckDeferred(); }, 0);
}

// Exporta instâncias prontas para uso em outros arquivos
const browserAuthDependencies = typeof window === 'undefined'
  ? { persistence: inMemoryPersistence }
  : {
      // Persistência compartilhada entre abas. Session storage foi removido
      // porque cria sessões diferentes em cada aba/PWA e aparenta logout.
      persistence: [browserLocalPersistence, indexedDBLocalPersistence],
      popupRedirectResolver: browserPopupRedirectResolver
    };
export const auth = initializeAuth(app, browserAuthDependencies);
export const authReady = Promise.race([
  auth.authStateReady(),
  new Promise(resolve => setTimeout(resolve, 4000))
]).catch(error => {
  console.warn('[Mol] Estado inicial da autenticação não pôde ser restaurado:', error.message);
});
// Firestore persistente em IndexedDB estava no caminho critico do app. Quando o
// cache local ficava corrompido ou bloqueado por outra aba, as telas privadas
// podiam ficar eternamente em carregamento. Mantemos o Firestore online como
// fonte principal e deixamos caches manuais por tela como fallback controlado.
export const offlinePersistenceEnabled = false;
// Firestore so e importado quando alguma tela realmente le/grava dados --
// isso mantem o SDK do Firestore (~130KB) fora do carregamento inicial do
// login, que nunca usa Firestore diretamente.
let dbInstance = null;
export async function getDb() {
  if (!dbInstance) {
    const { getFirestore } = await import('firebase/firestore');
    dbInstance = getFirestore(app);
  }
  return dbInstance;
}
export const googleProvider = new GoogleAuthProvider();
