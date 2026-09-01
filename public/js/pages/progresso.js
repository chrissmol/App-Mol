import { db } from '../config/firebase-config.js';
import { watchAuthState } from '../modules/auth.js';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { exerciseTrends, personalRecords, trainingBalance, volumeByGroup } from '../modules/workout-analytics.js';
import { setupAppShell } from '../utils/app-shell.js';
import { escapeHTML, showToast } from '../utils/ui.js';
import { getSessionItem, setSessionItem } from '../utils/storage.js';

setupAppShell();
const $ = id => document.getElementById(id);
let sessions = [];
let currentUser = null;
let selectedDays = 7;
let showAllRecords = false;
const CACHE_TTL = 5 * 60 * 1000;
const cacheKey = uid => `mol-progress-cache-${uid}`;

function readCache(uid) {
  try {
    const cached = JSON.parse(getSessionItem(cacheKey(uid)) || 'null');
    return cached && Date.now() - cached.updatedAt < CACHE_TTL && Array.isArray(cached.sessions) ? cached.sessions : null;
  } catch { return null; }
}

function writeCache(uid, values) {
  setSessionItem(cacheKey(uid), JSON.stringify({ updatedAt: Date.now(), sessions: values }));
}

function formatDate(date) {
  return date ? new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(date) : 'data não disponível';
}

function renderSummary(volume, records) {
  $('weekly-sets').textContent = Object.values(volume).reduce((sum, sets) => sum + sets, 0).toLocaleString('pt-BR');
  $('trained-groups').textContent = Object.keys(volume).length.toLocaleString('pt-BR');
  $('record-count').textContent = records.length.toLocaleString('pt-BR');
}

function renderVolume(volume) {
  const entries = Object.entries(volume).sort((a, b) => b[1] - a[1]);
  if (!entries.length) {
    $('volume').innerHTML = `<div class="rounded-2xl bg-white/5 px-4 py-6 text-center"><p class="text-sm font-bold">Nenhuma série nos últimos ${selectedDays} dias</p><p class="mt-1 text-xs text-gray-500">Conclua um treino para visualizar a distribuição.</p><a href="./treino.html" class="mt-4 inline-flex min-h-10 items-center rounded-xl bg-neon px-4 text-xs font-bold text-black">Ir para treinos</a></div>`;
    return;
  }
  const max = Math.max(...entries.map(([, sets]) => sets), 1);
  $('volume').innerHTML = entries.map(([group, sets]) => `<div><div class="flex items-center justify-between gap-3 text-sm"><span class="truncate font-medium">${escapeHTML(group)}</span><span class="shrink-0 font-bold">${sets} ${sets === 1 ? 'série' : 'séries'}</span></div><div class="mt-2 h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-label="${escapeHTML(group)}: ${sets} ${sets === 1 ? 'série' : 'séries'}" aria-valuemin="0" aria-valuemax="${max}" aria-valuenow="${sets}"><div class="h-full rounded-full bg-neon transition-[width] duration-300" style="width:${Math.round((sets / max) * 100)}%"></div></div></div>`).join('');
}

function recordCard(record) {
  const evolution = record.improvement == null ? '<span class="text-gray-500">Primeira marca calculável</span>' : `<span class="text-neon">+${record.improvement.toLocaleString('pt-BR')}% sobre a marca anterior</span>`;
  return `<article class="border-b border-white/5 pb-4 last:border-0 last:pb-0"><div class="flex items-start justify-between gap-3"><div class="min-w-0"><h3 class="truncate text-sm font-semibold">${escapeHTML(record.name)}</h3><p class="mt-1 text-[11px] text-gray-500">${record.weight.toLocaleString('pt-BR')} kg × ${record.reps.toLocaleString('pt-BR')} rep. · ${formatDate(record.date)}</p></div><div class="shrink-0 text-right"><strong class="text-sm text-neon">${record.e1rm.toLocaleString('pt-BR')} kg</strong><small class="block text-[10px] text-gray-500">1RM estimado</small></div></div><p class="mt-2 text-[10px] font-semibold">${evolution}</p></article>`;
}

function renderRecords(records) {
  if (!records.length) {
    $('prs').innerHTML = '<div class="rounded-2xl bg-white/5 px-4 py-6 text-center"><p class="text-sm font-bold">Ainda não há marcas calculáveis</p><p class="mt-1 text-xs text-gray-500">Use carga maior que zero e até 15 repetições para uma estimativa confiável.</p></div>';
    return;
  }
  const visible = showAllRecords ? records : records.slice(0, 8);
  $('prs').innerHTML = `${visible.map(recordCard).join('')}${records.length > 8 ? `<button id="toggle-records" type="button" class="min-h-11 w-full rounded-xl bg-white/5 text-xs font-bold text-gray-300">${showAllRecords ? 'Mostrar menos' : `Ver todos (${records.length})`}</button>` : ''}`;
  $('toggle-records')?.addEventListener('click', () => { showAllRecords = !showAllRecords; renderRecords(records); });
}

