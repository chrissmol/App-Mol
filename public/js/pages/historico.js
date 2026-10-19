import { getDb } from '../config/firebase-config.js';
const db = await getDb();
import { watchProtectedPage } from '../modules/auth.js';
import { collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { withTimeout } from '../utils/timeout.js';
import { filterHistory, historySummary, sessionsByDay, sortSessionsNewest } from '../modules/history-analytics.js';
import { recordSetKeys, sessionMetrics, workoutDate } from '../modules/workout-analytics.js';
import { confirmAction, escapeHTML, showToast } from '../utils/ui.js';
import { setupAppShell } from '../utils/app-shell.js';
import { getSessionItem, removeSessionItems, setSessionItem } from '../utils/storage.js';

setupAppShell();
// any: cada tela sabe o tipo do elemento (input, button...) que busca por id.
const $ = id => /** @type {any} */ (document.getElementById(id));
const PAGE_SIZE = 15;
const CACHE_TTL = 5 * 60 * 1000;
let currentUser = null;
let visibleMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
let sessions = [];
let selectedDay = null;
let filterByMonth = true;
let visibleLimit = PAGE_SIZE;
let recordKeys = new Set();

const cacheKey = uid => `mol-history-cache-${uid}`;
function readCache(uid) { try { const value = JSON.parse(getSessionItem(cacheKey(uid)) || 'null'); return value && Date.now() - value.updatedAt < CACHE_TTL && Array.isArray(value.sessions) ? value.sessions : null; } catch { return null; } }
function writeCache(uid) { setSessionItem(cacheKey(uid), JSON.stringify({ updatedAt: Date.now(), sessions })); }
function clearCaches() {
  if (!currentUser) return;
  removeSessionItems(cacheKey(currentUser.uid), `mol-progress-cache-${currentUser.uid}`, `mol-profile-cache-${currentUser.uid}`);
}

function formatDuration(seconds) {
  const total = Math.max(0, Math.round(Number(seconds) || 0));
  if (!total) return '';
  if (total < 60) return `${total}s`;
  const minutes = Math.round(total / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60); const remainder = minutes % 60;
  return `${hours}h${remainder ? ` ${remainder}min` : ''}`;
}

function renderSummary() {
  const summary = historySummary(sessions);
  $('total-workouts').textContent = summary.workouts.toLocaleString('pt-BR');
  $('total-workouts-label').textContent = summary.workouts === 1 ? 'sessão registrada' : 'sessões registradas';
  $('total-volume').textContent = `${Math.round(summary.volume).toLocaleString('pt-BR')} kg`;
}

function renderCalendar() {
  const today = new Date();
  const year = visibleMonth.getFullYear(); const month = visibleMonth.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const counts = sessionsByDay(sessions, visibleMonth);
  const monthTotal = [...counts.values()].reduce((sum, count) => sum + count, 0);
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
  $('calendar-title').textContent = visibleMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  $('month-summary').textContent = `${monthTotal} ${monthTotal === 1 ? 'treino concluído' : 'treinos concluídos'}`;
  $('next-month').disabled = isCurrentMonth; $('next-month').classList.toggle('opacity-30', isCurrentMonth);
  const blanks = Array.from({ length: firstWeekday }, () => '<span aria-hidden="true"></span>');
  const days = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1; const count = counts.get(day) || 0;
    const isToday = day === today.getDate() && isCurrentMonth; const active = filterByMonth && selectedDay === day;
    const label = `${day} de ${visibleMonth.toLocaleDateString('pt-BR', { month: 'long' })}${count ? `, ${count} ${count === 1 ? 'treino' : 'treinos'}` : ', nenhum treino'}${isToday ? ', hoje' : ''}`;
    return `<button type="button" data-calendar-day="${day}" ${count ? '' : 'disabled'} class="relative mx-auto flex h-11 w-full max-w-11 min-w-0 items-center justify-center rounded-full text-xs ${count ? 'bg-neon font-bold text-black' : 'text-gray-500'} ${isToday && !count ? 'ring-1 ring-neon' : ''} ${active ? 'ring-2 ring-[color:var(--mol-text)] ring-offset-2 ring-offset-[var(--mol-surface)]' : ''}" aria-label="${label}" aria-pressed="${active}">${day}${count > 1 ? `<span class="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-xs font-extrabold text-black">${count}</span>` : ''}</button>`;
  });
  $('calendar').innerHTML = [...blanks, ...days].join('');
  $('calendar').querySelectorAll('[data-calendar-day]').forEach(button => button.addEventListener('click', () => { selectedDay = Number(button.dataset.calendarDay); filterByMonth = true; visibleLimit = PAGE_SIZE; renderCalendar(); renderSessions(); }));
  $('clear-date-filter').classList.toggle('hidden', !filterByMonth);
}

