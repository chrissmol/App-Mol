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
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { isTrustedDevice } from '../utils/offline.js';

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
export const offlinePersistenceEnabled = isTrustedDevice();
export const db = offlinePersistenceEnabled
  ? initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) })
  : getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
