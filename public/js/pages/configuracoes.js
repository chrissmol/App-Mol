import { setupAppShell } from '../utils/app-shell.js';
import { getReminderPreferences, requestReminderPermission, saveReminderPreferences, sendTestReminder } from '../utils/reminders.js';
import { auth, db, googleProvider } from '../config/firebase-config.js';
import { EmailAuthProvider, deleteUser, onAuthStateChanged, reauthenticateWithCredential, reauthenticateWithPopup, signOut } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, query, where, writeBatch } from 'firebase/firestore';
import { activateDialog, confirmAction, setButtonLoading, showToast } from '../utils/ui.js';
import { applyAccessibilityPreferences, getAccessibilityPreferences, saveAccessibilityPreferences, syncAccessibilityForUser } from '../utils/accessibility.js';
import { removeLocalItemsWithPrefix } from '../utils/storage.js';

setupAppShell();

const $ = id => document.getElementById(id);

let appearance = getAccessibilityPreferences();
const themeChoices = [
  ['system', 'monitor', 'Sistema'],
  ['dark', 'moon', 'Escuro'],
  ['light', 'sun', 'Claro']
];

function applyAppearance() {
  appearance = applyAccessibilityPreferences(appearance);
  $('theme-segments').querySelectorAll('button').forEach(button => {
    const selected = button.dataset.theme === appearance.theme;
    button.classList.toggle('is-active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  $('contrast').checked = appearance.contrast;
  $('large-text').checked = appearance.largeText;
}

async function persistAppearance() {
  applyAppearance();
  try {
    appearance = await saveAccessibilityPreferences(appearance);
  } catch (error) {
    console.warn('Preferências salvas apenas neste dispositivo:', error.message);
    showToast('A preferência foi aplicada, mas não pôde ser sincronizada com sua conta.');
  }
}

themeChoices.forEach(([value, icon, label]) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.theme = value;
  button.className = 'flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl text-xs font-bold';
  button.innerHTML = `<i data-lucide="${icon}" class="h-4 w-4"></i><span>${label}</span>`;
  button.onclick = () => { appearance.theme = value; persistAppearance(); };
  $('theme-segments').appendChild(button);
});

$('contrast').onchange = () => { appearance.contrast = $('contrast').checked; persistAppearance(); };
$('large-text').onchange = () => { appearance.largeText = $('large-text').checked; persistAppearance(); };

const defaultReminderNote = 'Os lembretes funcionam enquanto o Mol estiver aberto. O navegador pode pausar avisos em segundo plano.';

function renderReminders(message = '') {
  const prefs = getReminderPreferences();
  $('reminders-enabled').checked = prefs.enabled;
  $('workout-time').value = prefs.workoutTime;
  $('meal-time').value = prefs.mealTime;
  $('reminder-options').classList.toggle('opacity-50', !prefs.enabled);
  $('reminder-options').querySelectorAll('input').forEach(input => { input.disabled = !prefs.enabled; });
  $('test-reminder').disabled = !prefs.enabled;
  $('test-reminder').classList.toggle('opacity-50', !prefs.enabled);
  if (message) $('reminder-note').textContent = message;
  else if (!('Notification' in window)) $('reminder-note').textContent = 'Este navegador não oferece notificações locais.';
  else if (Notification.permission === 'denied') $('reminder-note').textContent = 'As notificações estão bloqueadas. Libere a permissão nas configurações deste site.';
  else if (prefs.enabled && Notification.permission === 'granted') $('reminder-note').textContent = 'Lembretes ativos. Mantenha o Mol aberto para receber os avisos.';
  else $('reminder-note').textContent = defaultReminderNote;
}

$('reminders-enabled').onchange = async () => {
  const enabled = $('reminders-enabled').checked;
  if (enabled) {
    try {
      await requestReminderPermission();
    } catch (error) {
      saveReminderPreferences({ enabled: false });
      renderReminders(error.message || 'Não foi possível ativar as notificações.');
      showToast(error.message || 'Não foi possível ativar as notificações.');
      return;
    }
  }
  if (!saveReminderPreferences({ enabled })) {
    renderReminders('O navegador não permitiu salvar os lembretes neste dispositivo.');
    showToast('Não foi possível salvar a preferência de lembretes.');
    return;
  }
  renderReminders(enabled ? 'Lembretes ativados.' : 'Lembretes desativados.');
};

['workout-time', 'meal-time'].forEach(id => {
  $(id).onchange = () => {
    if (!$(id).value) return renderReminders('Escolha um horário válido.');
    if (!saveReminderPreferences({ [id === 'workout-time' ? 'workoutTime' : 'mealTime']: $(id).value })) {
      renderReminders('O navegador não permitiu salvar os horários.');
      showToast('Não foi possível salvar o horário.');
      return;
    }
    renderReminders('Horários atualizados.');
  };
});

$('test-reminder').onclick = async () => {
  if (!getReminderPreferences().enabled) return;
  const button = $('test-reminder');
  setButtonLoading(button, true);
  try {
    await sendTestReminder();
    renderReminders('Notificação de teste enviada.');
    showToast('Notificação enviada.', 'success');
  } catch (error) {
    renderReminders(error.message || 'Não foi possível enviar a notificação.');
    showToast(error.message || 'Não foi possível enviar a notificação.');
  } finally {
    setButtonLoading(button, false);
    window.lucide?.createIcons();
  }
};

function renderInstall() {
  const installed = matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  if (installed) {
    $('install-app').hidden = true;
    $('install-note').textContent = 'O Mol já está instalado neste dispositivo.';
  } else if (window.__molInstallPrompt) {
    $('install-app').hidden = false;
    $('install-note').textContent = 'Instale o Mol para abrir em tela cheia e acessar mais rapidamente.';
  } else {
    $('install-app').hidden = true;
    $('install-note').textContent = /iphone|ipad|ipod/i.test(navigator.userAgent)
      ? 'No Safari, toque em Compartilhar e depois em “Adicionar à Tela de Início”.'
      : 'A instalação aparecerá aqui quando estiver disponível neste navegador.';
  }
}

$('install-app').onclick = async () => {
  const promptEvent = window.__molInstallPrompt;
  if (!promptEvent) return;
  await promptEvent.prompt();
  const choice = await promptEvent.userChoice;
  window.__molInstallPrompt = null;
  renderInstall();
  if (choice.outcome === 'accepted') showToast('Instalação iniciada.', 'success');
};
window.addEventListener('mol-install-available', renderInstall);
window.addEventListener('appinstalled', renderInstall);

async function deleteUserData(user) {
  const names = ['treinos', 'sessoes', 'pesos'];
  const dietReference = doc(db, 'dietas', user.uid);
  // Todas as leituras terminam antes da primeira exclusão, evitando apagar só parte dos dados por falha de consulta.
  const [snapshots, diet] = await Promise.all([
    Promise.all(names.map(name => getDocs(query(collection(db, name), where('userId', '==', user.uid))))),
    getDoc(dietReference)
  ]);
  for (const snapshot of snapshots) {
    for (let index = 0; index < snapshot.docs.length; index += 450) {
      const batch = writeBatch(db);
      snapshot.docs.slice(index, index + 450).forEach(item => batch.delete(item.ref));
      await batch.commit();
    }
  }
  const finalBatch = writeBatch(db);
  if (diet.exists()) finalBatch.delete(dietReference);
  finalBatch.delete(doc(db, 'users', user.uid));
  await finalBatch.commit();
}

function requestPassword() {
  return new Promise(resolve => {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-[1000] flex items-end bg-black/70 p-4 backdrop-blur-sm sm:items-center sm:justify-center';
    modal.setAttribute('aria-labelledby', 'password-dialog-title');
    modal.setAttribute('aria-describedby', 'password-dialog-description');
    modal.innerHTML = '<section class="w-full max-w-sm rounded-3xl border border-white/10 bg-[#161a17] p-6 shadow-2xl"><h2 id="password-dialog-title" class="text-lg font-bold">Confirme sua senha</h2><p id="password-dialog-description" class="mt-2 text-sm text-gray-400">Precisamos confirmar sua identidade antes da exclusão.</p><label class="mt-5 block text-xs font-bold text-gray-400">Senha<input data-password type="password" autocomplete="current-password" class="mt-2 min-h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-white"></label><div class="mt-6 grid grid-cols-2 gap-3"><button type="button" data-cancel class="rounded-xl bg-white/5 py-3 text-sm font-bold">Cancelar</button><button type="button" data-confirm class="rounded-xl bg-red-500 py-3 text-sm font-bold text-white">Continuar</button></div></section>';
    document.body.appendChild(modal);
    const input = modal.querySelector('[data-password]');
    let closeDialog;
    const close = value => { closeDialog(); resolve(value); };
    closeDialog = activateDialog(modal, { initialFocus: input, onCancel: () => close('') });
    modal.querySelector('[data-cancel]').onclick = () => close('');
    modal.querySelector('[data-confirm]').onclick = () => close(input.value);
    input.onkeydown = event => { if (event.key === 'Enter') { event.preventDefault(); close(input.value); } };
    modal.onclick = event => { if (event.target === modal) close(''); };
  });
}

async function reauthenticate(user) {
  if (user.providerData.some(provider => provider.providerId === 'google.com')) {
    await reauthenticateWithPopup(user, googleProvider);
    return;
  }
  if (user.providerData.some(provider => provider.providerId === 'password')) {
    const password = await requestPassword();
    if (!password) throw new Error('Exclusão cancelada.');
    await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, password));
    return;
  }
  throw new Error('Entre novamente antes de excluir sua conta.');
}

