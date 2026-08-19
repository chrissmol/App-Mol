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

const legalCopy = {
  terms: ['Termos de Uso', 'Ao usar o Mol, você é responsável pelas informações registradas e por adaptar treinos e alimentação às suas condições. O aplicativo não substitui orientação médica, nutricional ou profissional.'],
  privacy: ['Política de Privacidade', 'Seus dados de conta e atividade são vinculados ao seu usuário autenticado e usados para oferecer os recursos do Mol. Você pode exportar seus dados ou excluir sua conta nas Configurações.']
};
document.querySelectorAll('[data-legal]').forEach(button => button.onclick = () => {
  const [title, copy] = legalCopy[button.dataset.legal];
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 z-[200] flex items-end bg-black/75 p-4 backdrop-blur-sm sm:items-center sm:justify-center';
  modal.innerHTML = `<section role="dialog" aria-modal="true" aria-labelledby="legal-title" class="mx-auto w-full max-w-sm rounded-3xl border border-white/10 bg-[#151a17] p-6"><h2 id="legal-title" class="text-xl font-extrabold">${title}</h2><p class="mt-3 text-sm leading-relaxed text-gray-400">${copy}</p><button data-close class="mt-6 min-h-12 w-full rounded-2xl bg-neon font-bold text-black">Entendi</button></section>`;
  document.body.appendChild(modal);
  const close = () => modal.remove();
  modal.querySelector('[data-close]').onclick = close;
  modal.onclick = event => { if (event.target === modal) close(); };
  modal.querySelector('[data-close]').focus();
});
document.title = 'Mol';
