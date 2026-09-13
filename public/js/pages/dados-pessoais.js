import { db } from '../config/firebase-config.js';
import { watchProtectedPage } from '../modules/auth.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { setButtonLoading, showToast } from '../utils/ui.js';
import { setupAppShell } from '../utils/app-shell.js';
import { parsePersonalData } from '../modules/personal-data.js';
import { getSessionItem, removeSessionItems, setSessionItem } from '../utils/storage.js';

setupAppShell();

const $ = id => document.getElementById(id);
let currentUser;
let currentProfile = {};
const profileCacheKey = uid => `mol-profile-cache-${uid}`;
function withTimeout(promise, label, milliseconds = 9000) {
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

function setPageState(state, message = '') {
  $('page-status').classList.toggle('hidden', state === 'ready');
  $('personal-content').classList.toggle('hidden', state !== 'ready');
  if (state !== 'ready') $('page-status').innerHTML = '';
  if (state === 'loading') $('page-status').textContent = message || 'Carregando seus dados...';
  if (state === 'error') {
    const text = document.createElement('span');
    text.textContent = message || 'Não foi possível carregar seus dados.';
    const retry = document.createElement('button');
    retry.type = 'button';
    retry.className = 'mt-3 block min-h-10 w-full rounded-xl bg-white/5 text-sm font-bold text-white';
    retry.textContent = 'Tentar novamente';
    retry.onclick = loadProfile;
    $('page-status').append(text, retry);
  }
}

function fillProfile(profile) {
  $('height').value = Number(profile.alturaCm) > 0 ? profile.alturaCm : '';
  $('goal-weight').value = Number(profile.metaPesoKg) > 0 ? profile.metaPesoKg : '';
  $('goal').value = ['Hipertrofia', 'Força', 'Emagrecimento', 'Saúde'].includes(profile.objetivo) ? profile.objetivo : '';
  $('weekly').value = Number(profile.metaSemanal) >= 1 && Number(profile.metaSemanal) <= 7 ? profile.metaSemanal : '';
}

async function loadProfile() {
  if (!currentUser) return;
  const cachedProfile = safeJSON(getSessionItem(profileCacheKey(currentUser.uid)), null);
  if (cachedProfile && typeof cachedProfile === 'object') {
    currentProfile = cachedProfile;
    fillProfile(currentProfile);
    setPageState('ready');
  } else {
    setPageState('loading');
  }
  try {
    const snapshot = await withTimeout(getDoc(doc(db, 'users', currentUser.uid)), 'O perfil');
    currentProfile = snapshot.data() || {};
    setSessionItem(profileCacheKey(currentUser.uid), JSON.stringify(currentProfile));
    fillProfile(currentProfile);
    setPageState('ready');
  } catch (error) {
    console.error('Dados pessoais não carregados:', error);
    if (cachedProfile) setPageState('ready');
    else setPageState('error', 'Não foi possível carregar seu perfil agora.');
  }
}

$('save').onclick = async () => {
  if (!currentUser) return showToast('Aguarde o carregamento da conta.');
  let data;
  try {
    data = parsePersonalData({ height: $('height').value, goalWeight: $('goal-weight').value, goal: $('goal').value, weekly: $('weekly').value });
  } catch (error) { return showToast(error.message); }
  const button = $('save');
  setButtonLoading(button, true);
  try {
    await setDoc(doc(db, 'users', currentUser.uid), data, { merge: true });
    currentProfile = { ...currentProfile, ...data };
    removeSessionItems(`mol-profile-cache-${currentUser.uid}`);
    showToast('Dados salvos.', 'success');
  } catch (error) {
    console.error('Dados pessoais não salvos:', error);
    showToast('Não foi possível salvar seus dados.');
  } finally { setButtonLoading(button, false); }
};

watchProtectedPage(user => {
  currentUser = user;
  loadProfile();
});

window.lucide?.createIcons();
