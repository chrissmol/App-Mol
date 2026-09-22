import { db } from '../config/firebase-config.js';
import { watchProtectedPage } from '../modules/auth.js';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { withTimeout } from '../utils/timeout.js';
import { exerciseTrends, personalRecords, trainingBalance, volumeByGroup, volumeByMuscleZone } from '../modules/workout-analytics.js';
import { muscleMapLegendEntries, renderMuscleMap } from '../modules/muscle-map.js';
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
    $('volume').innerHTML = `<div class="mol-state"><p class="mol-state-title">Nenhuma série nos últimos ${selectedDays} dias</p><p class="mol-state-copy">Conclua um treino para visualizar a distribuição.</p><a href="./treino.html" class="mol-state-action mt-4">Ir para treinos</a></div>`;
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
    $('prs').innerHTML = '<div class="mol-state"><p class="mol-state-title">Ainda não há marcas calculáveis</p><p class="mol-state-copy">Use carga maior que zero e até 15 repetições para uma estimativa confiável.</p></div>';
    return;
  }
  const visible = showAllRecords ? records : records.slice(0, 8);
  $('prs').innerHTML = `${visible.map(recordCard).join('')}${records.length > 8 ? `<button id="toggle-records" type="button" class="min-h-11 w-full rounded-xl bg-white/5 text-xs font-bold text-gray-300">${showAllRecords ? 'Mostrar menos' : `Ver todos (${records.length})`}</button>` : ''}`;
  $('toggle-records')?.addEventListener('click', () => { showAllRecords = !showAllRecords; renderRecords(records); });
}

function renderMuscleHeatmap(scores) {
  const entries = muscleMapLegendEntries(scores);
  const legend = entries.length
    ? `<div class="mol-muscle-legend mt-4">${entries.map(entry => `<span class="mol-muscle-legend-item"><span class="mol-muscle-legend-dot" style="background:color-mix(in srgb, var(--mol-neon) ${Math.round(Math.max(0.28, entry.score / entries[0].score) * 100)}%, var(--mol-surface-soft))"></span>${escapeHTML(entry.label)}</span>`).join('')}</div>`
    : `<p class="mt-4 text-center text-xs text-gray-500">Nenhum músculo treinado no período. Conclua um treino para colorir o mapa.</p>`;
  $('muscle-map').innerHTML = `${renderMuscleMap(scores)}${legend}`;
}

function renderInsight(volume) {
  const insight = trainingBalance(volume);
  const tones = { empty: 'text-gray-400', focused: 'text-blue-400', concentrated: 'text-orange-400', distributed: 'text-neon' };
  $('balance-insight').innerHTML = `<div class="flex items-start gap-3"><span class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl mol-soft ${tones[insight.state] || 'text-neon'}"><i data-lucide="sparkles" class="h-4 w-4"></i></span><div><h3 class="text-sm font-bold">${escapeHTML(insight.title)}</h3><p class="mt-1 text-xs leading-relaxed text-gray-500">${escapeHTML(insight.message)}</p></div></div>`;
}

function renderTrends(trends) {
  if (!trends.length) {
    $('trends').innerHTML = '<div class="mol-state"><p class="mol-state-title">Precisamos de duas sessões</p><p class="mol-state-copy">Repita um exercício com carga registrada para calcular uma tendência.</p></div>';
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
  const muscleScores = volumeByMuscleZone(sessions, selectedDays);
  const records = personalRecords(sessions);
  const trends = exerciseTrends(sessions, Math.max(selectedDays, 30));
  $('period-label').textContent = `Últimos ${selectedDays} dias`;
  $('summary-period').textContent = `séries em ${selectedDays} dias`;
  document.querySelectorAll('[data-period]').forEach(button => {
    const active = Number(button.dataset.period) === selectedDays;
    button.className = `min-h-10 rounded-xl px-4 text-xs font-bold ${active ? 'bg-neon text-black' : 'bg-white/5 text-gray-400'}`;
    button.setAttribute('aria-pressed', String(active));
  });
  renderSummary(volume, records); renderInsight(volume); renderMuscleHeatmap(muscleScores); renderVolume(volume); renderTrends(trends); renderRecords(records);
  window.lucide?.createIcons();
}

async function shareProgress() {
  const volume = volumeByGroup(sessions, selectedDays);
  const records = personalRecords(sessions);
  const series = Object.values(volume).reduce((sum, value) => sum + value, 0);
  const totalVolume = sessions.reduce((sum, session) => sum + (Number(session.volumeTotal) || 0), 0);
  const text = `Meu resumo Mol · últimos ${selectedDays} dias\n${series} séries · ${Math.round(totalVolume).toLocaleString('pt-BR')} kg de volume · ${records.length} exercícios monitorados`;
  try {
    if (navigator.share) { await navigator.share({ title: 'Meu progresso no Mol', text }); return; }
    await navigator.clipboard.writeText(text);
    showToast('Resumo copiado para a área de transferência.', 'success');
  } catch (error) {
    if (error?.name !== 'AbortError') showToast('Não foi possível compartilhar o resumo.');
  }
}

function renderError() {
  $('weekly-sets').textContent = '—'; $('trained-groups').textContent = '—'; $('record-count').textContent = '—';
  $('volume').innerHTML = '<div class="mol-state"><p class="mol-state-title">Não foi possível carregar a distribuição.</p><button id="retry-progress" type="button" class="mol-state-action mt-4">Tentar novamente</button></div>';
  $('muscle-map').innerHTML = '<p class="text-center text-xs text-gray-500">Mapa muscular indisponível.</p>';
  $('prs').innerHTML = '<div class="mol-state"><p class="mol-state-copy">Os recordes estarão disponíveis após recarregar os dados.</p></div>';
  $('retry-progress')?.addEventListener('click', loadProgress);
}

async function loadProgress() {
  if (!currentUser) return;
  const cached = readCache(currentUser.uid);
  // Mostra o último resultado imediatamente e atualiza em segundo plano.
  if (cached) {
    sessions = cached;
    renderProgress();
  } else {
    $('volume').innerHTML = '<p class="text-sm text-gray-500">Carregando distribuição…</p>';
    $('prs').innerHTML = '<p class="text-sm text-gray-500">Carregando recordes…</p>';
  }
  try {
    const snapshot = await withTimeout(getDocs(query(collection(db, 'sessoes'), where('userId', '==', currentUser.uid))), 'O progresso');
    sessions = snapshot.docs.map(item => item.data()); writeCache(currentUser.uid, sessions); renderProgress();
  } catch (error) {
    console.error('Erro ao carregar progresso:', error); renderError(); showToast('Não foi possível carregar seu progresso.');
  }
}

document.querySelectorAll('[data-period]').forEach(button => button.addEventListener('click', () => { selectedDays = Number(button.dataset.period); renderProgress(); }));
document.getElementById('share-progress')?.addEventListener('click', shareProgress);
watchProtectedPage(user => { currentUser = user; void loadProgress(); });