function setDetailsHTML(session) {
  const displayScaleValue = (value, min, max) => {
    const number = Number(value);
    return Number.isFinite(number) && number >= min && number <= max ? number : '—';
  };
  const exercises = (Array.isArray(session.exercicios) ? session.exercicios : []).slice(0, 60);
  const exerciseHTML = exercises.map((exercise, exerciseIndex) => {
    let normalSetNumber = 0;
    const sets = (Array.isArray(exercise.series) ? exercise.series : []).slice(0, 60).map((set, setIndex) => {
      const record = recordKeys.has(`${session.id}:${exerciseIndex}:${setIndex}`);
      const weightValue = Number(set.kg); const repsValue = Number(set.reps);
      const load = set.kg === '' || set.kg == null || !Number.isFinite(weightValue) || weightValue < 0 ? '—' : `${weightValue.toLocaleString('pt-BR')} kg`;
      const reps = repsValue > 0 && Number.isFinite(repsValue) ? `${repsValue.toLocaleString('pt-BR')} rep.` : '—';
      const rirValue = Number(set.rir);
      const rir = set.rir === '' || set.rir == null || !Number.isFinite(rirValue) || rirValue < 0 || rirValue > 10 ? '' : ` · RIR ${rirValue}`;
      const rawType = String(set.tipo || 'N').toUpperCase();
      const type = ['N', 'W', 'D', 'F'].includes(rawType) ? rawType : 'N';
      const setLabel = type === 'N' ? ++normalSetNumber : escapeHTML(type);
      return `<li class="grid grid-cols-[2.25rem_1fr_auto] items-center gap-2 rounded-xl bg-white/[.04] px-3 py-2 text-xs"><span class="set-type-badge ${type === 'N' ? 'is-normal' : `is-${type.toLowerCase()}`}" aria-label="${type === 'N' ? `Série ${setLabel}` : `Série ${type}`}"${type === 'N' ? '' : ` title="Série ${type}"`}>${setLabel}</span><span class="text-gray-300">${load} × ${reps}${rir}${record ? '<span class="ml-2 inline-flex items-center gap-1 rounded-full bg-neon/10 px-2 py-0.5 text-xs font-bold text-neon"><i data-lucide="trophy" class="h-3 w-3"></i>Recorde</span>' : ''}</span><span class="${set.concluida ? 'text-neon' : 'text-gray-600'}">${set.concluida ? 'Feita' : 'Não realizada'}</span></li>`;
    }).join('');
    return `<section><h4 class="text-sm font-bold">${escapeHTML(exercise.nome || 'Exercício')}</h4><p class="mt-1 text-xs uppercase text-gray-500">${escapeHTML(exercise.grupo || 'Outros')}</p><ul class="mt-2 space-y-1">${sets || '<li class="text-xs text-gray-500">Sem séries registradas.</li>'}</ul></section>`;
  }).join('');
  const checkin = session.checkinPreTreino;
  const checkinHTML = checkin ? `<div class="grid grid-cols-3 gap-2 rounded-2xl bg-white/5 p-3 text-center text-xs"><span>Energia<strong class="mt-1 block text-neon">${displayScaleValue(checkin.energia, 1, 5)}</strong></span><span>Sono<strong class="mt-1 block text-neon">${displayScaleValue(checkin.sono, 1, 5)}</strong></span><span>Dor<strong class="mt-1 block text-neon">${displayScaleValue(checkin.dor, 0, 5)}</strong></span></div>` : '';
  return `${checkinHTML}<div class="mt-4 space-y-5">${exerciseHTML || '<p class="text-sm text-gray-500">Sem exercícios registrados.</p>'}</div>${session.rotinaId ? `<a href="./treino.html?rotina=${encodeURIComponent(session.rotinaId)}" class="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-neon text-sm font-bold text-white"><i data-lucide="play" class="h-4 w-4"></i>Treinar de novo</a>` : ''}<button type="button" data-delete-session="${escapeHTML(session.id)}" class="mt-3 min-h-11 w-full rounded-xl border border-danger/40 bg-danger/10 text-xs font-bold text-danger">Excluir esta sessão</button>`;
}

function sessionCard(session) {
  const metrics = sessionMetrics(session); const date = workoutDate(session);
  const dateLabel = date ? date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Data não informada';
  const timeLabel = date ? date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';
  const details = [`${metrics.sets} ${metrics.sets === 1 ? 'série' : 'séries'}`, `${Math.round(metrics.volume).toLocaleString('pt-BR')} kg`, formatDuration(metrics.durationSeconds)].filter(Boolean).join(' · ');
  return `<article class="glass-card rounded-2xl p-4"><details><summary class="flex cursor-pointer list-none items-start justify-between gap-4"><div class="min-w-0"><h3 class="truncate font-bold">${escapeHTML(session.nomeRotina || 'Treino concluído')}</h3><p class="mt-1 text-xs text-gray-400">${dateLabel}${timeLabel ? ` · ${timeLabel}` : ''}</p><p class="mt-2 text-xs text-gray-500">${details}</p></div><span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neon/10 text-neon"><i data-lucide="chevron-down" class="h-5 w-5"></i></span></summary><div class="mt-4 border-t border-white/5 pt-4">${setDetailsHTML(session)}</div></details></article>`;
}

