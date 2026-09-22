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
import { getFirestore } from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';

// SUAS CHAVES REAIS DO PROJETO "APP MOL"
const firebaseConfig = {
  apiKey: "AIzaSyAZqEpfSjqpnZiWG7qw0uolu5d5DgQMoJ4",
  // Mantém o helper OAuth na mesma origem do app. Isso é necessário para
  // signInWithRedirect em Safari/iOS e navegadores com storage particionado.
  authDomain: "app-mol-5f3dc.web.app",
  projectId: "app-mol-5f3dc",
  storageBucket: "app-mol-5f3dc.firebasestorage.app",
  messagingSenderId: "906902254628",
  appId: "1:906902254628:web:33dde790cc6da9a3ee54b1"
};

// Inicializa o app Firebase
const app = initializeApp(firebaseConfig);

// App Check usa uma Site Key pública. O enforcement permanece desligado no Firebase
// até concluirmos a fase de monitoramento e validarmos todos os fluxos do app.
// A inicialização é adiada (setTimeout 0) para não competir por rede/CPU com as
// primeiras leituras de auth/Firestore no carregamento crítico da página — como
// o enforcement está desligado, nenhuma leitura depende do token estar pronto.
export let appCheck = null;
function initAppCheckDeferred() {
  try {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') return null;
    return initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider('6LeHhMAtAAAAAKY5kHpN5K79KWr_oXElJ2lYgndW'),
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
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
