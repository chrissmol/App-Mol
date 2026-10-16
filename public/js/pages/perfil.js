import { getDb } from '../config/firebase-config.js';
import brand from '@brand';
const db = await getDb();
import { withTimeout } from '../utils/timeout.js';
import { watchProtectedPage } from '../modules/auth.js';
import { collection, doc, getCountFromServer, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { recentWeightTrend } from '../modules/dashboard-analytics.js';
import { setupAppShell } from '../utils/app-shell.js';
import { activateDialog } from '../utils/ui.js';
import { normalizeAppModules } from '../utils/app-modules.js';
import { getSessionItem, setSessionItem } from '../utils/storage.js';

setupAppShell();

// any: cada tela sabe o tipo do elemento (input, button...) que busca por id.
const $ = id => /** @type {any} */ (document.getElementById(id));
const renderIcons = () => window.lucide?.createIcons();
const ADMIN_EMAIL = brand.adminEmail.toLowerCase();
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
let currentProfile = {};


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
  currentProfile = profile;
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

function openFrameModal() {
  if (!currentAccount) return;
  document.getElementById('frame-picker')?.remove();
  const current = normalizeFrame(currentProfile.avatarFrame, currentAccount);
  const admin = isAdmin(currentAccount);
  const optionsHTML = FRAME_OPTIONS
    .filter(option => !option.adminOnly || admin)
    .map(option => {
      const unlocked = unlockedFrame(option, currentAccount);
      const detail = unlocked ? (current === option.id ? 'Em uso' : 'Disponível') : `Desbloqueie com ${option.required} treinos`;
      return `<button type="button" data-frame="${option.id}" class="avatar-frame-choice avatar-frame-choice--${option.id} ${current === option.id ? 'is-active' : ''}" ${unlocked ? '' : 'disabled'} aria-pressed="${current === option.id}"><span class="frame-choice__dot"></span><span><strong>${option.label}</strong><small>${detail}</small></span></button>`;
    }).join('');
  const modal = document.createElement('div');
  modal.id = 'frame-picker';
  modal.className = 'fixed inset-0 z-[210] flex items-end bg-black/70 p-4 backdrop-blur-sm';
  modal.setAttribute('aria-labelledby', 'frame-picker-title');
  modal.innerHTML = `<section class="mx-auto flex w-full max-w-md max-h-[85vh] flex-col rounded-3xl mol-dialog-surface p-6"><div class="mx-auto h-1.5 w-11 shrink-0 rounded-full bg-white/20"></div><h2 id="frame-picker-title" class="mt-5 shrink-0 text-lg font-extrabold">Moldura do avatar</h2><p class="mt-1 shrink-0 text-sm text-gray-400">Desbloqueadas conforme você completa treinos.</p><div class="mt-5 grid gap-2 overflow-y-auto" role="group" aria-label="Molduras do perfil">${optionsHTML}</div><button type="button" data-close class="mt-6 min-h-12 w-full shrink-0 rounded-2xl mol-soft font-bold text-gray-300">Fechar</button></section>`;
  document.body.appendChild(modal);
  const close = activateDialog(modal, { initialFocus: modal.querySelector('[data-close]') });
  modal.onclick = event => { if (event.target === modal) close(); };
  modal.querySelector('[data-close]').onclick = close;
  modal.querySelectorAll('[data-frame]:not(:disabled)').forEach(button => button.onclick = async () => {
    const frameId = button.dataset.frame;
    currentProfile = { ...currentProfile, avatarFrame: frameId };
    applyAvatarFrame(frameId);
    close();
    try { await setDoc(doc(db, 'users', currentAccount.uid), { avatarFrame: frameId }, { merge: true }); }
    catch (error) { console.warn('Moldura não salva:', error.message); }
  });
  renderIcons();
}

$('change-frame')?.addEventListener('click', openFrameModal);

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

/** Resumo no topo do perfil: treinos concluídos, meta semanal e peso atual contra a meta. */
function renderStats(profile = {}, latestWeight = null) {
  const number = value => Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 1 });
  $('stat-workouts').textContent = Number.isFinite(completedWorkouts) ? number(completedWorkouts) : '—';
  $('stat-goal').textContent = Number(profile.metaSemanal) > 0 ? `${profile.metaSemanal}×/sem` : '—';
  const goal = Number(profile.metaPesoKg) > 0 ? ` → ${number(profile.metaPesoKg)}` : '';
  $('stat-weight').textContent = latestWeight ? `${number(latestWeight)} kg${goal}` : '—';
}

async function loadProfile(account) {
  currentAccount = account;
  const cachedProfile = safeJSON(getSessionItem(profileCacheKey(account.uid)), {});
  renderIdentity(account, cachedProfile);
  applyProfileModules(cachedProfile);
  setPageReady();

  try {
    const [snapshot, sessionsSnapshot, weightsSnapshot] = await Promise.all([
      withTimeout(getDoc(doc(db, 'users', account.uid)), 'O perfil'),
      withTimeout(getCountFromServer(query(collection(db, 'sessoes'), where('userId', '==', account.uid))), 'As conquistas'),
      withTimeout(getDocs(query(collection(db, 'pesos'), where('userId', '==', account.uid))), 'Os pesos').catch(() => null)
    ]);
    const profile = snapshot.exists() ? snapshot.data() : {};
    completedWorkouts = sessionsSnapshot.data().count;
    setSessionItem(profileCacheKey(account.uid), JSON.stringify(profile));
    applyProfileModules(profile);
    renderIdentity(account, profile);
    renderStats(profile, weightsSnapshot ? recentWeightTrend(weightsSnapshot.docs.map(item => item.data())).last?.pesoKg : null);
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
