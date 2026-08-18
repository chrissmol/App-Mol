/**
 * firebase-config.js
 * ------------------------------------------------------------------
 * Inicializa o Firebase e exporta Auth e Firestore.
 */

// Importa os SDKs do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// SUAS CHAVES REAIS DO PROJETO "APP MOL"
const firebaseConfig = {
  apiKey: "AIzaSyAZqEpfSjqpnZiWG7qw0uolu5d5DgQMoJ4",
  authDomain: "app-mol-5f3dc.firebaseapp.com",
  projectId: "app-mol-5f3dc",
  storageBucket: "app-mol-5f3dc.firebasestorage.app",
  messagingSenderId: "906902254628",
  appId: "1:906902254628:web:33dde790cc6da9a3ee54b1"
};

// Inicializa o app Firebase
const app = initializeApp(firebaseConfig);

// Exporta instâncias prontas para uso em outros arquivos
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();