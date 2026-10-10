import { getDb } from '../config/firebase-config.js';
const db = await getDb();
import { watchProtectedPage } from '../modules/auth.js';
import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { sessionMetrics } from '../modules/workout-analytics.js';
import { dateOf, estimatedWorkoutMinutes, monday, recentWeightTrend, safeJSON, selectRoutine, sessionsInWeek, validWorkoutDraft, weeklyStreak } from '../modules/dashboard-analytics.js';
import { avatarTier, profileStats } from '../modules/profile-analytics.js';
import { fastingStatus, foodNutrients, mealFoods, nextMeal, normalizeDietMeals, normalizeFastingSettings } from '../modules/nutrition.js';
import { normalizeRoutineRecord } from '../modules/workout-session.js';
import { showToast } from '../utils/ui.js';
import { setupAppShell } from '../utils/app-shell.js';
import { getLocalItem, getSessionItem, removeLocalItems, removeSessionItems, setLocalItem, setSessionItem } from '../utils/storage.js';
import { cardAllowed, normalizeAppModules, presetFromModules } from '../utils/app-modules.js';
import { plural } from '../utils/plural.js';
const renderIcons = () => window.lucide?.createIcons();

setupAppShell();
if (getSessionItem('mol-login-success') === 'true') {
  removeSessionItems('mol-login-success');
  showToast('Login realizado com sucesso!', 'success');
}

document.documentElement.setAttribute('translate', 'no');
document.documentElement.classList.add('notranslate');

// any: cada tela sabe o tipo do elemento (input, button...) que busca por id.
const $ = id => /** @type {any} */ (document.getElementById(id));
const draftKey = id => `mol-workout-draft-${id}`;
const dayLabel = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const defaultCards = [
  { id: 'today-card', label: 'Treino de hoje', visible: true },
  { id: 'next-meal-card', label: 'Próxima refeição', visible: true },
  { id: 'fasting-card', label: 'Jejum', visible: true },
  { id: 'weekly-card', label: 'Progresso semanal', visible: true },
  { id: 'last-session-card', label: 'Última sessão', visible: true },
  { id: 'weight-card', label: 'Evolução de peso', visible: true },
  { id: 'insights-card', label: 'Atalhos e nutrição', visible: true }
];
let dashboardCards = [...defaultCards];
let dashboardUser = null;
let profileData = {};
let appModules = normalizeAppModules();
let mealRefreshTimer = null;
const focusCandidates = {};
let spotlightCardId = null;
const withTimeout = (promise, label, timeout = 12000) => Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error(`${label} excedeu o tempo de resposta.`)), timeout))]);
const dashboardCacheKey = uid => `mol-dashboard-data-${uid}`;
const profileCacheKey = uid => `mol-profile-dashboard-${uid}`;
const mealCacheKey = uid => `mol-meal-dashboard-${uid}`;
const ADMIN_EMAIL = 'chrisouzamol@gmail.com';
const VALID_AVATAR_FRAMES = ['plastic', 'wood', 'bronze', 'silver', 'gold', 'diamond', 'boss'];
const cacheFresh = value => value?.savedAt && Date.now() - value.savedAt < 1000 * 60 * 60 * 6;
const writeDashboardDataCache = (uid, patch) => {
  const current = safeJSON(getSessionItem(dashboardCacheKey(uid)), {}) || {};
  setSessionItem(dashboardCacheKey(uid), JSON.stringify({ ...current, ...patch, savedAt: Date.now() }));
};
const readDashboardDataCache = uid => {
  const cached = safeJSON(getSessionItem(dashboardCacheKey(uid)), null);
  return cacheFresh(cached) ? cached : null;
};

function normalizeCards(value) {
  if (!Array.isArray(value)) return defaultCards.map(card => ({ ...card }));
  const known = new Map(defaultCards.map(card => [card.id, card]));
  const seen = new Set();
  const valid = value.flatMap(item => {
    const base = known.get(item?.id);
    if (!base || seen.has(base.id)) return [];
    seen.add(base.id);
    return [{ ...base, visible: item.visible !== false }];
  });
  return [...valid, ...defaultCards.filter(card => !seen.has(card.id)).map(card => ({ ...card }))];
}

function setFocusCandidate(id, candidate = null) {
  if (candidate) focusCandidates[id] = { id, ...candidate };
  else delete focusCandidates[id];
  updateDailyBrief();
}

