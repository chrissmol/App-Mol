import { ensureUserProfile, finishEmailLink, getGoogleRedirectUser, isEmailLink, loginWithEmail, loginWithGoogleRedirect, registerWithEmail, resetPassword, sendEmailLink, watchAuthState } from '../modules/auth.js';
import { authErrorMessage, withTimeout } from '../modules/login-utils.js';
import { openLegalDocument } from '../utils/legal-dialog.js';
import { setButtonLoading } from '../utils/ui.js';
import { initializeAccessibility } from '../utils/accessibility.js';
import { setSessionItem } from '../utils/storage.js';
import { setupMobileAppMode } from '../utils/mobile-app.js';

setupMobileAppMode();
initializeAccessibility();

const googleBtn = document.getElementById('googleLoginBtn');
const errorEl = document.getElementById('loginError');
const ORIGINAL_BTN_HTML = googleBtn.innerHTML;
const consentCheck = /** @type {HTMLInputElement} */ (document.getElementById('consentCheck'));
const CONSENT_KEY = 'mol-consent-at';
try { consentCheck.checked = !!localStorage.getItem(CONSENT_KEY); } catch { /* armazenamento bloqueado */ }
// Consentimento específico (LGPD art. 11): sem a caixa marcada nenhum caminho de entrada segue.
function hasConsent() {
  if (!consentCheck.checked) {
    showError('Marque a caixa de concordância para continuar.');
    consentCheck.focus();
    return false;
  }
  try { localStorage.setItem(CONSENT_KEY, new Date().toISOString()); } catch { /* armazenamento bloqueado */ }
  return true;
}
let loginInProgress = false;
let navigating = false;

function navigateHome() {
  if (navigating) return;
  navigating = true;
  setSessionItem('mol-login-success', 'true');
  window.location.replace('/index.html');
}

const MESSAGE_ICONS = {
  error: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
  success: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>'
};

function showError(message, kind = 'error') {
  document.getElementById('loginMessageText').textContent = message;
  document.getElementById('loginMessageIcon').innerHTML = MESSAGE_ICONS[kind];
  errorEl.classList.toggle('text-danger', kind === 'error');
  errorEl.classList.toggle('text-neon', kind === 'success');
  errorEl.classList.remove('hidden');
  errorEl.classList.add('flex');
}

