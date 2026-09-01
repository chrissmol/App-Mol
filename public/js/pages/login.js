import { ensureUserProfile, getGoogleRedirectUser, loginWithGoogleRedirect, watchAuthState } from '../modules/auth.js';
import { authErrorMessage, LEGAL_DOCUMENTS, withTimeout } from '../modules/login-utils.js';
import { setButtonLoading } from '../utils/ui.js';
import { initializeAccessibility } from '../utils/accessibility.js';
import { setSessionItem } from '../utils/storage.js';
import { setupMobileAppMode } from '../utils/mobile-app.js';

setupMobileAppMode();
initializeAccessibility();

const googleBtn = document.getElementById('googleLoginBtn');
const errorEl = document.getElementById('loginError');
const ORIGINAL_BTN_HTML = googleBtn.innerHTML;
let loginInProgress = false;
let navigating = false;

function navigateHome() {
  if (navigating) return;
  navigating = true;
  setSessionItem('mol-login-success', 'true');
  window.location.replace('/index.html');
}

function showError(message) {
  errorEl.textContent = message;
  errorEl.classList.remove('hidden');
}

watchAuthState(async user => {
  if (user) {
    try { await withTimeout(ensureUserProfile(user), 8000); }
    catch (profileError) { console.warn('Perfil inicial será preparado novamente no próximo acesso:', profileError.message); }
    navigateHome();
  }
});

async function finishRedirectLogin() {
  try {
    const user = await withTimeout(getGoogleRedirectUser(), 12000);
    if (!user) return;
    try { await withTimeout(ensureUserProfile(user), 8000); }
    catch (profileError) { console.warn('Perfil inicial será preparado novamente no próximo acesso:', profileError.message); }
    navigateHome();
  } catch (error) {
    console.error('[Mol] Erro no retorno do login com Google:', error);
    showError(authErrorMessage(error));
  }
}

finishRedirectLogin();

googleBtn.addEventListener('click', async () => {
  if (loginInProgress) return;
  loginInProgress = true;
  errorEl.classList.add('hidden');
  setButtonLoading(googleBtn, true, ORIGINAL_BTN_HTML);
  googleBtn.setAttribute('aria-busy', 'true');

  try {
    await loginWithGoogleRedirect();
  } catch (error) {
    console.error('[Mol] Erro no login com Google:', error);
    showError(error?.code === 'auth/timeout' ? 'O login demorou demais. Confira sua conexão e tente novamente.' : authErrorMessage(error));
  } finally {
    if (!navigating) {
      loginInProgress = false;
      googleBtn.removeAttribute('aria-busy');
      setButtonLoading(googleBtn, false, ORIGINAL_BTN_HTML);
    }
  }
});

function openLegalDocument(kind, opener) {
  document.getElementById('mol-legal-dialog')?.remove();
  const documentData = LEGAL_DOCUMENTS[kind];
  if (!documentData) return;
  const modal = document.createElement('div');
  modal.id = 'mol-legal-dialog';
  modal.className = 'fixed inset-0 z-[200] flex items-end bg-black/75 p-4 backdrop-blur-sm sm:items-center sm:justify-center';
  modal.innerHTML = `<section role="dialog" aria-modal="true" aria-labelledby="legal-title" aria-describedby="legal-updated" class="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl mol-dialog-surface p-6"><h2 id="legal-title" class="text-xl font-extrabold"></h2><p id="legal-updated" class="mt-1 text-xs text-gray-500"></p><div data-sections class="mt-5 space-y-5 text-sm leading-relaxed text-gray-400"></div><button type="button" data-close class="mt-6 min-h-12 w-full rounded-2xl bg-neon font-bold text-black">Entendi</button></section>`;
  modal.querySelector('#legal-title').textContent = documentData.title;
  modal.querySelector('#legal-updated').textContent = documentData.updated;
  const sections = modal.querySelector('[data-sections]');
  documentData.sections.forEach(([title, copy]) => {
    const section = document.createElement('section');
    const heading = document.createElement('h3'); heading.className = 'font-bold text-white'; heading.textContent = title;
    const paragraph = document.createElement('p'); paragraph.className = 'mt-1'; paragraph.textContent = copy;
    section.append(heading, paragraph); sections.appendChild(section);
  });
  const close = () => { modal.remove(); opener?.focus(); };
  modal.querySelector('[data-close]').onclick = close;
  modal.onclick = event => { if (event.target === modal) close(); };
  modal.onkeydown = event => {
    if (event.key === 'Escape') return close();
    if (event.key !== 'Tab') return;
    const controls = [...modal.querySelectorAll('button:not(:disabled), a[href]')];
    const first = controls[0]; const last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };
  document.body.appendChild(modal);
  modal.querySelector('[data-close]').focus();
}

document.querySelectorAll('[data-legal]').forEach(button => {
  button.onclick = () => openLegalDocument(button.dataset.legal, button);
});
