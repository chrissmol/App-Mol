import { getDb } from '../config/firebase-config.js';
const db = await getDb();
import { withTimeout } from '../utils/timeout.js';
import { watchProtectedPage } from '../modules/auth.js';
import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { setButtonLoading, showToast } from '../utils/ui.js';
import { setupAppShell } from '../utils/app-shell.js';
import { parsePersonalData } from '../modules/personal-data.js';
import { recentWeightTrend } from '../modules/dashboard-analytics.js';
import { ACTIVITY_LEVELS, normalizeActivity, calculateNutritionGoals, goalSummaryHTML, missingGoalInputs, paceApplies } from '../modules/nutrition-goals.js';
import { getSessionItem, removeSessionItems, setSessionItem } from '../utils/storage.js';
import { applyUnitLabels, weightUnit, fromDisplayLength, fromDisplayWeight, toDisplayLength, toDisplayWeight } from '../utils/units.js';

setupAppShell();
applyUnitLabels();

// any: cada tela sabe o tipo do elemento (input, button...) que busca por id.
const $ = id => /** @type {any} */ (document.getElementById(id));
if (weightUnit() === 'lb') Object.entries({ height: 'Ex.: 69', 'current-weight': 'Ex.: 176', 'goal-weight': 'Ex.: 165' }).forEach(([id, text]) => { $(id).placeholder = text; });
let currentUser;
let currentProfile = {};
let latestWeight = null;

$('activity').insertAdjacentHTML('beforeend', ACTIVITY_LEVELS.map(level => `<option value="${level.id}">${level.label}</option>`).join(''));
const profileCacheKey = uid => `mol-profile-cache-${uid}`;

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
    retry.className = 'mt-3 block min-h-11 w-full rounded-xl bg-white/5 text-sm font-bold text-white';
    retry.textContent = 'Tentar novamente';
    retry.onclick = loadProfile;
    $('page-status').append(text, retry);
  }
}

// Altura é gravada em cm inteiro; vazio continua vazio para o validador.
const heightCm = () => { const cm = fromDisplayLength($('height').value); return cm === '' ? '' : Math.round(Number(cm)); };

function goalInputs() {
  return { sexo: $('sex').value, nascimento: $('birth').value, alturaCm: Number(heightCm()), pesoKg: Number(fromDisplayWeight($('current-weight').value)), nivelAtividade: $('activity').value, treinosSemana: Number($('weekly').value) || 0, objetivo: $('goal').value, ritmoMetaKg: Number($('pace').value) || null };
}

function renderGoal() {
  $('pace-field').classList.toggle('hidden', !paceApplies($('goal').value));
  const inputs = goalInputs();
  $('goal-result-body').innerHTML = goalSummaryHTML(calculateNutritionGoals(inputs), missingGoalInputs(inputs));
}

async function loadLatestWeight() {
  try {
    const snapshot = await withTimeout(getDocs(query(collection(db, 'pesos'), where('userId', '==', currentUser.uid))), 'Os pesos');
    latestWeight = recentWeightTrend(snapshot.docs.map(item => item.data())).last?.pesoKg ?? null;
    if (latestWeight && !$('current-weight').value) $('current-weight').value = toDisplayWeight(latestWeight);
    renderGoal();
  } catch (error) { console.warn('Peso atual não carregado:', error.message); }
}

function fillProfile(profile) {
  $('sex').value = ['masculino', 'feminino'].includes(profile.sexo) ? profile.sexo : '';
  $('birth').value = /^\d{4}-\d{2}-\d{2}$/.test(profile.nascimento || '') ? profile.nascimento : '';
  $('activity').value = ACTIVITY_LEVELS.some(level => level.id === normalizeActivity(profile.nivelAtividade)) ? normalizeActivity(profile.nivelAtividade) : '';
  $('height').value = Number(profile.alturaCm) > 0 ? toDisplayLength(profile.alturaCm) : '';
  $('goal-weight').value = Number(profile.metaPesoKg) > 0 ? toDisplayWeight(profile.metaPesoKg) : '';
  $('goal').value = ['Hipertrofia', 'Força', 'Emagrecimento', 'Saúde'].includes(profile.objetivo) ? profile.objetivo : '';
  $('pace').value = [0.25, 0.5].includes(profile.ritmoMetaKg) ? String(profile.ritmoMetaKg) : '';
  $('weekly').value = Number(profile.metaSemanal) >= 1 && Number(profile.metaSemanal) <= 7 ? profile.metaSemanal : '';
  renderGoal();
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
    data = parsePersonalData({ sex: $('sex').value, birth: $('birth').value, activity: $('activity').value, height: heightCm(), goalWeight: fromDisplayWeight($('goal-weight').value), goal: $('goal').value, weekly: $('weekly').value, pace: paceApplies($('goal').value) ? $('pace').value : '' });
  } catch (error) { return showToast(error.message); }
  const weightText = String($('current-weight').value).trim();
  const weight = Number(fromDisplayWeight(weightText));
  if (weightText && !(weight >= 20 && weight <= 400)) return showToast('O peso atual deve estar entre 20 e 400 kg.');
  const goals = calculateNutritionGoals(goalInputs());
  if (goals) Object.assign(data, { metaCalorias: goals.kcal, dailyCalorieGoal: goals.kcal, macroGoals: goals.macroGoals });
  const button = $('save');
  setButtonLoading(button, true);
  try {
    await setDoc(doc(db, 'users', currentUser.uid), data, { merge: true });
    if (weightText && toDisplayWeight(weight) !== toDisplayWeight(latestWeight)) {
      await addDoc(collection(db, 'pesos'), { userId: currentUser.uid, pesoKg: weight, registradoEm: serverTimestamp() });
      latestWeight = weight;
    }
    currentProfile = { ...currentProfile, ...data };
    removeSessionItems(`mol-profile-cache-${currentUser.uid}`, `mol-profile-dashboard-${currentUser.uid}`);
    showToast(goals ? `Dados salvos. Meta diária: ${goals.kcal.toLocaleString('pt-BR')} kcal.` : 'Dados salvos.', 'success');
  } catch (error) {
    console.error('Dados pessoais não salvos:', error);
    showToast('Não foi possível salvar seus dados.');
  } finally { setButtonLoading(button, false); }
};

['sex', 'birth', 'height', 'current-weight', 'activity', 'weekly', 'goal', 'pace'].forEach(id => $(id).addEventListener('input', renderGoal));

watchProtectedPage(user => {
  currentUser = user;
  loadProfile();
  loadLatestWeight();
});

window.lucide?.createIcons();