function filteredSessions() {
  return filterHistory(sessions, { month: filterByMonth ? visibleMonth : null, day: selectedDay, query: $('history-search').value });
}

function bindDeleteActions() {
  $('sessions').querySelectorAll('[data-delete-session]').forEach(button => button.addEventListener('click', async () => {
    const session = sessions.find(item => item.id === button.dataset.deleteSession); if (!session) return;
    const confirmed = await confirmAction({ title: 'Excluir sessão?', message: `${session.nomeRotina || 'Este treino'} será removido permanentemente do histórico.`, confirmText: 'Excluir', danger: true });
    if (!confirmed) return;
    button.disabled = true; button.textContent = 'Excluindo…';
    try {
      await deleteDoc(doc(db, 'sessoes', session.id)); sessions = sessions.filter(item => item.id !== session.id); clearCaches(); writeCache(currentUser.uid); renderAll(); showToast('Sessão excluída.', 'success');
    } catch (error) { console.error('Sessão não excluída:', error); button.disabled = false; button.textContent = 'Excluir esta sessão'; showToast('Não foi possível excluir a sessão.'); }
  }));
}

function renderSessions() {
  const filtered = filteredSessions();
  $('session-count').textContent = `${filtered.length} ${filtered.length === 1 ? 'sessão' : 'sessões'}`;
  if (!sessions.length) {
    $('sessions').innerHTML = '<div class="mol-state"><span class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-neon/10 text-neon"><i data-lucide="calendar-check" class="h-6 w-6"></i></span><h3 class="mol-state-title mt-4">Seu histórico começa no primeiro treino</h3><p class="mol-state-copy">Ao concluir uma sessão, os detalhes aparecerão aqui.</p><a href="./treino.html" class="mol-state-action mt-5">Ir para treinos</a></div>';
  } else if (!filtered.length) {
    $('sessions').innerHTML = '<div class="mol-state"><p class="mol-state-title">Nenhuma sessão encontrada</p><p class="mol-state-copy">Altere o mês, o dia selecionado ou a busca.</p></div>';
  } else {
    recordKeys = recordSetKeys(sessions);
    $('sessions').innerHTML = filtered.slice(0, visibleLimit).map(sessionCard).join(''); bindDeleteActions();
  }
  const remaining = Math.max(0, filtered.length - visibleLimit);
  $('load-more-sessions').classList.toggle('hidden', remaining === 0);
  $('load-more-sessions').textContent = remaining ? `Mostrar mais (${remaining})` : 'Mostrar mais sessões';
  window.lucide?.createIcons();
}

function renderAll() { renderSummary(); renderCalendar(); renderSessions(); }
function renderError() {
  $('total-workouts').textContent = '—'; $('total-workouts-label').textContent = 'histórico indisponível'; $('total-volume').textContent = '—'; $('month-summary').textContent = 'Não foi possível carregar';
  $('calendar').innerHTML = '<p class="col-span-7 py-8 text-center text-sm text-gray-500">Tente novamente em alguns instantes.</p>';
  $('sessions').innerHTML = '<div class="mol-state"><p class="mol-state-title">Não foi possível carregar as sessões.</p><button id="retry-history" type="button" class="mol-state-action mt-4">Tentar novamente</button></div>';
  $('retry-history')?.addEventListener('click', () => loadHistory({ ignoreCache: true }));
}

async function loadHistory({ ignoreCache = false } = {}) {
  if (!currentUser) return;
  const cached = !ignoreCache && readCache(currentUser.uid);
  if (cached) {
    sessions = sortSessionsNewest(cached);
    renderAll();
  } else {
    $('sessions').innerHTML = '<div class="glass-card rounded-2xl p-4 text-sm text-gray-500">Carregando sessões…</div>';
  }
  try {
    const snapshot = await withTimeout(getDocs(query(collection(db, 'sessoes'), where('userId', '==', currentUser.uid))), 'O histórico');
    sessions = sortSessionsNewest(snapshot.docs.map(item => ({ id: item.id, ...item.data() }))); writeCache(currentUser.uid); renderAll();
  } catch (error) { console.error('Erro ao carregar histórico:', error); renderError(); showToast('Não foi possível carregar o histórico.'); }
}

$('previous-month').addEventListener('click', () => { visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1); selectedDay = null; filterByMonth = true; visibleLimit = PAGE_SIZE; renderCalendar(); renderSessions(); });
$('next-month').addEventListener('click', () => { if ($('next-month').disabled) return; visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1); selectedDay = null; filterByMonth = true; visibleLimit = PAGE_SIZE; renderCalendar(); renderSessions(); });
$('clear-date-filter').addEventListener('click', () => { filterByMonth = false; selectedDay = null; visibleLimit = PAGE_SIZE; renderCalendar(); renderSessions(); });
$('history-search').addEventListener('input', () => { visibleLimit = PAGE_SIZE; renderSessions(); });
$('load-more-sessions').addEventListener('click', () => { visibleLimit += PAGE_SIZE; renderSessions(); });

watchProtectedPage(user => { currentUser = user; void loadHistory(); });