function renderInsight(volume) {
  const insight = trainingBalance(volume);
  const tones = { empty: 'text-gray-400', focused: 'text-blue-400', concentrated: 'text-orange-400', distributed: 'text-neon' };
  $('balance-insight').innerHTML = `<div class="flex items-start gap-3"><span class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl mol-soft ${tones[insight.state] || 'text-neon'}"><i data-lucide="sparkles" class="h-4 w-4"></i></span><div><h3 class="text-sm font-bold">${escapeHTML(insight.title)}</h3><p class="mt-1 text-xs leading-relaxed text-gray-500">${escapeHTML(insight.message)}</p></div></div>`;
}

function renderTrends(trends) {
  if (!trends.length) {
    $('trends').innerHTML = '<div class="rounded-2xl mol-soft px-4 py-6 text-center"><p class="text-sm font-bold">Precisamos de duas sessões</p><p class="mt-1 text-xs text-gray-500">Repita um exercício com carga registrada para calcular uma tendência.</p></div>';
    return;
  }
  const labels = { improving: ['Evoluindo', 'text-neon', 'trending-up'], stable: ['Estável', 'text-blue-400', 'minus'], declining: ['Atenção', 'text-orange-400', 'trending-down'] };
  $('trends').innerHTML = trends.slice(0, 8).map(trend => {
    const [label, tone, icon] = labels[trend.state];
    const change = `${trend.deltaPercent > 0 ? '+' : ''}${trend.deltaPercent.toLocaleString('pt-BR')}%`;
    return `<article class="flex items-center justify-between gap-3 border-b border-white/5 pb-3 last:border-0 last:pb-0"><div class="min-w-0"><h3 class="truncate text-sm font-semibold">${escapeHTML(trend.name)}</h3><p class="mt-1 text-[11px] text-gray-500">${trend.sessions} sessões · e1RM recente ${trend.recentE1rm.toLocaleString('pt-BR')} kg</p></div><span class="flex shrink-0 items-center gap-1 text-xs font-bold ${tone}"><i data-lucide="${icon}" class="h-4 w-4"></i>${label} ${change}</span></article>`;
  }).join('');
}
function renderProgress() {
  const volume = volumeByGroup(sessions, selectedDays);
  const records = personalRecords(sessions);
  const trends = exerciseTrends(sessions, Math.max(selectedDays, 30));
  $('period-label').textContent = `Últimos ${selectedDays} dias`;
  $('summary-period').textContent = `séries em ${selectedDays} dias`;
  document.querySelectorAll('[data-period]').forEach(button => {
    const active = Number(button.dataset.period) === selectedDays;
    button.className = `min-h-10 rounded-xl px-4 text-xs font-bold ${active ? 'bg-neon text-black' : 'bg-white/5 text-gray-400'}`;
    button.setAttribute('aria-pressed', String(active));
  });
  renderSummary(volume, records); renderInsight(volume); renderVolume(volume); renderTrends(trends); renderRecords(records);
  window.lucide?.createIcons();
}

function renderError() {
  $('weekly-sets').textContent = '—'; $('trained-groups').textContent = '—'; $('record-count').textContent = '—';
  $('volume').innerHTML = '<div class="rounded-2xl bg-white/5 p-5 text-center"><p class="text-sm text-gray-500">Não foi possível carregar a distribuição.</p><button id="retry-progress" type="button" class="mt-4 min-h-10 rounded-xl bg-neon px-4 text-xs font-bold text-black">Tentar novamente</button></div>';
  $('prs').innerHTML = '<div class="rounded-2xl bg-white/5 p-5 text-center text-sm text-gray-500">Os recordes estarão disponíveis após recarregar os dados.</div>';
  $('retry-progress')?.addEventListener('click', loadProgress);
}

async function loadProgress() {
  if (!currentUser) return;
  const cached = readCache(currentUser.uid);
  if (cached) { sessions = cached; renderProgress(); return; }
  $('volume').innerHTML = '<p class="text-sm text-gray-500">Carregando distribuição…</p>';
  $('prs').innerHTML = '<p class="text-sm text-gray-500">Carregando recordes…</p>';
  try {
    const snapshot = await getDocs(query(collection(db, 'sessoes'), where('userId', '==', currentUser.uid)));
    sessions = snapshot.docs.map(item => item.data()); writeCache(currentUser.uid, sessions); renderProgress();
  } catch (error) {
    console.error('Erro ao carregar progresso:', error); renderError(); showToast('Não foi possível carregar seu progresso.');
  }
}

document.querySelectorAll('[data-period]').forEach(button => button.addEventListener('click', () => { selectedDays = Number(button.dataset.period); renderProgress(); }));
watchAuthState( user => { if (!user) { window.location.href = './login.html'; return; } currentUser = user; void loadProgress(); });
