/**
 * login.js
 * ------------------------------------------------------------------
 * Controller da tela de Login. Responsabilidade única: ligar os
 * elementos do DOM de login.html às funções do módulo de auth.
 * Nenhuma regra de negócio deve viver aqui — apenas orquestração
 * de UI.
 * ------------------------------------------------------------------
 */

import { loginWithGoogle, watchAuthState } from "../modules/auth.js";
import { showToast, setButtonLoading } from "../utils/ui.js";

// Renderiza os ícones Lucide desta página
lucide.createIcons();

const googleBtn = document.getElementById("googleLoginBtn");
const errorEl = document.getElementById("loginError");
const ORIGINAL_BTN_HTML = googleBtn.innerHTML;

// Se o usuário já estiver logado, pula direto para o Dashboard
watchAuthState((user) => {
  if (user) {
    window.location.href = "../index.html";
  }
});

googleBtn.addEventListener("click", async () => {
  errorEl.classList.add("hidden");
  setButtonLoading(googleBtn, true, ORIGINAL_BTN_HTML);

  try {
    await loginWithGoogle();
    showToast("Login realizado com sucesso!", "success");
    window.location.href = "../index.html";
  } catch (error) {
    console.error("[Pulse] Erro no login com Google:", error);

    // Mensagens amigáveis para os erros mais comuns do Firebase Auth
    const friendlyMessage =
      error.code === "auth/popup-closed-by-user"
        ? "Login cancelado. Tente novamente quando quiser."
        : error.code === "auth/network-request-failed"
        ? "Sem conexão com a internet. Verifique sua rede."
        : "Não foi possível entrar agora. Tente novamente.";

    errorEl.textContent = friendlyMessage;
    errorEl.classList.remove("hidden");
    setButtonLoading(googleBtn, false, ORIGINAL_BTN_HTML);
  }
});
