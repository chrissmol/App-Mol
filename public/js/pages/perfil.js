import { auth, db } from '../config/firebase-config.js';
import { signOut } from 'firebase/auth';
import { watchProtectedPage } from '../modules/auth.js';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { confirmAction, setButtonLoading, showToast } from '../utils/ui.js';
import { setupAppShell } from '../utils/app-shell.js';
import { avatarTier, formatTrainingTime, profileMilestone, profileStats, readProfileCache } from '../modules/profile-analytics.js';
import { getSessionItem, setSessionItem } from '../utils/storage.js';

setupAppShell();
const $ = id => document.getElementById(id);
const renderIcons = () => window.lucide?.createIcons();
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
  $('admin-link')?.classList.toggle('hidden', String(account.email || '').toLowerCase() !== 'chrisouzamol@gmail.com');
  $('admin-link')?.classList.toggle('flex', String(account.email || '').toLowerCase() === 'chrisouzamol@gmail.com');
}

function renderStats(stats) {
  const tier = avatarTier(stats.workouts);
  const frame = $('avatar-frame');
  if (frame) { frame.className = frame.className.replace(/avatar-frame--\w+/g, '').trim() + ` avatar-frame--${tier.id}`; frame.setAttribute('aria-label', `Moldura de ${tier.label}`); }
  $('journey-workouts').textContent = stats.workouts;
  $('journey-sets').textContent = stats.sets.toLocaleString('pt-BR');
  $('journey-volume').textContent = Math.round(stats.volume).toLocaleString('pt-BR');
  $('journey-time').textContent = formatTrainingTime(stats.seconds);
  $('consistency-title').textContent = `${stats.weekly} de ${stats.goal} treino${stats.goal === 1 ? '' : 's'} nesta semana`;
  $('consistency-progress').style.width = `${stats.percent}%`;
  $('consistency-message').textContent = stats.weekly >= stats.goal ? `Meta semanal concluída. ${profileMilestone(stats.workouts)}` : `${stats.goal - stats.weekly} treino${stats.goal - stats.weekly === 1 ? '' : 's'} para concluir a meta. ${profileMilestone(stats.workouts)}`;
  $('profile-content').classList.remove('hidden');
  renderIcons();
}

function setReady(message = '') {
  $('profile-status').classList.toggle('hidden', !message);
  if (message) $('profile-status').textContent = message;
  document.body.setAttribute('aria-busy', 'false');
}

async function loadProfile(account) {
  renderIdentity(account);
  const cacheKey = `mol-profile-cache-${account.uid}`;
  const cached = readProfileCache(getSessionItem(cacheKey));
  if (cached) renderStats(cached);

  const profilePromise = withTimeout(getDoc(doc(db, 'users', account.uid)), 'O perfil');
  const sessionsPromise = cached ? null : withTimeout(getDocs(query(collection(db, 'sessoes'), where('userId', '==', account.uid))), 'O histórico');
  const [profileResult, sessionsResult] = await Promise.allSettled([profilePromise, sessionsPromise]);
  const profile = profileResult.status === 'fulfilled' && profileResult.value.exists() ? profileResult.value.data() : {};
  renderIdentity(account, profile);
  if (cached) {
    const goal = Math.max(1, Math.min(7, Number(profile.metaSemanal) || cached.goal || 3));
    renderStats({ ...cached, goal, percent: Math.min(100, Math.round((cached.weekly / goal) * 100)) });
  }

  if (!cached && sessionsResult.status === 'fulfilled' && sessionsResult.value) {
    const stats = profileStats(sessionsResult.value.docs.map(item => item.data()), profile.metaSemanal || 3);
    setSessionItem(cacheKey, JSON.stringify({ savedAt: Date.now(), stats }));
    renderStats(stats);
  }

  const profileFailed = profileResult.status === 'rejected';
  const sessionsFailed = !cached && sessionsResult.status === 'rejected';
  if (!cached && sessionsFailed) renderStats(profileStats([], profile.metaSemanal || 3));
  if (profileFailed || sessionsFailed) setReady('Alguns dados não puderam ser atualizados. Confira sua conexão e tente novamente mais tarde.');
  else setReady();
}

watchProtectedPage(account => {
  loadProfile(account).catch(error => {
    console.error('Perfil não carregado:', error);
    renderIdentity(account);
    renderStats(profileStats([], 3));
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
