import { db } from '../config/firebase-config.js';
import { watchProtectedPage } from '../modules/auth.js';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { setupAppShell } from '../utils/app-shell.js';
import { activateDialog, confirmAction, escapeHTML, setButtonLoading, showToast } from '../utils/ui.js';
import { dateFrom, monthCalendar, workoutStats } from '../modules/evolution-analytics.js';
import { profileAchievements } from '../modules/profile-analytics.js';
import { getSessionItem, removeSessionItems, setSessionItem } from '../utils/storage.js';

setupAppShell();

const $ = id => document.getElementById(id);
let currentUser;
let currentGoal = 3;
let latestProfile = {};
let sessions = [];
let weights = [];
let activeDays = new Set();
let now = new Date();
let visibleMonth = new Date(now.getFullYear(), now.getMonth(), 1);
let selectedCalendarDay = null;
const evolutionCacheKey = uid => `mol-evolution-cache-${uid}`;
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

function applyEvolutionData(data = {}) {
  latestProfile = data.profile || {};
  currentGoal = Math.max(1, Math.min(7, Number(latestProfile.metaSemanal) || 3));
  sessions = Array.isArray(data.sessions) ? data.sessions : [];
  weights = Array.isArray(data.weights) ? data.weights : [];
  renderAll();
  setPageState('ready');
}

function setPageState(state, message = '') {
  $('page-status').classList.toggle('hidden', state === 'ready');
  $('evolution-content').classList.toggle('hidden', state !== 'ready');
  if (state !== 'ready') $('page-status').innerHTML = '';
  if (state === 'loading') $('page-status').textContent = message || 'Carregando sua evolução…';
  if (state === 'error') {
    const text = document.createElement('span');
    text.textContent = message || 'Não foi possível carregar sua evolução.';
    const retry = document.createElement('button');
    retry.type = 'button';
    retry.className = 'mt-3 block min-h-10 w-full rounded-xl bg-white/5 text-sm font-bold text-white';
    retry.textContent = 'Tentar novamente';
    retry.onclick = load;
    $('page-status').append(text, retry);
  }
}

function renderGoal(stats) {
  const done = stats.weekly;
  const percent = Math.min(100, Math.round((done / currentGoal) * 100));
  $('weekly-goal').textContent = currentGoal;
  $('goal-summary').textContent = `${done} de ${currentGoal} treino${currentGoal === 1 ? '' : 's'}`;
  $('week-percent').textContent = `${percent}%`;
  $('goal-progress').style.width = `${percent}%`;
  $('goal-message').textContent = done >= currentGoal ? 'Meta da semana concluída. Mantenha o ritmo.' : `Faltam ${currentGoal - done} treino${currentGoal - done === 1 ? '' : 's'} nesta semana.`;
  $('streak').textContent = `${stats.streak} semana${stats.streak === 1 ? '' : 's'}`;
  $('workout-total').textContent = stats.sessions;
  $('series-total').textContent = `${stats.series} ${stats.series === 1 ? 'série concluída' : 'séries concluídas'}`;
  $('goal-down').disabled = currentGoal <= 1;
  $('goal-up').disabled = currentGoal >= 7;
  $('goal-down').classList.toggle('opacity-30', currentGoal <= 1);
  $('goal-up').classList.toggle('opacity-30', currentGoal >= 7);
}

function renderCalendar() {
  const calendar = monthCalendar(visibleMonth, activeDays, now);
  $('calendar-title').textContent = visibleMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const isCurrent = visibleMonth.getFullYear() === now.getFullYear() && visibleMonth.getMonth() === now.getMonth();
  $('next-month').disabled = isCurrent;
  $('next-month').classList.toggle('opacity-30', isCurrent);
  const blanks = Array.from({ length: calendar.leadingBlanks }, () => '<span aria-hidden="true"></span>');
  const days = calendar.days.map(item => `<button type="button" data-calendar-day="${item.day}" ${item.trained ? '' : 'disabled'} class="flex aspect-square items-center justify-center rounded-lg text-xs ${item.trained ? 'bg-neon font-extrabold text-black' : 'bg-white/5 text-gray-400'} ${item.today && !item.trained ? 'ring-1 ring-neon' : ''} ${selectedCalendarDay === item.day ? 'ring-2 ring-white ring-offset-1 ring-offset-[#070a08]' : ''}" aria-label="${item.day}${item.trained ? ', treino concluído' : ', sem treino'}${item.today ? ', hoje' : ''}" aria-pressed="${selectedCalendarDay === item.day}">${item.day}</button>`);
  $('calendar').innerHTML = [...blanks, ...days].join('');
  $('calendar').querySelectorAll('[data-calendar-day]').forEach(button => button.onclick = () => { selectedCalendarDay = Number(button.dataset.calendarDay); renderCalendar(); renderCalendarSummary(); });
  renderCalendarSummary();
}