function getDailyFocus() {
  const preset = presetFromModules(appModules);
  const candidates = Object.values(focusCandidates)
    .filter(candidate => !candidate.module || normalizeAppModules(appModules)[candidate.module] !== false)
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));
  if (candidates[0]) return candidates[0];
  if (preset === 'training') return {
    id: 'training-default',
    eyebrow: 'Modo caverna',
    title: 'Foco no treino',
    subtitle: 'Seu início mostra só o essencial para abrir, executar e registrar.',
    context: 'Ative outros módulos nas Configurações quando quiser ver dieta, evolução ou progresso.',
    href: './pages/treino.html',
    label: 'Abrir treinos',
    icon: 'dumbbell',
    cardId: null
  };
  if (preset === 'trainingDiet') return {
    id: 'training-diet-default',
    eyebrow: 'Treino + dieta',
    title: 'Rotina enxuta',
    subtitle: 'O início prioriza treino e alimentação, sem cards extras de acompanhamento.',
    context: '',
    href: './pages/treino.html',
    label: 'Começar',
    icon: 'apple',
    cardId: null
  };
  return {
    id: 'default',
    eyebrow: 'Próxima ação',
    title: 'Tudo pronto por aqui',
    subtitle: 'Quando houver treino, refeição ou acompanhamento importante, ele aparece primeiro neste card.',
    context: '',
    href: './pages/treino.html',
    label: 'Ver app',
    icon: 'sparkles',
    cardId: null
  };
}

function updateDailyBrief() {
  const eyebrow = $('daily-brief-eyebrow');
  const title = $('daily-brief-title');
  const subtitle = $('daily-brief-subtitle');
  const context = $('daily-brief-context');
  const action = $('daily-brief-action');
  const icon = $('daily-brief-icon');
  if (!eyebrow || !title || !subtitle || !context || !action || !icon) return;
  const focus = getDailyFocus();
  spotlightCardId = focus.cardId || null;
  eyebrow.textContent = focus.eyebrow;
  title.textContent = focus.title;
  subtitle.textContent = focus.subtitle;
  context.textContent = focus.context || '';
  context.hidden = !focus.context;
  action.href = focus.href;
  action.textContent = focus.label;
  icon.innerHTML = `<i data-lucide="${focus.icon || 'sparkles'}" class="h-5 w-5"></i>`;
  applyDashboardCards();
  renderIcons();
}

function insertAfterOrAppend(anchor, element, fallback) {
  if (anchor) anchor.after(element);
  else fallback.appendChild(element);
}

// Cards secundários da home começam neutros (ícone cinza) e só ganham a
// cor da marca quando têm dado de verdade pra mostrar — evita a parede
// de cards idênticos e verdes que um usuário novo via antes.
function setCardBadgeActive(badgeId, active) {
  const badge = $(badgeId);
  if (!badge) return;
  badge.classList.toggle('bg-neon/15', active);
  badge.classList.toggle('text-neon', active);
  badge.classList.toggle('bg-white/5', !active);
  badge.classList.toggle('text-gray-500', !active);
}

