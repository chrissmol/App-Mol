/**
 * ui.js
 * ------------------------------------------------------------------
 * Utilitários genéricos de interface, reutilizados em qualquer
 * página do Pulse (toasts de erro/sucesso, estado de loading em
 * botões). Mantém as páginas enxutas e sem lógica repetida.
 * ------------------------------------------------------------------
 */

/**
 * Mostra uma notificação temporária (toast) no rodapé da tela.
 * @param {string} message
 * @param {'success' | 'error'} type
 */
export function showToast(message, type = "error") {
  const existing = document.getElementById("pulse-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "pulse-toast";
  toast.className = [
    "fixed bottom-24 left-1/2 -translate-x-1/2 z-[999] max-w-[calc(100%-2rem)] text-center",
    "px-4 py-3 rounded-xl text-sm font-semibold",
    "border backdrop-blur-lg shadow-glow-sm",
    "transition-all duration-300 opacity-0 translate-y-2",
    type === "success"
      ? "bg-success/10 border-success/40 text-success"
      : "bg-danger/10 border-danger/40 text-danger",
  ].join(" ");
  toast.textContent = message;
  document.body.appendChild(toast);

  // Anima entrada
  requestAnimationFrame(() => {
    toast.classList.remove("opacity-0", "translate-y-2");
  });

  // Remove automaticamente
  setTimeout(() => {
    toast.classList.add("opacity-0", "translate-y-2");
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

/** Escapa conteúdo textual antes de inseri-lo em um template HTML. */
export function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>'"]/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  })[character]);
}

export function confirmAction({ title, message, confirmText = "Confirmar", danger = false }) {
  return new Promise((resolve) => {
    document.getElementById("mol-confirm")?.remove();
    const modal = document.createElement("div");
    modal.id = "mol-confirm";
    modal.className = "fixed inset-0 z-[1000] flex items-end bg-black/70 p-4 backdrop-blur-sm sm:items-center sm:justify-center";
    modal.innerHTML = `<div class="w-full max-w-sm rounded-3xl border border-white/10 bg-[#161a17] p-6 shadow-2xl animate-slide-up">
      <div class="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl ${danger ? "bg-red-500/15 text-red-400" : "bg-neon/15 text-neon"}"><i data-lucide="${danger ? "triangle-alert" : "circle-help"}" class="h-5 w-5"></i></div>
      <h2 class="text-lg font-bold text-white">${title}</h2><p class="mt-2 text-sm leading-relaxed text-gray-400">${message}</p>
      <div class="mt-6 grid grid-cols-2 gap-3"><button data-cancel class="rounded-xl bg-white/5 py-3 text-sm font-bold text-gray-300">Cancelar</button><button data-confirm class="rounded-xl py-3 text-sm font-bold ${danger ? "bg-red-500 text-white" : "bg-neon text-black"}">${confirmText}</button></div>
    </div>`;
    document.body.appendChild(modal); lucide.createIcons();
    const close = (result) => { modal.remove(); resolve(result); };
    modal.querySelector("[data-cancel]").onclick = () => close(false);
    modal.querySelector("[data-confirm]").onclick = () => close(true);
    modal.onclick = (event) => { if (event.target === modal) close(false); };
  });
}

/**
 * Alterna um botão para estado de "carregando", trocando o texto
 * por um spinner e desabilitando cliques repetidos.
 * @param {HTMLButtonElement} button
 * @param {boolean} isLoading
 * @param {string} originalHTML - HTML original do botão (para restaurar)
 */
export function setButtonLoading(button, isLoading, originalHTML) {
  if (isLoading) {
    button.dataset.originalHtml = originalHTML ?? button.innerHTML;
    button.disabled = true;
    button.classList.add("opacity-70", "cursor-not-allowed");
    button.innerHTML = `
      <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
      </svg>`;
  } else {
    button.disabled = false;
    button.classList.remove("opacity-70", "cursor-not-allowed");
    button.innerHTML = button.dataset.originalHtml ?? originalHTML ?? button.innerHTML;
  }
}
