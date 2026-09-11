import { db } from '../config/firebase-config.js';
import { watchProtectedPage } from '../modules/auth.js';
import { doc, getDoc } from 'firebase/firestore';
import { setupAppShell } from '../utils/app-shell.js';
import { normalizeAppModules } from '../utils/app-modules.js';
import { getSessionItem, setSessionItem } from '../utils/storage.js';

setupAppShell();

const $ = id => document.getElementById(id);
const renderIcons = () => window.lucide?.createIcons();
const ADMIN_EMAIL = 'chrisouzamol@gmail.com';
const profileCacheKey = uid => `mol-profile-cache-${uid}`;

function withTimeout(promise, label, milliseconds = 8000) {
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(`${label} excedeu o tempo de resposta.`)), milliseconds); })
  ]).finally(() => clearTimeout(timer));
}

function safeJSON(value, fallback = null) {
  try { return value ? JSON.parse(value) : fallback; }
  catch { return fallback; }
}

function renderIdentity(account, profile = {}) {
  const name = String(account.displayName || profile.name || profile.nome || 'Usuário').trim().slice(0, 80) || 'Usuário';
  $('user-name').textContent = name;
  $('user-email').textContent = String(account.email || profile.email || '').slice(0, 254);

  const avatar = $('user-avatar');
  const fallback = $('default-avatar-icon');
  const photoURL = account.photoURL || profile.photoURL;
  avatar.alt = name ? `Foto de ${name}` : 'Foto do perfil';
  avatar.onerror = () => { avatar.classList.add('hidden'); fallback.classList.remove('hidden'); };
  if (photoURL) {
    avatar.src = photoURL;
    avatar.classList.remove('hidden');
    fallback.classList.add('hidden');
  }

  const canMonitor = String(account.email || '').toLowerCase() === ADMIN_EMAIL;
  $('admin-link')?.classList.toggle('hidden', !canMonitor);
  $('admin-link')?.classList.toggle('flex', canMonitor);
}

function applyProfileModules(profile = {}) {
  const modules = normalizeAppModules(profile.appModules);
  $('profile-evolution-link')?.classList.toggle('hidden', modules.evolucao === false);
  $('profile-evolution-link')?.classList.toggle('flex', modules.evolucao !== false);
}

function setPageReady(message = '') {
  $('profile-status').classList.toggle('hidden', !message);
  if (message) $('profile-status').textContent = message;
  $('profile-content').classList.remove('hidden');
  document.body.setAttribute('aria-busy', 'false');
  renderIcons();
}

async function loadProfile(account) {
  const cachedProfile = safeJSON(getSessionItem(profileCacheKey(account.uid)), {});
  renderIdentity(account, cachedProfile);
  applyProfileModules(cachedProfile);
  setPageReady();

  try {
    const snapshot = await withTimeout(getDoc(doc(db, 'users', account.uid)), 'O perfil');
    const profile = snapshot.exists() ? snapshot.data() : {};
    setSessionItem(profileCacheKey(account.uid), JSON.stringify(profile));
    applyProfileModules(profile);
    renderIdentity(account, profile);
    setPageReady();
  } catch (error) {
    console.warn('Perfil não sincronizado agora:', error.message);
    setPageReady('Exibindo os dados salvos neste dispositivo. A sincronização será tentada novamente no próximo acesso.');
  }
}

watchProtectedPage(account => {
  loadProfile(account).catch(error => {
    console.error('Perfil não carregado:', error);
    renderIdentity(account);
    setPageReady('Não foi possível atualizar o perfil agora. Confira sua conexão.');
  });
});

renderIcons();
