import { auth, db } from '../config/firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { sessionMetrics } from '../modules/workout-analytics.js';
import { dateOf, monday, safeJSON, sessionsInWeek, weeklyStreak } from '../modules/dashboard-analytics.js';
import { showToast } from '../utils/ui.js';
import { setupAppShell } from '../utils/app-shell.js';
const renderIcons = () => window.lucide?.createIcons();

setupAppShell();

document.documentElement.setAttribute('translate', 'no');
document.documentElement.classList.add('notranslate');

const $ = id => document.getElementById(id);
const draftKey = id => `mol-workout-draft-${id}`;
const dayLabel = ['D','S','T','Q','Q','S','S'];
const defaultCards = [
  { id: 'today-card', label: 'Treino de hoje', visible: true },
  { id: 'next-meal-card', label: 'Próxima refeição', visible: true },
  { id: 'weekly-card', label: 'Progresso semanal', visible: true },
  { id: 'last-session-card', label: 'Última sessão', visible: true },
  { id: 'weight-card', label: 'Evolução de peso', visible: true },
  { id: 'insights-card', label: 'Atalhos e nutrição', visible: true }
];
let dashboardCards = [...defaultCards];
let dashboardUser = null;

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

function setWeek(sessions) {
  const start = monday(); const days = Array.from({length: 7}, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
  const thisWeek = sessionsInWeek(sessions);
  const volume = thisWeek.reduce((sum, session) => sum + sessionMetrics(session).volume, 0);
  $('week-days').innerHTML = days.map(d => { const done = sessions.some(s => dateOf(s)?.toDateString() === d.toDateString()); const today = d.toDateString() === new Date().toDateString(); return `<div class="text-center"><span class="text-[10px] font-semibold text-gray-500">${dayLabel[d.getDay()]}</span><span class="mx-auto mt-2 flex h-8 w-8 items-center justify-center rounded-full text-xs ${done ? 'bg-neon font-extrabold text-white' : today ? 'border border-neon text-neon' : 'bg-white/5 text-gray-500'}">${d.getDate()}</span></div>`; }).join('');
  $('weekly-title').textContent = `${thisWeek.length} treino${thisWeek.length === 1 ? '' : 's'} concluído${thisWeek.length === 1 ? '' : 's'}`;
  $('weekly-sessions').textContent = thisWeek.length;
  $('weekly-volume').textContent = Math.round(volume).toLocaleString('pt-BR');
  $('weekly-streak').textContent = weeklyStreak(sessions);
  const last = [...sessions].sort((a,b) => (dateOf(b)?.getTime() || 0) - (dateOf(a)?.getTime() || 0))[0];
  $('performance-summary').textContent = last ? `Último: ${last.nomeRotina} · ${Math.round(sessionMetrics(last).volume).toLocaleString('pt-BR')} kg.` : 'Conclua o primeiro treino para acompanhar sua evolução.';
  if (last) { $('last-session-title').textContent = last.nomeRotina; $('last-session-meta').textContent = `${Math.round(sessionMetrics(last).volume).toLocaleString('pt-BR')} kg · ${sessionMetrics(last).sets} séries`; }
}

function setToday(routines, user) {
  const draft = safeJSON(localStorage.getItem(draftKey(user.uid)), null);
  const card = $('today-workout-cta');
  if (draft && routines.some(r => r.id === draft.rotinaId)) {
    const routine = routines.find(r => r.id === draft.rotinaId); const series = (draft.exercicios || []).flatMap(ex => ex.series || []); const done = series.filter(s => s.concluida).length;
    $('today-eyebrow').textContent = 'Treino em andamento'; $('today-workout-title').textContent = `Retomar ${routine.nome}`; $('today-workout-subtitle').textContent = `${done}/${series.length} séries · ${Math.floor((draft.tempoSegundos || 0) / 60)} min decorridos`;
    card.innerHTML = '<i data-lucide="play" class="h-4 w-4 fill-current"></i><span>Retomar treino</span>';
  } else if (routines.length) {
    const scheduled = routines.find(r => (r.diasSemana || []).includes(new Date().getDay()));
    const routine = scheduled || routines[0]; const series = (routine.exercicios || []).reduce((sum, ex) => sum + (ex.series?.length || 0), 0);
    $('today-eyebrow').textContent = scheduled ? 'Planejado para hoje' : 'Seu próximo treino';
    $('today-workout-title').textContent = scheduled ? `Hoje é dia de ${routine.nome}` : routine.nome;
    $('today-workout-subtitle').textContent = `${routine.exercicios?.length || 0} exercícios · ${series} séries · cerca de ${Math.max(20, series * 3)} min`;
    card.innerHTML = '<i data-lucide="play" class="h-4 w-4 fill-current"></i><span>Iniciar treino</span>';
  } else {
    $('today-eyebrow').textContent = 'Comece por aqui'; $('today-workout-title').textContent = 'Crie sua primeira rotina'; $('today-workout-subtitle').textContent = 'Monte uma ficha ou use um modelo pronto para treinar hoje.';
    card.innerHTML = '<i data-lucide="plus" class="h-4 w-4"></i><span>Criar rotina</span>';
  }
  renderIcons();
}

function setNextMeal(meals) {
  const card = $('next-meal-card');
  if (!card) return;
  const ordered = [...meals].filter(meal => meal?.hora).sort((a, b) => a.hora.localeCompare(b.hora));
  const now = new Date().toTimeString().slice(0, 5);
  const next = ordered.find(meal => meal.hora >= now) || ordered[0];
  if (!next) { card.classList.add('hidden'); return; }
  $('next-meal-name').textContent = next.nome || 'Refeição';
  const tomorrow = !ordered.some(meal => meal.hora >= now);
  $('next-meal-meta').textContent = `${tomorrow ? 'Amanhã, ' : ''}${next.hora} · ${(next.alimentos || next.itens || []).length} alimento(s)`;
  card.classList.remove('hidden');
}

async function loadNextMeal(userId) {
  try {
    const snapshot = await getDoc(doc(db, 'dietas', userId));
    setNextMeal(snapshot.exists() ? (snapshot.data().refeicoes || []) : []);
  } catch (error) {
    console.warn('Próxima refeição não carregada:', error.message);
  }
}

function setupDashboardCards() {
  const sections = document.querySelectorAll('main > section');
  if (sections[1]) sections[1].id = 'weekly-card';
  if (sections[2]) sections[2].id = 'insights-card';
  if (!document.getElementById('last-session-card')) {
    const card = document.createElement('section');
    card.id = 'last-session-card'; card.className = 'glass-card mb-4 rounded-3xl p-5 animate-slide-up';
    card.innerHTML = '<div class="flex items-center justify-between"><div><p class="text-xs font-semibold uppercase tracking-wider text-gray-400">Última sessão</p><h2 id="last-session-title" class="mt-1 text-lg font-extrabold">Ainda não há sessões</h2><p id="last-session-meta" class="mt-1 text-sm text-gray-500">Conclua um treino para acompanhar.</p></div><i data-lucide="clock-3" class="h-5 w-5 text-neon"></i></div>';
    document.getElementById('weekly-card').after(card);
  }
  if (!document.getElementById('next-meal-card')) {
    const card = document.createElement('section'); card.id = 'next-meal-card'; card.className = 'glass-card mb-4 rounded-3xl p-5 animate-slide-up hidden';
    card.innerHTML = '<a href="./pages/dieta.html" class="flex items-start justify-between gap-4" aria-label="Abrir próxima refeição na dieta"><div><p class="text-xs font-semibold uppercase tracking-wider text-neon">Próxima refeição</p><h2 id="next-meal-name" class="mt-1 text-lg font-extrabold">Refeição</h2><p id="next-meal-meta" class="mt-1 text-sm text-gray-400" aria-live="polite"></p></div><span class="rounded-2xl bg-neon/15 p-3 text-neon"><i data-lucide="utensils" class="h-5 w-5"></i></span></a>';
    document.getElementById('today-card').after(card);
  }
  if (!document.getElementById('weight-card')) {
    const card = document.createElement('section'); card.id = 'weight-card'; card.className = 'glass-card mb-4 rounded-3xl p-5 animate-slide-up';
    card.innerHTML = '<a href="./pages/perfil.html" class="flex items-center justify-between" aria-label="Abrir evolução corporal no perfil"><div><p class="text-xs font-semibold uppercase tracking-wider text-gray-400">Evolução corporal</p><h2 id="dashboard-weight" class="mt-1 text-lg font-extrabold" aria-live="polite">Sem registro de peso</h2><p id="dashboard-weight-meta" class="mt-1 text-sm text-gray-500">Registre seu peso no Perfil.</p></div><span class="rounded-2xl bg-neon/15 p-3 text-neon"><i data-lucide="scale" class="h-5 w-5"></i></span></a>';
    document.getElementById('last-session-card').after(card);
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
  dashboardCards.forEach(card => { const element = document.getElementById(card.id); if (element) element.classList.toggle('hidden', !card.visible); });
  const main = document.querySelector('main'); dashboardCards.forEach(card => { const element = document.getElementById(card.id); if (element) main.appendChild(element); });
}

async function saveDashboardCards() {
  if (!dashboardUser) return;
  localStorage.setItem(`mol-dashboard-${dashboardUser.uid}`, JSON.stringify(dashboardCards));
  try { await setDoc(doc(db, 'users', dashboardUser.uid), { dashboardCards }, { merge: true }); }
  catch (error) { console.warn('Preferências salvas apenas neste dispositivo:', error.message); }
}

function openDashboardEditor() {
  const opener = document.activeElement;
  const originalCards = dashboardCards.map(card => ({ ...card }));
  document.getElementById('mol-dashboard-editor')?.remove();
  const panel = document.createElement('div'); panel.id = 'mol-dashboard-editor'; panel.className = 'fixed inset-0 z-[200] flex items-end bg-black/70 p-4 backdrop-blur-sm sm:items-center';
  const close = (commit = true) => { if (!commit) dashboardCards = originalCards.map(card => ({ ...card })); panel.remove(); opener?.focus?.(); };
  const render = () => { panel.innerHTML = `<section role="dialog" aria-modal="true" aria-labelledby="dashboard-editor-title" class="mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-[#161a17] p-6 animate-slide-up"><div class="mx-auto mb-5 h-1.5 w-11 rounded-full bg-white/20"></div><p class="text-xs font-bold uppercase tracking-[.16em] text-neon">Seu início</p><h2 id="dashboard-editor-title" class="mt-1 text-xl font-extrabold">Editar painel</h2><p class="mt-2 text-sm text-gray-400">Escolha o que quer ver e use as setas para mudar a ordem.</p><div class="mt-5 space-y-2">${dashboardCards.map((card, index) => `<div class="flex min-h-14 items-center gap-2 rounded-2xl bg-white/5 px-3"><button type="button" data-toggle="${card.id}" aria-label="${card.visible ? 'Ocultar' : 'Mostrar'} ${card.label}" class="h-10 w-10 rounded-xl ${card.visible ? 'bg-neon text-white' : 'bg-white/10 text-gray-400'}"><i data-lucide="${card.visible ? 'eye' : 'eye-off'}" class="mx-auto h-4 w-4"></i></button><span class="flex-1 text-sm font-bold">${card.label}</span><button type="button" data-move="${index},-1" aria-label="Mover ${card.label} para cima" ${index === 0 ? 'disabled' : ''} class="h-10 w-10 rounded-xl text-gray-400 active:bg-white/10"><i data-lucide="chevron-up" class="mx-auto h-5 w-5"></i></button><button type="button" data-move="${index},1" aria-label="Mover ${card.label} para baixo" ${index === dashboardCards.length - 1 ? 'disabled' : ''} class="h-10 w-10 rounded-xl text-gray-400 active:bg-white/10"><i data-lucide="chevron-down" class="mx-auto h-5 w-5"></i></button></div>`).join('')}</div><div class="mt-6 grid grid-cols-2 gap-3"><button type="button" data-reset class="min-h-12 rounded-2xl bg-white/5 text-sm font-bold text-gray-300">Restaurar</button><button type="button" data-done class="min-h-12 rounded-2xl bg-neon text-sm font-bold text-white">Concluído</button></div></section>`; renderIcons(); panel.querySelectorAll('[data-toggle]').forEach(button => button.onclick = () => { const card = dashboardCards.find(c => c.id === button.dataset.toggle); card.visible = !card.visible; render(); }); panel.querySelectorAll('[data-move]').forEach(button => button.onclick = () => { const [index, direction] = button.dataset.move.split(',').map(Number); const target = index + direction; if (target >= 0 && target < dashboardCards.length) [dashboardCards[index], dashboardCards[target]] = [dashboardCards[target], dashboardCards[index]]; render(); }); panel.querySelector('[data-reset]').onclick = () => { dashboardCards = defaultCards.map(c => ({...c})); render(); }; panel.querySelector('[data-done]').onclick = async event => { event.currentTarget.disabled = true; applyDashboardCards(); await saveDashboardCards(); close(); }; panel.querySelector('[data-toggle]')?.focus(); };
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

onAuthStateChanged(auth, async user => {
  clearTimeout(window.__molDashboardFallback);
  if (!user) return window.location.href = './pages/login.html';
  dashboardUser = user;
  // O esqueleto do Início não depende do banco: aparece assim que a sessão existe.
  $('app-body').classList.remove('opacity-0');
  $('user-name').textContent = user.displayName?.trim().split(/\s+/)[0] || 'Atleta';
  setupDashboardCards();
  // Carrega a agenda alimentar em paralelo ao restante do painel.
  void loadNextMeal(user.uid);
  // Leituras independentes comeÃ§am juntas, importante em conexÃµes mÃ³veis.
  const dashboardData = {
    routines: getDocs(query(collection(db, 'treinos'), where('userId', '==', user.uid))),
    sessions: getDocs(query(collection(db, 'sessoes'), where('userId', '==', user.uid))),
    weights: getDocs(query(collection(db, 'pesos'), where('userId', '==', user.uid)))
  };
  dashboardCards = normalizeCards(safeJSON(localStorage.getItem(`mol-dashboard-${user.uid}`), null));
  let profileData = {};
  try { const profile = await getDoc(doc(db, 'users', user.uid)); if (profile.exists()) { profileData = profile.data(); dashboardCards = normalizeCards(profileData.dashboardCards || dashboardCards); } } catch (error) { console.warn('Preferências do painel não carregadas:', error.message); }
  applyDashboardCards();
  const fullName = user.displayName || profileData.name || profileData.nome || '';
  $('user-name').textContent = fullName.trim().split(/\s+/)[0] || 'Atleta';
  $('week-label').textContent = new Date().toLocaleDateString('pt-BR', { weekday: 'long' });
  const avatarURL = user.photoURL || profileData.photoURL;
  if (avatarURL) { const avatar=$('user-avatar'); avatar.onerror=()=>{avatar.classList.add('hidden');$('default-avatar-icon').classList.remove('hidden');}; avatar.src=avatarURL; avatar.classList.remove('hidden'); $('default-avatar-icon').classList.add('hidden'); }
  try {
    try {
      const routineSnapshot = await dashboardData.routines;
      const routines = routineSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setToday(routines, user);
    } catch (error) {
      console.error('Erro ao carregar rotinas:', error);
      $('today-workout-title').textContent = 'Treinos indisponíveis';
      $('today-workout-subtitle').textContent = 'Não foi possível atualizar suas rotinas agora.';
      showToast('Não foi possível carregar suas rotinas agora.');
    }
    try {
      const sessionSnapshot = await dashboardData.sessions;
      setWeek(sessionSnapshot.docs.map(d => d.data()));
    } catch (error) {
      console.error('Erro ao carregar sessões:', error.code, error.message);
      $('weekly-title').textContent = 'Histórico indisponível';
      $('week-days').innerHTML = '<p class="col-span-7 text-center text-xs text-gray-500">Tente novamente mais tarde.</p>';
      showToast(error.code === 'permission-denied' ? 'Sem permissão para ler sessões. Revise as regras do Firestore.' : 'O histórico não pôde ser carregado agora.');
    }
    try { const weightSnapshot = await dashboardData.weights; const weights = weightSnapshot.docs.map(d => d.data()).filter(item=>Number.isFinite(Number(item.pesoKg))).sort((a,b)=>(a.registradoEm?.seconds||0)-(b.registradoEm?.seconds||0)); const last=weights.at(-1); if(last){ $('dashboard-weight').textContent=`${Number(last.pesoKg).toLocaleString('pt-BR')} kg`; $('dashboard-weight-meta').textContent=weights.length>1?`${(Number(last.pesoKg)-Number(weights[0].pesoKg)).toLocaleString('pt-BR',{signDisplay:'always'})} kg desde o início.`:'Primeiro registro corporal.'; } } catch(error) { console.warn('Peso não carregado:',error.message); $('dashboard-weight').textContent='Peso indisponível'; $('dashboard-weight-meta').textContent='Não foi possível atualizar este dado.'; }
  } catch (error) {
    console.error('Erro ao carregar rotinas:', error.code, error.message);
    showToast(error.code === 'permission-denied' ? 'Sem permissão para ler treinos. Revise as regras do Firestore.' : 'Não foi possível carregar suas rotinas agora.');
  } finally { document.body.setAttribute('aria-busy','false'); renderIcons(); }
});
renderIcons();