function setWeek(sessions, goal = 1) {
  const tier = avatarTier(profileStats(sessions, goal).workouts);
  const frame = $('dashboard-avatar-frame');
  if (frame) {
    const savedFrame = String(profileData.avatarFrame || '').replace(/[^a-z]/g, '');
    const adminFrame = String(dashboardUser?.email || '').toLowerCase() === ADMIN_EMAIL;
    const frameId = adminFrame ? 'boss' : (VALID_AVATAR_FRAMES.includes(savedFrame) && savedFrame !== 'boss' ? savedFrame : tier.id);
    const frameLabel = frameId === 'boss' ? 'Chefão' : (frameId === tier.id ? tier.label : frameId);
    frame.className = frame.className.replace(/avatar-frame--\w+/g, '').trim() + ` avatar-frame--${frameId}`;
    frame.setAttribute('aria-label', `Abrir perfil · moldura de ${frameLabel}`);
  }
  $('weekly-stats')?.classList.toggle('hidden', sessions.length === 0);
  $('weekly-empty-note')?.classList.toggle('hidden', sessions.length > 0);
  const start = monday(); const days = Array.from({length: 7}, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
  const thisWeek = sessionsInWeek(sessions);
  const volume = thisWeek.reduce((sum, session) => sum + sessionMetrics(session).volume, 0);
  $('week-days').innerHTML = days.map(d => { const done = thisWeek.some(s => dateOf(s)?.toDateString() === d.toDateString()); const today = d.toDateString() === new Date().toDateString(); return `<div class="text-center" role="img" aria-label="${dayLabel[d.getDay()]}, ${d.toLocaleDateString('pt-BR')}${done ? ', treino concluído' : ''}"><span aria-hidden="true" class="text-[10px] font-semibold text-gray-500">${dayLabel[d.getDay()].slice(0, 1)}</span><span aria-hidden="true" class="mx-auto mt-2 flex h-8 w-8 items-center justify-center rounded-full text-xs ${done ? 'bg-neon font-extrabold text-white' : today ? 'border border-neon text-neon' : 'mol-soft text-gray-500'}">${d.getDate()}</span></div>`; }).join('');
  $('weekly-title').textContent = `${thisWeek.length} treino${thisWeek.length === 1 ? '' : 's'} concluído${thisWeek.length === 1 ? '' : 's'}`;
  $('weekly-sessions').textContent = thisWeek.length;
  $('weekly-volume').textContent = Math.round(volume).toLocaleString('pt-BR');
  $('weekly-streak').textContent = weeklyStreak(sessions, new Date(), goal);
  if (thisWeek.length < (goal || 1)) {
    setFocusCandidate('weekly', {
      module: 'progresso',
      cardId: 'weekly-card',
      priority: 30,
      eyebrow: 'Meta da semana',
      title: `${thisWeek.length}/${goal || 1} treinos concluídos`,
      subtitle: 'Ainda existe espaço para fechar sua meta semanal.',
      context: '',
      href: './pages/treino.html',
      label: 'Treinar',
      icon: 'calendar-check'
    });
  } else {
    setFocusCandidate('weekly', null);
  }
  const orderedSessions = [...sessions].filter(session => dateOf(session) && dateOf(session) <= new Date()).sort((a,b) => dateOf(b) - dateOf(a));
  const [last, previous] = orderedSessions;
  const lastVolume = last ? sessionMetrics(last).volume : 0;
  const previousVolume = previous ? sessionMetrics(previous).volume : 0;
  const trend = previousVolume ? ((lastVolume - previousVolume) / previousVolume) * 100 : null;
  $('performance-summary').textContent = last ? `Último: ${last.nomeRotina} · ${Math.round(lastVolume).toLocaleString('pt-BR')} kg${trend === null ? '.' : ` · ${trend.toLocaleString('pt-BR', { signDisplay: 'always', maximumFractionDigits: 1 })}% versus a sessão anterior.`}` : 'Conclua o primeiro treino para acompanhar sua evolução.';
  $('progress-card-icon')?.classList.toggle('text-neon', Boolean(last));
  $('progress-card-icon')?.classList.toggle('text-gray-500', !last);
  if (last) { $('last-session-title').textContent = last.nomeRotina; $('last-session-meta').textContent = `${Math.round(sessionMetrics(last).volume).toLocaleString('pt-BR')} kg · ${sessionMetrics(last).sets} séries`; }
  setCardBadgeActive('last-session-badge', Boolean(last));
}

function setToday(routines, user) {
  const storedDraft = safeJSON(getLocalItem(draftKey(user.uid)), null);
  const draft = validWorkoutDraft(storedDraft, routines);
  if (storedDraft && !draft) removeLocalItems(draftKey(user.uid));
  const card = $('today-workout-cta');
  if (draft) {
    const routine = routines.find(r => r.id === draft.rotinaId); const series = (draft.exercicios || []).flatMap(ex => ex.series || []); const done = series.filter(s => s.concluida).length;
    const elapsed = Math.max(Number(draft.tempoSegundos) || 0, draft.iniciadaEm ? Math.floor((Date.now() - new Date(draft.iniciadaEm).getTime()) / 1000) : 0);
    $('today-eyebrow').textContent = 'Treino em andamento'; $('today-workout-title').textContent = `Retomar ${routine.nome}`; $('today-workout-subtitle').textContent = `${done}/${series.length} séries · ${Math.floor(elapsed / 60)} min decorridos`;
    card.href = `./pages/treino.html?rotina=${encodeURIComponent(routine.id)}&retomar=1`;
    card.innerHTML = '<i data-lucide="play" class="h-4 w-4 fill-current"></i><span>Retomar treino</span>';
    setFocusCandidate('workout', {
      module: 'treino',
      cardId: 'today-card',
      priority: 100,
      eyebrow: 'Treino em andamento',
      title: `Retomar ${routine.nome}`,
      subtitle: `${done}/${series.length} séries concluídas · ${Math.floor(elapsed / 60)} min decorridos.`,
      context: '',
      href: card.href,
      label: 'Retomar',
      icon: 'play'
    });
  } else if (routines.length) {
    const scheduled = routines.find(r => (r.diasSemana || []).map(Number).includes(new Date().getDay()));
    const routine = selectRoutine(routines); const series = (routine.exercicios || []).reduce((sum, ex) => sum + (ex.series?.length || 0), 0);
    $('today-eyebrow').textContent = scheduled ? 'Planejado para hoje' : 'Seu próximo treino';
    $('today-workout-title').textContent = scheduled ? `Hoje é dia de ${routine.nome}` : routine.nome;
    $('today-workout-subtitle').textContent = `${plural(routine.exercicios?.length || 0, 'exercício', 'exercícios')} · ${plural(series, 'série', 'séries')} · cerca de ${estimatedWorkoutMinutes(routine)} min`;
    card.href = `./pages/treino.html?rotina=${encodeURIComponent(routine.id)}`;
    card.innerHTML = '<i data-lucide="play" class="h-4 w-4 fill-current"></i><span>Iniciar treino</span>';
    setFocusCandidate('workout', {
      module: 'treino',
      cardId: 'today-card',
      priority: scheduled ? 80 : 45,
      eyebrow: scheduled ? 'Treino de hoje' : 'Próximo treino',
      title: scheduled ? `Hoje é dia de ${routine.nome}` : routine.nome,
      subtitle: `${plural(routine.exercicios?.length || 0, 'exercício', 'exercícios')} · ${plural(series, 'série', 'séries')} · cerca de ${estimatedWorkoutMinutes(routine)} min.`,
      context: '',
      href: card.href,
      label: 'Iniciar',
      icon: 'dumbbell'
    });
  } else {
    $('today-eyebrow').textContent = 'Comece por aqui'; $('today-workout-title').textContent = 'Crie sua primeira rotina'; $('today-workout-subtitle').textContent = 'Monte uma ficha ou use um modelo pronto para treinar hoje.';
    card.href = './pages/treino.html?acao=nova'; card.innerHTML = '<i data-lucide="plus" class="h-4 w-4"></i><span>Criar rotina</span>';
    setFocusCandidate('workout', {
      module: 'treino',
      cardId: 'today-card',
      priority: 70,
      eyebrow: 'Primeiro passo',
      title: 'Crie sua primeira rotina',
      subtitle: 'Sem rotina cadastrada, treino e histórico ainda ficam vazios.',
      context: 'Monte uma ficha própria ou use um modelo pronto para começar.',
      href: './pages/treino.html?acao=nova',
      label: 'Criar rotina',
      icon: 'plus'
    });
  }
  updateDailyBrief();
  renderIcons();
}

function setNextMeal(meals) {
  const card = $('next-meal-card');
  if (!card) return;
  const today = new Date();
  const now = today.toTimeString().slice(0, 5);
  const normalized = normalizeDietMeals(meals);
  const { meal, tomorrow } = nextMeal(normalized, now);
  if (!meal) { card.dataset.available = 'false'; card.classList.add('hidden'); setFocusCandidate('meal', null); return; }
  card.dataset.available = 'true';
  $('next-meal-name').textContent = meal.nome || 'Refeição';
  const foods = mealFoods(meal);
  const nutrients = foods.reduce((sum, food) => sum + foodNutrients(food).kcal, 0);
  $('next-meal-meta').textContent = `${tomorrow ? 'Amanhã, ' : ''}${meal.hora} · ${plural(foods.length, 'alimento', 'alimentos')} · ${Math.round(nutrients)} kcal`;
  const targetDay = (today.getDay() + (tomorrow ? 1 : 0)) % 7;
  const href = `./pages/dieta.html?meal=${encodeURIComponent(meal.id)}&day=${targetDay}`;
  card.querySelector('a')?.setAttribute('href', href);
  card.classList.remove('hidden');
  setFocusCandidate('meal', {
    module: 'dieta',
    cardId: 'next-meal-card',
    priority: tomorrow ? 20 : 60,
    eyebrow: tomorrow ? 'Amanhã cedo' : 'Próxima refeição',
    title: `${meal.hora} · ${meal.nome || 'Refeição'}`,
    subtitle: `${plural(foods.length, 'alimento', 'alimentos')} · ${Math.round(nutrients)} kcal.`,
    context: '',
    href,
    label: 'Ver refeição',
    icon: 'utensils'
  });
}

function setFastingCard(settings) {
  const card = $('fasting-card');
  if (!card) return;
  const fasting = normalizeFastingSettings(settings);
  if (!fasting.ativo) { card.classList.add('hidden'); return; }
  const status = fastingStatus(fasting);
  if (!status.active) { card.classList.add('hidden'); return; }
  card.classList.remove('hidden');
  $('fasting-eyebrow').textContent = status.active ? (status.eating ? 'Janela alimentar aberta' : `Em jejum há ${Math.floor(status.elapsedFastMinutes / 60)}h`) : (status.offDay ? 'Jejum programado' : 'Jejum pausado hoje');
  $('fasting-title').textContent = status.active ? (status.eating ? `Jejum começa às ${fasting.fimJanela}` : status.phase.title) : (status.offDay ? `Próximo jejum às ${fasting.fimJanela}` : 'Hoje sem cobrança');
  $('fasting-meta').textContent = status.active ? (status.eating ? `Restam ${Math.round(status.remainingMinutes / 60)}h para iniciar.` : `Janela alimentar abre às ${status.nextTime}.`) : (status.offDay ? `${fasting.protocolo} · alimentação até ${fasting.fimJanela}` : 'Edite a configuração na Dieta para retomar.');
  const actions = $('fasting-actions');
  actions.querySelector('[data-fast-end]')?.remove();
  if (status.active && !status.eating) {
    const button = document.createElement('button'); button.type = 'button'; button.dataset.fastEnd = 'true'; button.className = 'mol-btn mol-btn-secondary min-h-9 rounded-xl px-3 text-xs'; button.textContent = 'Encerrar jejum';
    button.onclick = async () => { button.disabled = true; button.textContent = 'Encerrando…'; try { await setDoc(doc(db, 'dietas', dashboardUser.uid), { jejum: { ...fasting, pausadoHoje: true } }, { merge: true }); setFastingCard({ ...fasting, pausadoHoje: true }); showToast('Jejum encerrado hoje.', 'success'); } catch { button.disabled = false; button.textContent = 'Encerrar jejum'; showToast('Não foi possível encerrar o jejum.'); } };
    actions.prepend(button);
  }
  renderIcons();
}

async function loadNextMeal(userId) {
  const cached = safeJSON(getSessionItem(mealCacheKey(userId)), null);
  if (cached && Array.isArray(cached.meals)) {
    setNextMeal(cached.meals);
    setFastingCard(cached.fasting);
  }
  try {
    const snapshot = await withTimeout(getDoc(doc(db, 'dietas', userId)), 'A dieta');
    const meals = snapshot.exists() ? (snapshot.data().refeicoes || []) : [];
    const fasting = snapshot.exists() ? snapshot.data().jejum : null;
    setSessionItem(mealCacheKey(userId), JSON.stringify({ meals, fasting, savedAt: Date.now() }));
    setNextMeal(meals);
    setFastingCard(fasting);
    clearInterval(mealRefreshTimer);
    mealRefreshTimer = setInterval(() => setNextMeal(snapshot.exists() ? (snapshot.data().refeicoes || []) : []), 60000);
  } catch (error) {
    console.warn('Próxima refeição não carregada:', error.message);
    const card = $('next-meal-card');
    card.dataset.available = 'true'; card.classList.remove('hidden');
    $('next-meal-name').textContent = 'Dieta indisponível';
    $('next-meal-meta').textContent = 'Toque para abrir a dieta e tentar novamente.';
  }
}

function setupDashboardCards() {
  const sections = [...document.querySelectorAll('main section')];
  const grid = document.getElementById('dashboard-card-grid') || document.querySelector('main');
  const weekly = sections.find(section => section.querySelector('#weekly-title'));
  const insights = sections.find(section => section.querySelector('#performance-summary'));
  if (weekly) weekly.id = 'weekly-card';
  if (insights) insights.id = 'insights-card';
  if (!document.getElementById('last-session-card')) {
    const card = document.createElement('section');
    card.id = 'last-session-card'; card.className = 'glass-card mb-4 rounded-3xl p-5 animate-slide-up';
    card.innerHTML = '<div class="flex items-center justify-between"><div><p class="text-xs font-semibold uppercase tracking-wider text-gray-400">Última sessão</p><h2 id="last-session-title" class="mt-1 text-lg font-extrabold">Ainda não há sessões</h2><p id="last-session-meta" class="mt-1 text-sm text-gray-500">Conclua um treino para acompanhar.</p></div><span id="last-session-badge" class="rounded-2xl bg-white/5 p-3 text-gray-500"><i data-lucide="clock-3" class="h-5 w-5"></i></span></div>';
    card.tabIndex = 0; card.setAttribute('role', 'link'); card.setAttribute('aria-label', 'Abrir histórico de treinos');
    card.onclick = () => { window.location.href = './pages/historico.html'; };
    card.onkeydown = event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); card.click(); } };
    insertAfterOrAppend(document.getElementById('weekly-card'), card, grid);
  }
  if (!document.getElementById('next-meal-card')) {
    const card = document.createElement('section'); card.id = 'next-meal-card'; card.className = 'glass-card mb-4 rounded-3xl p-5 animate-slide-up hidden';
    card.innerHTML = '<a href="./pages/dieta.html" class="flex items-start justify-between gap-4" aria-label="Abrir próxima refeição na dieta"><div><p class="text-xs font-semibold uppercase tracking-wider text-neon">Próxima refeição</p><h2 id="next-meal-name" class="mt-1 text-lg font-extrabold">Refeição</h2><p id="next-meal-meta" class="mt-1 text-sm text-gray-400" aria-live="polite"></p></div><span class="rounded-2xl bg-neon/15 p-3 text-neon"><i data-lucide="utensils" class="h-5 w-5"></i></span></a>';
    insertAfterOrAppend(document.getElementById('today-card'), card, grid);
  }
  if (!document.getElementById('fasting-card')) {
    const card = document.createElement('section'); card.id = 'fasting-card'; card.className = 'glass-card mb-4 rounded-3xl p-5 animate-slide-up hidden';
    card.innerHTML = '<div class="flex items-start justify-between gap-4"><div class="min-w-0"><p id="fasting-eyebrow" class="text-xs font-semibold uppercase tracking-wider text-neon">Jejum</p><h2 id="fasting-title" class="mt-1 text-lg font-extrabold">Carregando jejum…</h2><p id="fasting-meta" class="mt-1 text-sm text-gray-400"></p></div><div id="fasting-actions" class="flex shrink-0 flex-col items-end gap-2"><a href="./pages/dieta.html" class="min-h-9 rounded-xl bg-white/5 px-3 py-2 text-xs font-bold text-gray-300">Configurar</a></div></div>';
    insertAfterOrAppend(document.getElementById('next-meal-card'), card, grid);
  }
  if (!document.getElementById('weight-card')) {
    const card = document.createElement('section'); card.id = 'weight-card'; card.className = 'glass-card mb-4 rounded-3xl p-5 animate-slide-up';
    card.innerHTML = '<a href="./pages/perfil.html" class="flex items-center justify-between" aria-label="Abrir evolução corporal no perfil"><div><p class="text-xs font-semibold uppercase tracking-wider text-gray-400">Evolução corporal</p><h2 id="dashboard-weight" class="mt-1 text-lg font-extrabold" aria-live="polite">Sem registro de peso</h2><p id="dashboard-weight-meta" class="mt-1 text-sm text-gray-500">Registre seu peso no Perfil.</p></div><span id="weight-card-badge" class="rounded-2xl bg-white/5 p-3 text-gray-500"><i data-lucide="scale" class="h-5 w-5"></i></span></a>';
    const weightLink = card.querySelector('a'); weightLink.href = './pages/evolucao.html'; weightLink.setAttribute('aria-label', 'Abrir evolução corporal');
    card.querySelector('#dashboard-weight-meta').textContent = 'Registre seu peso em Evolução.';
    insertAfterOrAppend(document.getElementById('last-session-card'), card, grid);
  }
  const header = document.querySelector('header');
  const headerContent = header.querySelector('div');
  if (!document.getElementById('dashboard-brand')) {
    headerContent.insertAdjacentHTML('afterbegin', '<a id="dashboard-brand" class="mol-brand" href="./index.html" aria-label="Ir para o início"><img src="./assets/mol-mark.svg" alt="">Mol</a>');
  }
  let button = document.getElementById('btn-edit-dashboard');
  if (!button) {
    button = document.createElement('button'); button.type = 'button'; button.id = 'btn-edit-dashboard'; button.className = 'mt-2 min-h-11 rounded-xl pr-3 text-xs font-bold text-gray-400 active:text-neon'; button.innerHTML = '<i data-lucide="sliders-horizontal" class="mr-1 inline h-3.5 w-3.5"></i> Editar painel';
    headerContent.appendChild(button);
  }
  button.onclick = openDashboardEditor;
}