function renderCalendarSummary() {
  const summary = $('calendar-day-summary');
  if (!summary) return;
  if (!selectedCalendarDay) { summary.textContent = 'Selecione um dia com treino.'; return; }
  const date = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), selectedCalendarDay);
  const daySessions = sessions.filter(session => { const value = dateFrom(session.concluidoEm); return value && value.getFullYear() === date.getFullYear() && value.getMonth() === date.getMonth() && value.getDate() === date.getDate(); });
  const series = daySessions.reduce((total, session) => total + (session.exercicios || []).reduce((sum, exercise) => sum + (exercise.series || []).filter(set => set.concluida === true).length, 0), 0);
  const volume = daySessions.reduce((total, session) => total + (Number(session.volumeTotal) || 0), 0);
  summary.textContent = `${selectedCalendarDay} de ${date.toLocaleDateString('pt-BR', { month: 'long' })} · ${daySessions.length} ${daySessions.length === 1 ? 'treino' : 'treinos'} · ${series} séries · ${Math.round(volume).toLocaleString('pt-BR')} kg`;
}

function renderBadges(stats) {
  const badges = profileAchievements({ workouts: stats.sessions, sets: stats.series, volume: stats.volume, seconds: stats.seconds, weekly: stats.weekly, goal: currentGoal, streak: stats.streak, activeDays: stats.activeDays.size });
  const unlocked = badges.filter(badge => badge.unlocked);
  $('badges-count').textContent = `${unlocked.length} de ${badges.length} desbloqueadas`;
  $('badges').innerHTML = badges.map(badge => `<article class="rounded-2xl border p-3 ${badge.unlocked ? 'border-neon/40 bg-neon/10' : 'border-white/10 bg-white/[.03] opacity-60'}"><span class="relative flex h-8 w-8 items-center justify-center rounded-xl ${badge.unlocked ? 'bg-neon text-black' : 'bg-white/10 text-gray-500'}"><i data-lucide="${badge.icon}" class="h-4 w-4"></i>${!badge.unlocked ? '<i data-lucide="lock-keyhole" class="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-black p-0.5 text-gray-300"></i>' : ''}</span><strong class="mt-2 block text-sm">${badge.title}</strong><p class="mt-1 text-xs text-gray-500">${badge.unlocked ? 'Conquista desbloqueada.' : badge.description}</p>${!badge.unlocked ? `<p class="mt-2 text-[10px] font-semibold text-gray-500">${badge.progressLabel}</p><div class="mt-1 h-1 overflow-hidden rounded-full bg-white/10"><div class="h-full rounded-full bg-neon/70" style="width:${Math.round(badge.progress * 100)}%"></div></div>` : ''}</article>`).join('');
  window.lucide?.createIcons();
}

function sortedWeights() {
  return [...weights].filter(item => {
    const date = dateFrom(item.registradoEm);
    const value = Number(item.pesoKg);
    return Number.isFinite(value) && value >= 20 && value <= 400 && date && date <= now;
  }).sort((a, b) => dateFrom(a.registradoEm) - dateFrom(b.registradoEm));
}

