import { setupAppShell } from '../utils/app-shell.js';
import { getReminderPreferences, requestReminderPermission, saveReminderPreferences, sendTestReminder } from '../utils/reminders.js';
import { auth, db, googleProvider } from '../config/firebase-config.js';
import { EmailAuthProvider, deleteUser, onAuthStateChanged, reauthenticateWithCredential, reauthenticateWithPopup, signOut } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { collection, deleteDoc, doc, getDocs, query, where, writeBatch } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

setupAppShell();

const saved = JSON.parse(localStorage.getItem('mol-accessibility') || '{}');
const choices = [['system', 'Sistema'], ['', 'Escuro'], ['light', 'Claro']];
const group = document.getElementById('theme-segments');
const remindersEnabled = document.getElementById('reminders-enabled');
const reminderOptions = document.getElementById('reminder-options');
const workoutTime = document.getElementById('workout-time');
const mealTime = document.getElementById('meal-time');
const reminderNote = document.getElementById('reminder-note');
const installButton = document.getElementById('install-app');
const installNote = document.getElementById('install-note');
const languageGroup = document.getElementById('language-segments');

const apply = () => {
  const prefs = { theme: saved.theme ?? 'system', contrast: !!saved.contrast, largeText: !!saved.largeText };
  localStorage.setItem('mol-accessibility', JSON.stringify(prefs));
  document.body.dataset.theme = prefs.theme === 'system' ? (matchMedia('(prefers-color-scheme: dark)').matches ? '' : 'light') : prefs.theme;
  document.body.dataset.highContrast = prefs.contrast;
  document.body.dataset.largeText = prefs.largeText ? 'true' : '';
  group.querySelectorAll('button').forEach((button) => button.classList.toggle('is-active', button.dataset.theme === prefs.theme));
};

choices.forEach(([value, label]) => {
  const button = document.createElement('button');
  button.dataset.theme = value;
  button.className = 'min-h-11 rounded-xl text-xs font-bold';
  button.textContent = label;
  button.onclick = () => { saved.theme = value; apply(); };
  group.appendChild(button);
});

const contrast = document.getElementById('contrast');
const large = document.getElementById('large-text');
contrast.checked = !!saved.contrast;
large.checked = !!saved.largeText;
contrast.onchange = () => { saved.contrast = contrast.checked; apply(); };
large.onchange = () => { saved.largeText = large.checked; apply(); };

function renderReminders() {
  const prefs = getReminderPreferences();
  remindersEnabled.checked = prefs.enabled;
  workoutTime.value = prefs.workoutTime;
  mealTime.value = prefs.mealTime;
  reminderOptions.classList.toggle('opacity-50', !prefs.enabled);
  reminderOptions.querySelectorAll('input').forEach((input) => { input.disabled = !prefs.enabled; });
  if (!('Notification' in window)) reminderNote.textContent = 'Este navegador não oferece notificações locais.';
  else if (Notification.permission === 'denied') reminderNote.textContent = 'As notificações foram bloqueadas no navegador. Libere a permissão nas configurações do site.';
}

remindersEnabled.onchange = async () => {
  if (remindersEnabled.checked) {
    try { await requestReminderPermission(); }
    catch (error) { remindersEnabled.checked = false; alert(error.message); }
  }
  saveReminderPreferences({ enabled: remindersEnabled.checked });
  renderReminders();
};
[workoutTime, mealTime].forEach((input) => input.onchange = () => saveReminderPreferences({ [input === workoutTime ? 'workoutTime' : 'mealTime']: input.value }));
document.getElementById('test-reminder').onclick = async () => {
  try { await sendTestReminder(); }
  catch (error) { alert(error.message); }
};

function renderInstall() {
  if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
    installButton.hidden = true;
    installNote.textContent = 'O Mol já está instalado neste dispositivo.';
  } else if (window.__molInstallPrompt) {
    installButton.hidden = false;
    installNote.textContent = 'Instale para abrir em tela cheia e manter o acesso rápido.';
  } else {
    installButton.hidden = true;
    installNote.textContent = 'No iPhone, use Compartilhar > Adicionar à Tela de Início. Em outros navegadores, o botão aparece quando a instalação estiver disponível.';
  }
}

installButton.onclick = async () => {
  const prompt = window.__molInstallPrompt;
  if (!prompt) return;
  prompt.prompt();
  await prompt.userChoice;
  window.__molInstallPrompt = null;
  renderInstall();
};
window.addEventListener('mol-install-available', renderInstall);

const language = localStorage.getItem('mol-language') || 'pt-BR';
document.documentElement.lang = language;
[['pt-BR', 'Português'], ['en-US', 'English']].forEach(([locale, label]) => {
  const button = document.createElement('button');
  button.className = 'min-h-11 rounded-xl bg-white/5 text-sm font-bold';
  button.textContent = label;
  button.setAttribute('aria-pressed', String(locale === language));
  if (locale === language) button.classList.add('bg-neon', 'text-black');
  button.onclick = () => {
    localStorage.setItem('mol-language', locale);
    document.documentElement.lang = locale;
    languageGroup.querySelectorAll('button').forEach((item) => {
      const selected = item.textContent === label;
      item.setAttribute('aria-pressed', String(selected));
      item.classList.toggle('bg-neon', selected);
      item.classList.toggle('text-black', selected);
    });
  };
  languageGroup.appendChild(button);
});

async function deleteUserData(user) {
  for (const name of ['treinos', 'sessoes', 'pesos', 'dietas']) {
    const snapshot = await getDocs(query(collection(db, name), where('userId', '==', user.uid)));
    for (let index = 0; index < snapshot.docs.length; index += 450) {
      const batch = writeBatch(db);
      snapshot.docs.slice(index, index + 450).forEach((item) => batch.delete(item.ref));
      await batch.commit();
    }
  }
  await deleteDoc(doc(db, 'users', user.uid));
}

async function reauthenticate(user) {
  if (user.providerData.some((provider) => provider.providerId === 'google.com')) {
    await reauthenticateWithPopup(user, googleProvider);
    return;
  }
  if (user.providerData.some((provider) => provider.providerId === 'password')) {
    const password = prompt('Confirme sua senha para excluir a conta.');
    if (!password) throw new Error('Exclusão cancelada.');
    await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, password));
    return;
  }
  throw new Error('Entre novamente antes de excluir sua conta.');
}

onAuthStateChanged(auth, (user) => {
  if (!user) { location.href = './login.html'; return; }
  document.getElementById('session-email').textContent = user.email || 'Conta conectada';
  document.getElementById('sign-out').onclick = async () => { await signOut(auth); location.href = './login.html'; };
  document.getElementById('delete-account').onclick = async () => {
    if (prompt('Esta ação é permanente. Digite EXCLUIR para continuar.') !== 'EXCLUIR') return;
    const button = document.getElementById('delete-account');
    button.disabled = true;
    try {
      await reauthenticate(user);
      await deleteUserData(user);
      await deleteUser(user);
      Object.keys(localStorage).filter((key) => key.startsWith('mol-')).forEach((key) => localStorage.removeItem(key));
      location.href = './login.html';
    } catch (error) {
      button.disabled = false;
      alert(error.code === 'auth/requires-recent-login' ? 'Entre novamente e tente de novo.' : (error.message || 'Não foi possível excluir a conta.'));
    }
  };
});
document.getElementById('back').onclick = () => history.back();
apply();
renderReminders();
renderInstall();