function applyDashboardCards() {
  dashboardCards.forEach(card => {
    const element = document.getElementById(card.id);
    const hiddenByData = card.id === 'next-meal-card' && element?.dataset.available === 'false';
    if (element) element.classList.toggle('hidden', !card.visible || !cardAllowed(card.id, appModules) || hiddenByData || card.id === spotlightCardId);
  });
  const grid = document.getElementById('dashboard-card-grid') || document.querySelector('main');
  dashboardCards.forEach(card => { const element = document.getElementById(card.id); if (element) grid.appendChild(element); });
}

async function saveDashboardCards() {
  if (!dashboardUser) return;
  if (!dashboardCards.some(card => card.visible)) { dashboardCards[0].visible = true; applyDashboardCards(); showToast('O card Treino de hoje foi mantido para o painel não ficar vazio.'); }
  const updatedAt = new Date().toISOString();
  setLocalItem(`mol-dashboard-${dashboardUser.uid}`, JSON.stringify({ cards: dashboardCards, updatedAt }));
  try { await withTimeout(setDoc(doc(db, 'users', dashboardUser.uid), { dashboardCards, dashboardCardsUpdatedAt: updatedAt }, { merge: true }), 'A sincronização'); return true; }
  catch (error) { console.warn('Preferências salvas apenas neste dispositivo:', error.message); showToast('Painel salvo neste dispositivo, mas não foi possível sincronizar com sua conta.'); return false; }
}

