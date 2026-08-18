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
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { auth, db, googleProvider } from "../config/firebase-config.js";

/**
 * Abre o popup de login do Google e autentica o usuário.
 * Se for o primeiro acesso, cria o documento do usuário no Firestore
 * (coleção "users") com dados iniciais de perfil.
 *
 * @returns {Promise<import("firebase/auth").User>}
 */
export async function loginWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  const userRef = doc(db, "users", user.uid);
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
      macroGoals: { protein: 180, carbs: 250, fat: 70 },
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
  onAuthStateChanged(auth, callback);
}

/**
 * Helper de "route guard": redireciona para login.html se não
 * houver usuário autenticado. Use no topo de páginas protegidas:
 *
 *   import { requireAuth } from "../js/modules/auth.js";
 *   requireAuth();
 */
export function requireAuth(redirectTo = "../pages/login.html") {
  watchAuthState((user) => {
    if (!user) window.location.href = redirectTo;
  });
}
