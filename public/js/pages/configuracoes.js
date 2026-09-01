import { setupAppShell } from '../utils/app-shell.js';
import { auth, db, googleProvider, offlinePersistenceEnabled } from '../config/firebase-config.js';
import { EmailAuthProvider, deleteUser, reauthenticateWithCredential, reauthenticateWithPopup, signOut } from 'firebase/auth';
import { clearIndexedDbPersistence, collection, doc, getDoc, getDocs, query, terminate, waitForPendingWrites, where, writeBatch } from 'firebase/firestore';
import { activateDialog, confirmAction, setButtonLoading, showToast } from '../utils/ui.js';
import { applyAccessibilityPreferences, getAccessibilityPreferences, saveAccessibilityPreferences, syncAccessibilityForUser } from '../utils/accessibility.js';
import { removeLocalItemsWithPrefix } from '../utils/storage.js';
import { setTrustedDevice } from '../utils/offline.js';
import { getReminderPreferences, requestReminderPermission, saveReminderPreferences, sendTestReminder } from '../utils/reminders.js';
import { watchProtectedPage } from '../modules/auth.js';

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


const reminderPreferences = getReminderPreferences();
$('trusted-device').checked = offlinePersistenceEnabled;
$('reminders-enabled').checked = reminderPreferences.enabled;
$('workout-time').value = reminderPreferences.workoutTime;
$('meal-time').value = reminderPreferences.mealTime;

function persistReminderControls() {
  saveReminderPreferences({
    enabled: $('reminders-enabled').checked,
    workoutTime: $('workout-time').value,
    mealTime: $('meal-time').value
  });
}

$('trusted-device').onchange = async () => {
  const enabled = $('trusted-device').checked;
  $('trusted-device').disabled = true;
  try {
    if (enabled) {
      if (!setTrustedDevice(true)) throw new Error('Armazenamento local indisponível.');
      $('device-status').textContent = 'Modo offline ativado. Reiniciando o Mol…';
      window.setTimeout(() => location.reload(), 500);
      return;
    }
    if (!navigator.onLine) throw new Error('Conecte-se à internet antes de remover os dados offline deste aparelho.');
    await waitForPendingWrites(db);
    await terminate(db);
    await clearIndexedDbPersistence(db);
    setTrustedDevice(false);
    $('device-status').textContent = 'Dados offline removidos deste aparelho. Reiniciando…';
    window.setTimeout(() => location.reload(), 500);
  } catch (error) {
    $('trusted-device').checked = offlinePersistenceEnabled;
    $('trusted-device').disabled = false;
    $('device-status').textContent = error.message || 'Não foi possível alterar o modo offline.';
    showToast(error.message || 'Não foi possível alterar o modo offline.');
  }
};

$('reminders-enabled').onchange = async () => {
  try {
    if ($('reminders-enabled').checked) await requestReminderPermission();
    persistReminderControls();
    $('device-status').textContent = $('reminders-enabled').checked
      ? 'Lembretes ativados neste aparelho.'
      : 'Lembretes desativados neste aparelho.';
  } catch (error) {
    $('reminders-enabled').checked = false;
    persistReminderControls();
    showToast(error.message || 'Não foi possível ativar os lembretes.');
  }
};
$('workout-time').onchange = persistReminderControls;
$('meal-time').onchange = persistReminderControls;
$('test-reminder').onclick = async () => {
  try { await sendTestReminder(); showToast('Lembrete enviado.', 'success'); }
  catch (error) { showToast(error.message || 'Não foi possível enviar o lembrete.'); }
};
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
    modal.innerHTML = '<section class="w-full max-w-sm rounded-3xl mol-dialog-surface p-6 shadow-2xl"><h2 id="password-dialog-title" class="text-lg font-bold">Confirme sua senha</h2><p id="password-dialog-description" class="mt-2 text-sm text-gray-400">Precisamos confirmar sua identidade antes da exclusão.</p><label class="mt-5 block text-xs font-bold text-gray-400">Senha<input data-password type="password" autocomplete="current-password" class="mt-2 min-h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-white"></label><div class="mt-6 grid grid-cols-2 gap-3"><button type="button" data-cancel class="rounded-xl mol-soft py-3 text-sm font-bold">Cancelar</button><button type="button" data-confirm class="rounded-xl bg-red-500 py-3 text-sm font-bold text-white">Continuar</button></div></section>';
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

watchProtectedPage(async user => {
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
window.lucide?.createIcons();