function renderWeight() {
  const ordered = sortedWeights();
  const last = ordered.at(-1);
  $('last-weight').textContent = last ? `${Number(last.pesoKg).toLocaleString('pt-BR')} kg` : '— kg';
  $('weight-change').textContent = ordered.length > 1 ? `${(Number(last.pesoKg) - Number(ordered[0].pesoKg)).toLocaleString('pt-BR', { signDisplay: 'always', maximumFractionDigits: 1 })} kg desde o primeiro registro.` : 'Registre o primeiro peso para acompanhar.';
  const trend = $('weight-trend');
  if (trend) {
    const lastItems = ordered.slice(-12);
    const values = lastItems.map(item => Number(item.pesoKg));
    const min = Math.min(...values);
    const max = Math.max(...values);
    trend.innerHTML = lastItems.length > 1
      ? lastItems.map(item => {
        const value = Number(item.pesoKg);
        const pct = max === min ? 55 : 22 + ((value - min) / (max - min)) * 78;
        return `<span class="flex-1 rounded-t-lg bg-neon/70" style="height:${pct}%" title="${value.toLocaleString('pt-BR')} kg"></span>`;
      }).join('')
      : '<p class="self-center text-xs text-gray-500">A tendência aparece após mais registros.</p>';
  }
  if (!ordered.length) {
    $('history').innerHTML = '<p class="text-sm text-gray-500">Sem registros.</p>';
    return;
  }
  $('history').innerHTML = ordered.reverse().map(item => `<article class="flex items-center justify-between gap-3 rounded-xl bg-white/5 p-3"><div><strong class="text-sm">${Number(item.pesoKg).toLocaleString('pt-BR')} kg</strong><p class="mt-1 text-xs text-gray-500">${dateFrom(item.registradoEm)?.toLocaleDateString('pt-BR') || 'agora'}</p></div><div class="flex gap-1"><button type="button" data-edit-weight="${escapeHTML(item.id)}" class="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5" aria-label="Editar peso"><i data-lucide="pencil" class="h-4 w-4"></i></button><button type="button" data-delete-weight="${escapeHTML(item.id)}" class="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-red-300" aria-label="Excluir peso"><i data-lucide="trash-2" class="h-4 w-4"></i></button></div></article>`).join('');
  window.lucide?.createIcons();
}

function renderBodyComparison() {
  const ordered = sortedWeights();
  const start = Number(ordered[0]?.pesoKg);
  const current = Number(ordered.at(-1)?.pesoKg);
  const target = Number(latestProfile.metaPesoKg);
  $('body-start').textContent = Number.isFinite(start) ? `${start.toLocaleString('pt-BR')} kg` : '—';
  $('body-current').textContent = Number.isFinite(current) ? `${current.toLocaleString('pt-BR')} kg` : '—';
  $('body-target').textContent = Number.isFinite(target) && target > 0 ? `${target.toLocaleString('pt-BR')} kg` : '—';
  if (!Number.isFinite(current) || !Number.isFinite(target) || target <= 0) {
    $('body-status').textContent = 'Sem meta';
    $('body-summary').textContent = 'Registre o peso e uma meta no perfil para ver sua trajetória.';
    return;
  }
  const difference = target - current;
  const reached = Math.abs(difference) < 0.1;
  $('body-status').textContent = reached ? 'Meta atingida' : `${Math.abs(difference).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg`;
  const height = Number(latestProfile.alturaCm);
  const bmi = height > 0 ? current / ((height / 100) ** 2) : null;
  $('body-summary').textContent = reached ? 'Você atingiu a meta de peso registrada.' : `${difference > 0 ? 'Faltam' : 'Você está'} ${Math.abs(difference).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg ${difference > 0 ? 'para chegar à meta.' : 'além da meta.'}${bmi ? ` IMC atual: ${bmi.toFixed(1)}.` : ''}`;
}

function measureValue(value) {
  const parsed = Number(String(value ?? '').replace(',', '.'));
  return Number.isFinite(parsed) && parsed >= 20 && parsed <= 250 ? parsed : null;
}

function measurementHistory() {
  const keys = ['waist', 'chest', 'arm', 'hip'];
  return (Array.isArray(latestProfile.medidasHistorico) ? latestProfile.medidasHistorico : []).filter(item => {
    const date = dateFrom(item?.registradoEm);
    return item && typeof item === 'object' && date && date <= now && keys.some(key => measureValue(item[key]) !== null);
  }).sort((a, b) => dateFrom(a.registradoEm) - dateFrom(b.registradoEm));
}

function lastMeasure(history, key) {
  for (const item of [...history].reverse()) {
    const value = measureValue(item[key]);
    if (value !== null) return value;
  }
  return null;
}

