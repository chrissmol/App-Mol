import { auth, db } from '../config/firebase-config.js';
import { signOut } from 'firebase/auth';
import { watchProtectedPage } from '../modules/auth.js';
import { doc, getDoc } from 'firebase/firestore';
import { confirmAction, setButtonLoading, showToast } from '../utils/ui.js';
import { setupAppShell } from '../utils/app-shell.js';
import { normalizeAppModules } from '../utils/app-modules.js';

setupAppShell();
const $ = id => document.getElementById(id);
const renderIcons = () => window.lucide?.createIcons();
const ADMIN_EMAIL = 'chrisouzamol@gmail.com';
const withTimeout = (promise, label, milliseconds = 12000) => {
  let timer;
  return Promise.race([promise, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(`${label} excedeu o tempo de resposta.`)), milliseconds); })]).finally(() => clearTimeout(timer));
};

function renderIdentity(account, profile = {}) {
  const name = String(account.displayName || profile.name || profile.nome || 'Usuário').trim().slice(0, 80) || 'Usuário';
  $('user-name').textContent = name;
  $('user-email').textContent = String(account.email || profile.email || '').slice(0, 254);
  const avatar = $('user-avatar');
  const fallback = $('default-avatar-icon');
  const photoURL = account.photoURL || profile.photoURL;
  avatar.alt = name ? `Foto de ${name}` : 'Foto do perfil';
  avatar.onerror = () => { avatar.classList.add('hidden'); fallback.classList.remove('hidden'); };
  if (photoURL) { avatar.src = photoURL; avatar.classList.remove('hidden'); fallback.classList.add('hidden'); }
  const canMonitor = String(account.email || '').toLowerCase() === ADMIN_EMAIL;
  $('admin-link')?.classList.toggle('hidden', !canMonitor);
  $('admin-link')?.classList.toggle('flex', canMonitor);
}

function applyProfileModules(profile = {}) {
  const modules = normalizeAppModules(profile.appModules);
  $('profile-evolution-link')?.classList.toggle('hidden', modules.evolucao === false);
  $('profile-evolution-link')?.classList.toggle('flex', modules.evolucao !== false);
}

function setReady(message = '') {
  $('profile-status').classList.toggle('hidden', !message);
  if (message) $('profile-status').textContent = message;
  $('profile-content').classList.remove('hidden');
  document.body.setAttribute('aria-busy', 'false');
  renderIcons();
}

async function loadProfile(account) {
  renderIdentity(account);
  try {
    const snapshot = await withTimeout(getDoc(doc(db, 'users', account.uid)), 'O perfil');
    const profile = snapshot.exists() ? snapshot.data() : {};
    applyProfileModules(profile);
    renderIdentity(account, profile);
    setReady();
  } catch (error) {
    console.error('Perfil não carregado:', error);
    setReady('Não foi possível atualizar todos os dados do perfil agora.');
  }
}

watchProtectedPage(account => {
  loadProfile(account).catch(error => {
    console.error('Perfil não carregado:', error);
    renderIdentity(account);
    setReady('Não foi possível atualizar o perfil agora. Confira sua conexão.');
  });
});

$('btn-logout').addEventListener('click', async () => {
  const confirmed = await confirmAction({ title: 'Sair da conta?', message: 'Você precisará entrar novamente para acessar seus dados.', confirmText: 'Sair', danger: true });
  if (!confirmed) return;
  const button = $('btn-logout');
  const original = button.innerHTML;
  setButtonLoading(button, true, original);
  try { await withTimeout(signOut(auth), 'A saída da conta', 10000); }
  catch (error) { console.error('Não foi possível sair:', error); showToast('Não foi possível sair da conta. Tente novamente.'); setButtonLoading(button, false, original); renderIcons(); }
});

renderIcons();
