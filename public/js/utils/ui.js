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
    "fixed bottom-6 left-1/2 -translate-x-1/2 z-[999]",
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