function renderMeasurements() {
  const history = measurementHistory();
  const fields = [['waist', 'measure-waist', 'Cintura'], ['chest', 'measure-chest', 'Peito'], ['arm', 'measure-arm', 'Braço'], ['hip', 'measure-hip', 'Quadril']];
  fields.forEach(([key, input]) => { $(input).value = lastMeasure(history, key) ?? ''; });
  const changes = fields.map(([key, , label]) => {
    const first = history.map(item => measureValue(item[key])).find(value => value !== null);
    const last = lastMeasure(history, key);
    if (first === undefined || last === null) return null;
    const delta = Number(last) - Number(first);
    return `${label}: ${delta.toLocaleString('pt-BR', { signDisplay: 'always', maximumFractionDigits: 1 })} cm`;
  }).filter(Boolean);
  $('measurement-summary').textContent = changes.length ? `Desde a primeira medição — ${changes.join(' · ')}.` : 'Registre uma primeira medida para acompanhar as mudanças.';
  const recent = history.slice(-5).reverse();
  $('measure-history').innerHTML = recent.length ? `<p class="text-xs font-bold text-gray-400">Últimos registros</p>${recent.map(record => {
    const values = fields.map(([key, , label]) => { const value = measureValue(record[key]); return value !== null ? `${label} ${value.toLocaleString('pt-BR')} cm` : null; }).filter(Boolean);
    const date = dateFrom(record.registradoEm)?.toLocaleDateString('pt-BR') || 'Data não informada';
    return `<div class="rounded-xl bg-white/5 p-3"><p class="text-xs font-semibold">${date}</p><p class="mt-1 text-xs text-gray-500">${values.join(' · ')}</p></div>`;
  }).join('')}` : '';
}

function renderAll() {
  now = new Date();
  const stats = workoutStats(sessions, currentGoal, now);
  activeDays = stats.activeDays;
  renderGoal(stats);
  renderCalendar();
  renderBadges(stats);
  renderWeight();
  renderBodyComparison();
  renderMeasurements();

}

async function load() {
  if (!currentUser) return;
  const cached = safeJSON(getSessionItem(evolutionCacheKey(currentUser.uid)), null);
  if (cached && typeof cached === 'object') applyEvolutionData(cached);
  else setPageState('loading');
  try {
    const [profileSnapshot, weightSnapshot, sessionSnapshot] = await Promise.all([
      withTimeout(getDoc(doc(db, 'users', currentUser.uid)), 'O perfil'),
      withTimeout(getDocs(query(collection(db, 'pesos'), where('userId', '==', currentUser.uid))), 'Os pesos'),
      withTimeout(getDocs(query(collection(db, 'sessoes'), where('userId', '==', currentUser.uid))), 'As sessões')
    ]);
    const data = {
      profile: profileSnapshot.data() || {},
      sessions: sessionSnapshot.docs.map(item => ({ id: item.id, ...item.data() })),
      weights: weightSnapshot.docs.map(item => ({ id: item.id, ...item.data() }))
    };
    setSessionItem(evolutionCacheKey(currentUser.uid), JSON.stringify(data));
    applyEvolutionData(data);
  } catch (error) {
    console.error('Não foi possível carregar evolução:', error);
    if (cached) setPageState('ready');
    else setPageState('error', 'Não foi possível carregar seus dados agora.');
  }
}

async function saveGoal(change) {
  if (!currentUser) return showToast('Aguarde o carregamento da conta.');
  const previous = currentGoal;
  currentGoal = Math.max(1, Math.min(7, currentGoal + change));
  if (currentGoal === previous) return;
  renderGoal(workoutStats(sessions, currentGoal));
  $('goal-down').disabled = $('goal-up').disabled = true;
  try {
    await setDoc(doc(db, 'users', currentUser.uid), { metaSemanal: currentGoal }, { merge: true });
    latestProfile.metaSemanal = currentGoal;
    removeSessionItems(`mol-profile-cache-${currentUser.uid}`);
    showToast('Meta semanal atualizada.', 'success');
  } catch (error) {
    currentGoal = previous;
    showToast('Não foi possível atualizar a meta.');
  } finally { renderGoal(workoutStats(sessions, currentGoal)); }
}