function openDashboardEditor() {
  const opener = document.activeElement;
  const originalCards = dashboardCards.map(card => ({ ...card }));
  document.getElementById('mol-dashboard-editor')?.remove();
  const panel = document.createElement('div'); panel.id = 'mol-dashboard-editor'; panel.className = 'fixed inset-0 z-[200] flex items-end bg-black/70 p-4 backdrop-blur-sm sm:items-center';
  const close = (commit = true) => { if (!commit) dashboardCards = originalCards.map(card => ({ ...card })); panel.remove(); opener?.focus?.(); };
  const render = () => {
    const editableCards = dashboardCards.filter(card => cardAllowed(card.id, appModules));
    panel.innerHTML = `<section role="dialog" aria-modal="true" aria-labelledby="dashboard-editor-title" class="mx-auto w-full max-w-md rounded-3xl mol-dialog-surface p-6 animate-slide-up"><div class="mx-auto mb-5 h-1.5 w-11 rounded-full bg-white/20"></div><p class="text-xs font-bold uppercase tracking-[.16em] text-neon">Seu início</p><h2 id="dashboard-editor-title" class="mt-1 text-xl font-extrabold">Editar painel</h2><p class="mt-2 text-sm text-gray-400">Escolha o que quer ver. Cards de módulos desativados ficam escondidos.</p><div class="mt-5 space-y-2">${editableCards.map((card, index) => `<div class="flex min-h-14 items-center gap-2 rounded-2xl mol-soft px-3"><button type="button" data-toggle="${card.id}" aria-label="${card.visible ? 'Ocultar' : 'Mostrar'} ${card.label}" class="h-10 w-10 rounded-xl ${card.visible ? 'bg-neon text-white' : 'bg-white/10 text-gray-400'}"><i data-lucide="${card.visible ? 'eye' : 'eye-off'}" class="mx-auto h-4 w-4"></i></button><span class="flex-1 text-sm font-bold">${card.label}</span><button type="button" data-move="${card.id},-1" aria-label="Mover ${card.label} para cima" ${index === 0 ? 'disabled' : ''} class="h-10 w-10 rounded-xl text-gray-400 active:bg-white/10"><i data-lucide="chevron-up" class="mx-auto h-5 w-5"></i></button><button type="button" data-move="${card.id},1" aria-label="Mover ${card.label} para baixo" ${index === editableCards.length - 1 ? 'disabled' : ''} class="h-10 w-10 rounded-xl text-gray-400 active:bg-white/10"><i data-lucide="chevron-down" class="mx-auto h-5 w-5"></i></button></div>`).join('')}</div><div class="mt-6 grid grid-cols-2 gap-3"><button type="button" data-reset class="min-h-12 rounded-2xl mol-soft text-sm font-bold text-gray-300">Restaurar</button><button type="button" data-done class="min-h-12 rounded-2xl bg-neon text-sm font-bold text-white">Concluído</button></div></section>`;
    renderIcons();
    panel.querySelectorAll('[data-toggle]').forEach(button => button.onclick = () => {
      const card = dashboardCards.find(c => c.id === button.dataset.toggle);
      if (card) card.visible = !card.visible;
      render();
    });
    panel.querySelectorAll('[data-move]').forEach(button => button.onclick = () => {
      const [id, rawDirection] = button.dataset.move.split(',');
      const index = dashboardCards.findIndex(card => card.id === id);
      const direction = Number(rawDirection);
      const candidates = dashboardCards.map((card, order) => ({ card, order })).filter(item => cardAllowed(item.card.id, appModules));
      const currentVisibleIndex = candidates.findIndex(item => item.card.id === id);
      const target = candidates[currentVisibleIndex + direction]?.order;
      if (index >= 0 && target != null) [dashboardCards[index], dashboardCards[target]] = [dashboardCards[target], dashboardCards[index]];
      render();
    });
    panel.querySelector('[data-reset]').onclick = () => { dashboardCards = defaultCards.map(c => ({...c})); render(); };
    panel.querySelector('[data-done]').onclick = async event => { event.currentTarget.disabled = true; applyDashboardCards(); await saveDashboardCards(); close(); };
    panel.querySelector('[data-toggle]')?.focus();
  };
  panel.onclick = event => { if (event.target === panel) close(false); };
  panel.onkeydown = event => {
    if (event.key === 'Escape') return close(false);
    if (event.key !== 'Tab') return;
    const focusable = [...panel.querySelectorAll('button:not(:disabled),a[href]')];
    if (!focusable.length) return;
    const first = focusable[0], last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };
  document.body.appendChild(panel); render();
}