function hideError() {
  errorEl.classList.add('hidden');
  errorEl.classList.remove('flex');
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
  if (loginInProgress || !hasConsent()) return;
  loginInProgress = true;
  hideError();
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

document.querySelectorAll('[data-legal]').forEach(button => {
  button.onclick = () => openLegalDocument(button.dataset.legal, button);
});

const emailForm = document.getElementById('emailAuthForm');
const nameField = document.getElementById('authNameField');
const nameInput = document.getElementById('authName');
const emailInput = /** @type {HTMLInputElement} */ (document.getElementById('authEmail'));
const passwordInput = /** @type {HTMLInputElement} */ (document.getElementById('authPassword'));
const submitBtn = document.getElementById('emailAuthSubmit');
const toggleModeBtn = document.getElementById('toggleAuthMode');
const forgotBtn = document.getElementById('forgotPassword');
let isRegisterMode = false;

function updateEmailFormMode() {
  submitBtn.textContent = isRegisterMode ? 'Criar conta' : 'Entrar';
  toggleModeBtn.textContent = isRegisterMode ? 'Já tenho conta' : 'Criar conta';
  nameField.classList.toggle('hidden', !isRegisterMode);
  nameInput.required = isRegisterMode;
  passwordInput.setAttribute('autocomplete', isRegisterMode ? 'new-password' : 'current-password');
}

toggleModeBtn.addEventListener('click', () => {
  isRegisterMode = !isRegisterMode;
  updateEmailFormMode();
});

emailForm.addEventListener('submit', async event => {
  event.preventDefault();
  if (loginInProgress || !hasConsent()) return;
  loginInProgress = true;
  hideError();
  const originalHtml = submitBtn.innerHTML;
  setButtonLoading(submitBtn, true, originalHtml);

  try {
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const user = isRegisterMode
      ? await registerWithEmail(email, password, nameInput.value.trim())
      : await loginWithEmail(email, password);
    await withTimeout(ensureUserProfile(user), 8000).catch(profileError =>
      console.warn('Perfil inicial será preparado novamente no próximo acesso:', profileError.message));
    navigateHome();
  } catch (error) {
    console.error('[Mol] Erro no login com e-mail:', error);
    showError(authErrorMessage(error));
    loginInProgress = false;
    setButtonLoading(submitBtn, false, originalHtml);
  }
});

forgotBtn.addEventListener('click', async () => {
  const email = emailInput.value.trim();
  if (!email) return showError('Digite seu e-mail para receber o link de redefinição.');
  hideError();
  try {
    await resetPassword(email);
    showError('Enviamos um link de redefinição para o seu e-mail.', 'success');
  } catch (error) {
    showError(authErrorMessage(error));
  }
});

// Mostrar/ocultar senha
const togglePasswordBtn = document.getElementById('togglePassword');
togglePasswordBtn.addEventListener('click', () => {
  const show = passwordInput.type === 'password';
  passwordInput.type = show ? 'text' : 'password';
  togglePasswordBtn.setAttribute('aria-pressed', String(show));
  togglePasswordBtn.setAttribute('aria-label', show ? 'Ocultar senha' : 'Mostrar senha');
  document.getElementById('togglePasswordIcon').setAttribute('d', show
    ? 'M9.88 9.88a3 3 0 1 0 4.24 4.24M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61M2 2l20 20'
    : 'M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z');
});

// Lembrar o último e-mail neste aparelho (só o e-mail, nunca a senha)
const LAST_EMAIL_KEY = 'mol-last-email';
const readStore = key => { try { return localStorage.getItem(key); } catch { return null; } };
const writeStore = (key, value) => { try { value ? localStorage.setItem(key, value) : localStorage.removeItem(key); } catch { /* armazenamento bloqueado */ } };
const lastEmail = readStore(LAST_EMAIL_KEY);
if (lastEmail) emailInput.value = lastEmail;
emailInput.addEventListener('change', () => writeStore(LAST_EMAIL_KEY, emailInput.value.trim()));
emailForm.addEventListener('submit', () => writeStore(LAST_EMAIL_KEY, emailInput.value.trim()));

// Link por e-mail, sem senha
const EMAIL_LINK_KEY = 'mol-email-link-pending';
document.getElementById('emailLinkBtn').addEventListener('click', async () => {
  if (isEmailLink()) return finishEmailLinkLogin();
  if (!hasConsent()) return;
  const email = emailInput.value.trim();
  if (!email) return showError('Digite seu e-mail para receber o link de acesso.');
  hideError();
  try {
    await sendEmailLink(email);
    writeStore(EMAIL_LINK_KEY, email);
    writeStore(LAST_EMAIL_KEY, email);
    showError('Enviamos um link de acesso para o seu e-mail. Abra-o neste aparelho.', 'success');
  } catch (error) {
    showError(error?.code === 'auth/operation-not-allowed' ? 'O acesso por link ainda não está disponível.' : authErrorMessage(error));
  }
});

async function finishEmailLinkLogin() {
  if (!isEmailLink()) return;
  const email = emailInput.value.trim() || readStore(EMAIL_LINK_KEY);
  if (!email) return showError('Digite o e-mail que recebeu o link e toque em "Entrar com link por e-mail".');
  try {
    const user = await finishEmailLink(email);
    writeStore(EMAIL_LINK_KEY, '');
    await withTimeout(ensureUserProfile(user), 8000).catch(profileError =>
      console.warn('Perfil inicial será preparado novamente no próximo acesso:', profileError.message));
    navigateHome();
  } catch (error) {
    showError(authErrorMessage(error));
  }
}
finishEmailLinkLogin();