function requestWeight(title, initial = '') {
  return new Promise(resolve => {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-[1000] flex items-end bg-black/70 p-4 backdrop-blur-sm sm:items-center sm:justify-center';
    modal.setAttribute('aria-labelledby', 'weight-dialog-title');
    modal.setAttribute('aria-describedby', 'weight-dialog-description');
    modal.innerHTML = `<section class="w-full max-w-sm rounded-3xl mol-dialog-surface p-6"><h2 id="weight-dialog-title" class="text-lg font-bold">${title}</h2><p id="weight-dialog-description" class="mt-2 text-sm text-gray-400">Informe um valor entre 20 e 400 kg.</p><input data-value inputmode="decimal" class="mt-5 min-h-12 w-full rounded-xl mol-field px-4 text-white" aria-label="Peso em quilogramas"><div class="mt-5 grid grid-cols-2 gap-3"><button type="button" data-cancel class="rounded-xl mol-soft py-3 text-sm font-bold">Cancelar</button><button type="button" data-confirm class="rounded-xl bg-neon py-3 text-sm font-bold text-black">Salvar</button></div></section>`;
    document.body.appendChild(modal);
    const input = modal.querySelector('[data-value]');
    input.value = initial;
    let closeDialog;
    const close = value => { closeDialog(); resolve(value); };
    closeDialog = activateDialog(modal, { initialFocus: input, onCancel: () => close(null) });
    modal.querySelector('[data-cancel]').onclick = () => close(null);
    modal.querySelector('[data-confirm]').onclick = () => close(input.value);
    input.onkeydown = event => { if (event.key === 'Enter') { event.preventDefault(); close(input.value); } };
    modal.onclick = event => { if (event.target === modal) close(null); };
  });
}

watchProtectedPage(user => {
  currentUser = user;
  load();
});

$('goal-down').onclick = () => saveGoal(-1);
$('goal-up').onclick = () => saveGoal(1);
$('previous-month').onclick = () => { visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1); selectedCalendarDay = null; renderCalendar(); };
$('next-month').onclick = () => { if (!$('next-month').disabled) { visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1); selectedCalendarDay = null; renderCalendar(); } };

$('save').onclick = async () => {
  if (!currentUser) return showToast('Aguarde o carregamento da conta.');
  const value = Number(String($('weight').value).replace(',', '.'));
  if (!Number.isFinite(value) || value < 20 || value > 400) return showToast('Informe um peso entre 20 e 400 kg.');
  const button = $('save');
  setButtonLoading(button, true);
  try {
    await addDoc(collection(db, 'pesos'), { userId: currentUser.uid, pesoKg: value, registradoEm: serverTimestamp() });
    $('weight').value = '';
    await load();
    showToast('Peso registrado.', 'success');
  } catch (error) {
    showToast('Não foi possível registrar o peso.');
  } finally { setButtonLoading(button, false); }
};

$('history').onclick = async event => {
  const editId = event.target.closest('[data-edit-weight]')?.dataset.editWeight;
  const deleteId = event.target.closest('[data-delete-weight]')?.dataset.deleteWeight;
  if (editId) {
    const item = weights.find(weight => weight.id === editId);
    const response = await requestWeight('Editar peso', item?.pesoKg ?? '');
    if (response === null) return;
    const value = Number(String(response).replace(',', '.'));
    if (!Number.isFinite(value) || value < 20 || value > 400) return showToast('Informe um peso entre 20 e 400 kg.');
    try { await updateDoc(doc(db, 'pesos', editId), { pesoKg: value }); await load(); showToast('Peso atualizado.', 'success'); }
    catch { showToast('Não foi possível atualizar o peso.'); }
  }
  if (deleteId) {
    const confirmed = await confirmAction({ title: 'Excluir este peso?', message: 'O registro será removido do histórico e dos comparativos.', confirmText: 'Excluir', danger: true });
    if (!confirmed) return;
    try { await deleteDoc(doc(db, 'pesos', deleteId)); await load(); showToast('Peso removido.', 'success'); }
    catch { showToast('Não foi possível remover o peso.'); }
  }
};

$('save-measures').onclick = async () => {
  if (!currentUser) return showToast('Aguarde o carregamento da conta.');
  const inputs = [['waist', 'measure-waist'], ['chest', 'measure-chest'], ['arm', 'measure-arm'], ['hip', 'measure-hip']];
  const entered = inputs.filter(([, id]) => $(id).value.trim() !== '');
  if (!entered.length) return showToast('Preencha pelo menos uma medida.');
  const record = { registradoEm: new Date().toISOString() };
  for (const [key, id] of entered) {
    const value = measureValue($(id).value);
    if (value === null) return showToast('As medidas devem estar entre 20 e 250 cm.');
    record[key] = value;
  }
  const history = measurementHistory();
  const button = $('save-measures');
  setButtonLoading(button, true);
  try {
    await setDoc(doc(db, 'users', currentUser.uid), { medidasHistorico: [...history, record].slice(-50) }, { merge: true });
    await load();
    showToast('Medidas registradas.', 'success');
  } catch { showToast('Não foi possível registrar as medidas.'); }
  finally { setButtonLoading(button, false); }
};

window.lucide?.createIcons();
