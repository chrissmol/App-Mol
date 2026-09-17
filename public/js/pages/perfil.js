import { db } from '../config/firebase-config.js';
import { watchProtectedPage } from '../modules/auth.js';
import { collection, doc, getCountFromServer, getDoc, query, where } from 'firebase/firestore';
import { setupAppShell } from '../utils/app-shell.js';
import { normalizeAppModules } from '../utils/app-modules.js';
import { getSessionItem, setSessionItem } from '../utils/storage.js';

setupAppShell();

const $ = id => document.getElementById(id);
const renderIcons = () => window.lucide?.createIcons();
const ADMIN_EMAIL = 'chrisouzamol@gmail.com';
const profileCacheKey = uid => `mol-profile-cache-${uid}`;
const FRAME_OPTIONS = [
  { id: 'plastic', label: 'Base', required: 0 },
  { id: 'wood', label: 'Madeira', required: 5 },
  { id: 'bronze', label: 'Bronze', required: 15 },
  { id: 'silver', label: 'Prata', required: 30 },
  { id: 'gold', label: 'Ouro', required: 60 },
  { id: 'diamond', label: 'Diamante', required: 100 },
  { id: 'boss', label: 'Chefão', required: 0, adminOnly: true }
];
let currentAccount = null;
let completedWorkouts = 0;

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

function isAdmin(account = currentAccount) {
  return String(account?.email || '').toLowerCase() === ADMIN_EMAIL;
}

function unlockedFrame(option, account = currentAccount) {
  if (!option) return false;
  return option.adminOnly ? isAdmin(account) : completedWorkouts >= option.required;
}

function normalizeFrame(value, account = currentAccount) {
  const requested = String(value || '').replace(/[^a-z]/g, '');
  const option = FRAME_OPTIONS.find(item => item.id === requested);
  if (option && unlockedFrame(option, account)) return option.id;
  if (isAdmin(account)) return 'boss';
  return FRAME_OPTIONS.filter(item => !item.adminOnly && completedWorkouts >= item.required).at(-1)?.id || 'plastic';
}

function applyAvatarFrame(frameId) {
  const frame = $('avatar-frame');
  if (!frame) return;
  frame.className = frame.className.replace(/avatar-frame--\w+/g, '').trim();
  frame.classList.add(`avatar-frame--${frameId}`);
  const label = FRAME_OPTIONS.find(item => item.id === frameId)?.label || 'perfil';
  frame.setAttribute('aria-label', `Foto do perfil · moldura ${label}`);
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

  applyAvatarFrame(normalizeFrame(profile.avatarFrame, account));

  const canMonitor = isAdmin(account);
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
  currentAccount = account;
  const cachedProfile = safeJSON(getSessionItem(profileCacheKey(account.uid)), {});
  renderIdentity(account, cachedProfile);
  applyProfileModules(cachedProfile);
  setPageReady();

  try {
    const [snapshot, sessionsSnapshot] = await Promise.all([
      withTimeout(getDoc(doc(db, 'users', account.uid)), 'O perfil'),
      withTimeout(getCountFromServer(query(collection(db, 'sessoes'), where('userId', '==', account.uid))), 'As conquistas')
    ]);
    const profile = snapshot.exists() ? snapshot.data() : {};
    completedWorkouts = sessionsSnapshot.data().count;
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