function authErrorMessage(error, fallback) {
  if (error?.code === 'auth/wrong-password' || error?.code === 'auth/invalid-credential') return 'Senha incorreta.';
  if (error?.code === 'auth/popup-closed-by-user') return 'Confirmação cancelada.';
  if (error?.code === 'auth/popup-blocked') return 'O navegador bloqueou a confirmação. Libere pop-ups para o Mol e tente novamente.';
  if (error?.code === 'auth/requires-recent-login') return 'Entre novamente e tente de novo.';
  return error?.message || fallback;
}

onAuthStateChanged(auth, async user => {
  if (!user) {
    location.href = './login.html';
    return;
  }
  try {
    appearance = await syncAccessibilityForUser(user);
    applyAppearance();
  } catch (error) {
    console.warn('Preferências da conta não carregadas:', error.message);
  }
  $('session-email').textContent = user.email || user.displayName || 'Conta conectada';

  $('sign-out').onclick = async () => {
    const confirmed = await confirmAction({ title: 'Sair desta conta?', message: 'Você precisará entrar novamente para acessar seus dados.', confirmText: 'Sair' });
    if (!confirmed) return;
    const button = $('sign-out');
    setButtonLoading(button, true);
    try {
      await signOut(auth);
      location.href = './login.html';
    } catch (error) {
      setButtonLoading(button, false);
      window.lucide?.createIcons();
      showToast(authErrorMessage(error, 'Não foi possível sair da conta.'));
    }
  };

  $('delete-account').onclick = async () => {
    const confirmed = await confirmAction({ title: 'Excluir conta permanentemente?', message: 'Perfil, fotos, treinos, sessões, pesos e dieta serão apagados. Essa ação não pode ser desfeita.', confirmText: 'Excluir tudo', danger: true });
    if (!confirmed) return;
    const button = $('delete-account');
    setButtonLoading(button, true);
    try {
      await reauthenticate(user);
      await deleteUserData(user);
      await deleteUser(user);
      removeLocalItemsWithPrefix('mol-');
      location.href = './login.html';
    } catch (error) {
      setButtonLoading(button, false);
      window.lucide?.createIcons();
      if (error?.message !== 'Exclusão cancelada.') showToast(authErrorMessage(error, 'Não foi possível excluir a conta.'));
    }
  };
});

applyAppearance();
renderReminders();
renderInstall();
window.lucide?.createIcons();