watchProtectedPage(async user => {
  dashboardUser = user;
  // O esqueleto do Início não depende do banco: aparece assim que a sessão existe.
  $('app-body').classList.remove('opacity-0');
  $('user-name').textContent = user.displayName?.trim().split(/\s+/)[0] || 'Atleta';
  setupDashboardCards();
  updateDailyBrief();
  const cachedDashboard = readDashboardDataCache(user.uid);
  const hasDashboardCache = !!cachedDashboard;
  if (cachedDashboard) {
    if (Array.isArray(cachedDashboard.routines)) setToday(cachedDashboard.routines, user);
    if (Array.isArray(cachedDashboard.sessions)) setWeek(cachedDashboard.sessions, cachedDashboard.goal || 1);
    if (Array.isArray(cachedDashboard.weights)) {
      const { last, change } = recentWeightTrend(cachedDashboard.weights);
      if (last) {
        $('dashboard-weight').textContent = `${Number(last.pesoKg).toLocaleString('pt-BR')} kg`;
        $('dashboard-weight-meta').textContent = change === null ? 'Primeiro registro corporal.' : `${change.toLocaleString('pt-BR', { signDisplay: 'always', maximumFractionDigits: 2 })} kg nos últimos 30 dias.`;
      }
      setCardBadgeActive('weight-card-badge', Boolean(last));
    }
    document.body.setAttribute('aria-busy', 'false');
    renderIcons();
  }
  appModules = normalizeAppModules();
  // Leituras independentes começam juntas, importante em conexões móveis.
  const dashboardData = {
    routines: withTimeout(getDocs(query(collection(db, 'treinos'), where('userId', '==', user.uid))), 'As rotinas'),
    sessions: withTimeout(getDocs(query(collection(db, 'sessoes'), where('userId', '==', user.uid))), 'O histórico'),
    weights: withTimeout(getDocs(query(collection(db, 'pesos'), where('userId', '==', user.uid))), 'Os pesos')
  };
  const localRaw = safeJSON(getLocalItem(`mol-dashboard-${user.uid}`), null);
  const localPrefs = Array.isArray(localRaw) ? { cards: localRaw, updatedAt: '' } : (localRaw || {});
  dashboardCards = normalizeCards(localPrefs.cards);
  const cachedProfile = safeJSON(getSessionItem(profileCacheKey(user.uid)), null);
  if (cachedProfile && typeof cachedProfile === 'object') {
    profileData = cachedProfile;
    const cachedName = String(profileData.name || profileData.nome || '').trim().split(/\s+/)[0];
    if (cachedName) $('user-name').textContent = cachedName.slice(0, 40);
  }
  // Libera a estrutura do painel antes das consultas remotas terminarem.
  // Os cards começam com cache/dados vazios e são preenchidos individualmente.
  applyDashboardCards();
  try {
    const profile = await withTimeout(getDoc(doc(db, 'users', user.uid)), 'O perfil');
    if (profile.exists()) {
      profileData = profile.data();
      setSessionItem(profileCacheKey(user.uid), JSON.stringify(profileData));
      const remoteDate = dateOf(profileData.dashboardCardsUpdatedAt)?.getTime() || 0;
      const localDate = dateOf(localPrefs.updatedAt)?.getTime() || 0;
      if (profileData.dashboardCards && remoteDate >= localDate) dashboardCards = normalizeCards(profileData.dashboardCards);
      appModules = normalizeAppModules(profileData.appModules);
    }
  } catch (error) { console.warn('Preferências do painel não carregadas:', error.message); }
  applyDashboardCards();
  updateDailyBrief();
  if (appModules.dieta) void loadNextMeal(user.uid);
  const fullName = String(user.displayName || profileData.name || profileData.nome || '');
  $('user-name').textContent = fullName.trim().split(/\s+/)[0].slice(0, 40) || 'Atleta';
  $('week-label').textContent = new Date().toLocaleDateString('pt-BR', { weekday: 'long' });
  const avatarURL = user.photoURL || profileData.photoURL;
  if (avatarURL) { const avatar=$('user-avatar'); avatar.onerror=()=>{avatar.classList.add('hidden');$('default-avatar-icon').classList.remove('hidden');}; avatar.src=avatarURL; avatar.classList.remove('hidden'); $('default-avatar-icon').classList.add('hidden'); }
  const loadRoutines = async () => {
    try {
      const routineSnapshot = await dashboardData.routines;
      const routines = routineSnapshot.docs.map(item => ({ id: item.id, ...normalizeRoutineRecord(item.data()) }));
      writeDashboardDataCache(user.uid, { routines });
      setToday(routines, user);
    } catch (error) {
      console.error('Erro ao carregar rotinas:', error);
      $('today-workout-title').textContent = 'Treinos indisponíveis';
      $('today-workout-subtitle').textContent = 'Não foi possível atualizar suas rotinas agora.';
      if (!hasDashboardCache) showToast('Não foi possível carregar suas rotinas agora.');
    }
  };
  const loadSessions = async () => {
    try {
      const sessionSnapshot = await dashboardData.sessions;
      const sessions = sessionSnapshot.docs.map(d => d.data());
      writeDashboardDataCache(user.uid, { sessions, goal: profileData.metaSemanal || 1 });
      setWeek(sessions, profileData.metaSemanal || 1);
    } catch (error) {
      console.error('Erro ao carregar sessões:', error.code, error.message);
      $('weekly-title').textContent = 'Histórico indisponível';
      $('week-days').innerHTML = '<p class="col-span-7 text-center text-xs text-gray-500">Tente novamente mais tarde.</p>';
      if (!hasDashboardCache) showToast(error.code === 'permission-denied' ? 'Sem permissão para ler sessões. Revise as regras do Firestore.' : 'O histórico não pôde ser carregado agora.');
    }
  };
  const loadWeights = async () => {
    try {
      const weightSnapshot = await dashboardData.weights;
      const weights = weightSnapshot.docs.map(d => d.data());
      writeDashboardDataCache(user.uid, { weights });
      const { last, change } = recentWeightTrend(weights);
      if (last) {
        $('dashboard-weight').textContent = `${Number(last.pesoKg).toLocaleString('pt-BR')} kg`;
        $('dashboard-weight-meta').textContent = change === null ? 'Primeiro registro corporal.' : `${change.toLocaleString('pt-BR', { signDisplay: 'always', maximumFractionDigits: 2 })} kg nos últimos 30 dias.`;
      }
      setCardBadgeActive('weight-card-badge', Boolean(last));
    } catch(error) { console.warn('Peso não carregado:',error.message); $('dashboard-weight').textContent='Peso indisponível'; $('dashboard-weight-meta').textContent='Toque para abrir Evolução e tentar novamente.'; }
  };
  await Promise.allSettled([loadRoutines(), loadSessions(), loadWeights()]);
  clearTimeout(window.__molDashboardFallback);
  document.body.setAttribute('aria-busy','false'); renderIcons();
});
renderIcons();
