// js/pages/treino.js
document.title = 'Mol';
import { db } from '../config/firebase-config.js';
import { watchProtectedPage } from '../modules/auth.js';
import { collection, addDoc, getDocs, getDoc, setDoc, query, where, serverTimestamp, doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { activateDialog, showToast, confirmAction, escapeHTML } from '../utils/ui.js';
import { setupAppShell } from '../utils/app-shell.js';
import { SET_METHODS, cleanRoutineExercises, cloneValue, completedWorkoutSnapshot, defaultMethodDetails, elapsedSeconds, isRecoverableWorkoutDraft, normalizeRoutineExercises, normalizeRoutineRecord, setMethod, setSummary, setVolume, validateContextualSet, validateExerciseTargets, validateSet, WORKOUT_LIMITS, WORKOUT_STRUCTURE_LIMITS, workoutTotals } from '../modules/workout-session.js';
import { matchesExerciseSearch, progressionAdvice, rankExerciseSubstitutes } from '../modules/workout-coach.js';
import { estimate1RM } from '../modules/workout-analytics.js';
import { WORKOUT_TEMPLATES } from '../modules/workout-templates.js';
import { detailedExerciseGroup as grupoDetalhado, exerciseEquipment as equipamentoDo, exerciseGuidance as orientacaoDo } from '../modules/exercise-presentation.js';
import { buildExercisePerformanceHistory, MAX_CUSTOM_EXERCISES, normalizeExerciseLibraryPreferences } from '../modules/exercise-library.js';
import { getLocalItem, removeLocalItems, removeSessionItems, setLocalItem } from '../utils/storage.js';
setupAppShell();
const renderIcons = (root = document) => window.lucide?.createIcons({ root });

let usuarioAtual = null;
let rotinasReais = [];
let rotinaAbertaId = null;

let tempoSegundos = 0;
let timerInterval = null;
let treinoIniciado = false;
let sessaoIniciadaEm = null;
let descansoSegundos = 90;
let descansoTotal = 90;
let descansoInterval = null;
let descansoPausado = false;
let finalizandoTreino = false;
let checkinPreTreino = null;
let descansoTerminaEm = null;
let descansoContexto = null;
let ultimoRascunhoSalvoEm = 0;
let wakeLock = null;
let modoCompacto = getLocalItem('mol-workout-compact') === 'true';
let substituirExercicioIndex = null;
const requestedWorkout = new URLSearchParams(window.location.search);

function withTimeout(promise, label, milliseconds = 9000) {
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(`${label} excedeu o tempo de resposta.`)), milliseconds); })
  ]).finally(() => clearTimeout(timer));
}
const draftKey = (id) => `mol-workout-draft-${id}`;
const routinesCacheKey = id => `mol-workout-routines-${id}`;
function readRoutinesCache(id) {
  try {
    const cached = JSON.parse(getLocalItem(routinesCacheKey(id)) || 'null');
    return Array.isArray(cached?.routines) ? cached.routines.map(item => ({ id: item.id, ...normalizeRoutineRecord(item) })) : null;
  } catch {
    removeLocalItems(routinesCacheKey(id));
    return null;
  }
}
function writeRoutinesCache() {
  if (!usuarioAtual) return;
  setLocalItem(routinesCacheKey(usuarioAtual.uid), JSON.stringify({ routines: rotinasReais, updatedAt: Date.now() }));
}
function lerRascunho(id) {
  try { return JSON.parse(getLocalItem(draftKey(id)) || 'null'); }
  catch { removeLocalItems(draftKey(id)); return null; }
}
function salvarRascunho({ force = false } = {}) {
  if (!usuarioAtual || !rotinaAbertaId) return;
  if (!force && Date.now() - ultimoRascunhoSalvoEm < 5000) return;
  const rotina = rotinasReais.find(r => r.id === rotinaAbertaId);
  if (!rotina) return;
  if (setLocalItem(draftKey(usuarioAtual.uid), JSON.stringify({ versao: 2, rotinaId: rotinaAbertaId, exercicios: rotina.exercicios, tempoSegundos, atualizadoEm: new Date().toISOString(), iniciadaEm: sessaoIniciadaEm?.toISOString(), checkinPreTreino }))) ultimoRascunhoSalvoEm = Date.now();
}
function limparRascunho() { if (usuarioAtual) removeLocalItems(draftKey(usuarioAtual.uid)); }
function exerciciosParaPersistir(rotina) { return treinoIniciado ? cleanRoutineExercises(rotina.exercicios) : rotina.exercicios; }

import { bibliotecaDeExercicios } from '../data/exercicios-data.js';
// Funciona tanto no Live Server quanto no build do Vite, sem tentar executar o SVG como JavaScript.
const exerciseFigure = new URL('../../assets/exercise-figure.svg', import.meta.url).href;
let favoritosExercicios = [];
let recentesExercicios = [];
let exerciciosPersonalizados = [];
const ultimaPerformance = new Map();
const historicoPerformance = new Map();
const bibliotecaKey = () => `mol-exercise-library-${usuarioAtual?.uid || 'guest'}`;
function applyLibraryPreferences(value) {
  ({ favoritosExercicios, recentesExercicios, exerciciosPersonalizados } = normalizeExerciseLibraryPreferences(value));
  exerciciosPersonalizados.forEach(ex => { if (!bibliotecaDeExercicios.some(item => item.nome.toLocaleLowerCase('pt-BR') === ex.nome.toLocaleLowerCase('pt-BR'))) bibliotecaDeExercicios.push(ex); });
}
function salvarPreferenciasBiblioteca() {
  const preferences = normalizeExerciseLibraryPreferences({ favoritosExercicios, recentesExercicios, exerciciosPersonalizados });
  ({ favoritosExercicios, recentesExercicios, exerciciosPersonalizados } = preferences);
  setLocalItem(bibliotecaKey(), JSON.stringify(preferences));
  if (usuarioAtual) setDoc(doc(db, 'users', usuarioAtual.uid), { exerciseLibraryPreferences: preferences }, { merge: true }).catch(error => console.warn('Preferências locais não sincronizadas:', error.message));
}
function carregarPreferenciasBiblioteca() {
  try { applyLibraryPreferences(JSON.parse(getLocalItem(bibliotecaKey()) || '{}')); }
  catch { applyLibraryPreferences(); }
}
async function carregarPreferenciasDaConta() {
  try {
    const snapshot = await withTimeout(getDoc(doc(db, 'users', usuarioAtual.uid)), 'As preferências da conta');
    const prefs = snapshot.data()?.exerciseLibraryPreferences;
    if (!prefs) return;
    applyLibraryPreferences(prefs);
    setLocalItem(bibliotecaKey(), JSON.stringify({ favoritosExercicios, recentesExercicios, exerciciosPersonalizados }));
    renderizarBiblioteca(inputBuscaExercicio?.value || '');
  } catch (error) { console.warn('Preferências da conta não carregadas:', error.message); }
}
async function carregarUltimasPerformances() {
  try {
    const snapshot = await withTimeout(getDocs(query(collection(db, 'sessoes'), where('userId', '==', usuarioAtual.uid))), 'As últimas performances');
    const performance = buildExercisePerformanceHistory(snapshot.docs.map(item => item.data()));
    ultimaPerformance.clear();
    historicoPerformance.clear();
    performance.latest.forEach((value, key) => ultimaPerformance.set(key, value));
    performance.history.forEach((value, key) => historicoPerformance.set(key, value));
    renderizarBiblioteca(inputBuscaExercicio?.value || '');
  } catch (error) {
    console.warn('Últimas performances não carregadas:', error.message);
  }
}
function registrarRecente(nome) { recentesExercicios = [nome, ...recentesExercicios.filter(item => item !== nome)].slice(0, 12); salvarPreferenciasBiblioteca(); }

function valorAnteriorDaSerie(exercicio, indexSerie) {
  const serie = exercicio?.series?.[indexSerie] || {};
  const direto = {
    kg: serie.anteriorKg,
    reps: serie.anteriorReps,
    rir: serie.anteriorRir,
  };
  if (direto.kg !== '' && direto.kg != null && Number(direto.reps) > 0) return direto;

  const ultimoExercicio = ultimaPerformance.get(exercicio?.nome);
  const porIndice = ultimoExercicio?.sets?.find(item => item.index === indexSerie);
  if (porIndice && porIndice.kg >= 0 && Number(porIndice.reps) > 0) return porIndice;

  return null;
}

function completarComAnteriorSeVazio({ exercicio, indexSerie, kg, reps, rir }) {
  const anterior = valorAnteriorDaSerie(exercicio, indexSerie);
  return {
    kg: kg || (anterior?.kg ?? ''),
    reps: reps || (anterior?.reps ?? ''),
    rir: rir || (anterior?.rir ?? ''),
    usadoAnterior: (!kg || !reps) && Boolean(anterior),
  };
}

const methodMeta = {
  [SET_METHODS.DROP_SET]: { label: 'Drop Set', badge: 'DS', tone: 'text-blue-400 bg-blue-400/10' },
  [SET_METHODS.REST_PAUSE]: { label: 'Rest-Pause', badge: 'RP', tone: 'text-neon bg-neon/10' },
  [SET_METHODS.MYO_REPS]: { label: 'Myo-Reps', badge: 'MY', tone: 'text-neon bg-neon/10' },
  [SET_METHODS.CLUSTER]: { label: 'Cluster', badge: 'CL', tone: 'text-neon bg-neon/10' },
  [SET_METHODS.ISOMETRIC]: { label: 'Isometria', badge: 'ISO', tone: 'text-orange-400 bg-orange-400/10' }
};

function isAdvancedSet(serie) { return setMethod(serie) !== SET_METHODS.NORMAL; }

function syncSetLegacyFields(serie) {
  const method = setMethod(serie);
  const details = serie.details || {};
  if (method === SET_METHODS.DROP_SET) {
    serie.kg = details.primary?.kg ?? '';
    serie.reps = details.primary?.reps ?? '';
  } else if (method === SET_METHODS.REST_PAUSE || method === SET_METHODS.CLUSTER || method === SET_METHODS.ISOMETRIC) {
    serie.kg = details.kg ?? '';
    serie.reps = method === SET_METHODS.ISOMETRIC ? (details.reps ?? '') : ((details.blocks || []).filter(Boolean)[0] ?? '');
  } else if (method === SET_METHODS.MYO_REPS) {
    serie.kg = details.activation?.kg ?? '';
    serie.reps = details.activation?.reps ?? '';
  }
}

async function manterTelaAtiva() {
  if (!treinoIniciado || document.visibilityState !== 'visible' || !navigator.wakeLock?.request) return;
  try {
    if (!wakeLock) {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => { wakeLock = null; }, { once: true });
    }
  } catch (error) { console.warn('Tela ativa indisponível:', error.message); }
}

async function liberarTelaAtiva() {
  if (!wakeLock) return;
  try { await wakeLock.release(); }
  catch (error) { console.warn('Bloqueio de tela não liberado:', error.message); }
  finally { wakeLock = null; }
}

document.addEventListener('visibilitychange', () => {
  if (treinoIniciado) salvarRascunho({ force: true });
  if (document.visibilityState === 'visible' && treinoIniciado) void manterTelaAtiva();
});

// Evita perder séries preenchidas ao trocar de página ou fechar o app.
window.addEventListener('pagehide', () => salvarRascunho({ force: true }));
window.addEventListener('beforeunload', event => {
  if (!treinoIniciado) return;
  salvarRascunho({ force: true });
  event.preventDefault();
  event.returnValue = '';
});

window.alternarModoCompacto = () => {
  modoCompacto = !modoCompacto;
  setLocalItem('mol-workout-compact', String(modoCompacto));
  if (rotinaAbertaId) abrirRotina(rotinaAbertaId);
};
window.alternarFavoritoExercicio = nome => { favoritosExercicios = favoritosExercicios.includes(nome) ? favoritosExercicios.filter(item => item !== nome) : [...favoritosExercicios, nome]; salvarPreferenciasBiblioteca(); renderizarBiblioteca(inputBuscaExercicio?.value || ''); };

const viewRotinas = document.getElementById('view-rotinas');
const viewDetalhe = document.getElementById('view-detalhe');
const viewNovaRotina = document.getElementById('view-nova-rotina');
const viewExplorar = document.getElementById('view-explorar');
const viewBiblioteca = document.getElementById('view-biblioteca');

const rotinasList = document.getElementById('rotinas-list');
const exerciciosList = document.getElementById('exercicios-list');
const bibliotecaList = document.getElementById('biblioteca-list');
const detalheTitulo = document.getElementById('detalhe-titulo');
const inputNomeRotina = document.getElementById('input-nome-rotina');
const inputHorarioRotina = document.getElementById('input-horario-rotina');
const routineDays = document.getElementById('routine-days');

const btnNovaRotina = document.getElementById('btn-nova-rotina');
const btnExplorar = document.getElementById('btn-explorar');
const btnVoltar = document.getElementById('btn-voltar');
const btnVoltarNova = document.getElementById('btn-voltar-nova');
const btnVoltarExplorar = document.getElementById('btn-voltar-explorar');
const btnVoltarBiblioteca = document.getElementById('btn-voltar-biblioteca');
const btnSalvarNova = document.getElementById('btn-salvar-nova');
const btnAddExercicio = document.getElementById('btn-add-exercicio');
const inputBuscaExercicio = document.getElementById('input-busca-exercicio');
const inputBuscaRotina = document.getElementById('input-busca-rotina');
const libraryResultsSummary = document.getElementById('library-results-summary');

function configurarPainelDescanso() {
  const panel = document.getElementById('rest-timer');
  if (!panel) return;
  panel.className = 'rest-timer-panel hidden is-expanded rounded-3xl border border-neon/30 mol-dialog-surface p-4 shadow-2xl backdrop-blur-xl';
  panel.setAttribute('aria-label', 'Cronometro de descanso');
  panel.innerHTML = `
    <div class="rest-mini">
      <button type="button" id="btn-open-rest" class="flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl bg-white/5 px-4 text-left">
        <span class="min-w-0"><span class="block text-[10px] font-bold uppercase tracking-[.16em] text-neon">Descanso</span><span id="rest-mini-title" class="block truncate text-sm font-bold text-white">Proxima serie</span></span>
        <span id="rest-mini-time" class="shrink-0 text-xl font-extrabold tabular-nums text-white">01:30</span>
      </button>
      <div class="mt-2 h-1 overflow-hidden rounded-full bg-white/10"><div id="rest-mini-progress" class="h-full w-full bg-neon transition-[width] duration-1000"></div></div>
    </div>
    <div class="rest-expanded">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p id="rest-label" class="text-[10px] font-bold uppercase tracking-[.16em] text-neon">Descanso inteligente</p>
          <h2 id="rest-exercise" class="mt-1 truncate text-lg font-extrabold">Exercicio</h2>
          <p id="rest-next" class="mt-1 text-xs text-gray-400">Proxima serie</p>
        </div>
        <button type="button" id="btn-collapse-rest" class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-gray-300" aria-label="Minimizar descanso"><i data-lucide="chevron-down" class="h-4 w-4"></i></button>
      </div>
      <div class="mt-5 grid place-items-center">
        <div id="rest-ring" class="rest-ring relative">
          <div class="text-center">
            <span class="block text-[10px] font-bold uppercase tracking-[.16em] text-neon">Restam</span>
            <span id="rest-time" class="mt-1 block text-[2.7rem] font-extrabold leading-none tabular-nums text-white">01:30</span>
          </div>
        </div>
      </div>
      <p id="rest-hint" class="mt-4 min-h-5 text-center text-xs font-semibold text-gray-400">Recupere a respiracao</p>
      <div class="mt-5 grid grid-cols-4 gap-2">
        <button type="button" id="btn-sub-rest" class="min-h-11 rounded-xl bg-white/5 text-xs font-bold text-gray-300">-15s</button>
        <button type="button" id="btn-pause-rest" class="min-h-11 rounded-xl bg-white/5 text-xs font-bold text-gray-300">Pausar</button>
        <button type="button" id="btn-add-rest" class="min-h-11 rounded-xl bg-white/5 text-xs font-bold text-gray-300">+15s</button>
        <button type="button" id="btn-skip-rest" class="min-h-11 rounded-xl bg-neon text-xs font-bold text-black">Pular</button>
      </div>
      <div class="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10"><div id="rest-progress" class="h-full w-full bg-neon transition-[width] duration-1000"></div></div>
    </div>`;
}

configurarPainelDescanso();
const restTimer = document.getElementById('rest-timer');
const restTime = document.getElementById('rest-time');
const restProgress = document.getElementById('rest-progress');
const restMiniTime = document.getElementById('rest-mini-time');
const restMiniTitle = document.getElementById('rest-mini-title');
const restMiniProgress = document.getElementById('rest-mini-progress');
const restRing = document.getElementById('rest-ring');
const restExercise = document.getElementById('rest-exercise');
const restNext = document.getElementById('rest-next');
const restHint = document.getElementById('rest-hint');
const btnPauseRest = document.getElementById('btn-pause-rest');
document.getElementById('btn-concluir-treino')?.addEventListener('click', () => window.finalizarEConcluirTreino());

watchProtectedPage(user => {
    usuarioAtual = user;
    carregarPreferenciasBiblioteca();
    void carregarPreferenciasDaConta();
    void carregarUltimasPerformances();
    carregarRotinasDoBanco();
    renderizarBiblioteca();
    document.body.setAttribute('aria-busy', 'false');
    renderIcons();
});

async function carregarRotinasDoBanco() {
  const cachedRoutines = readRoutinesCache(usuarioAtual.uid);
  if (cachedRoutines) {
    rotinasReais = cachedRoutines;
    renderRotinas();
  } else {
    rotinasList.innerHTML = '<p class="text-sm text-gray-500 text-center mt-4">Carregando seus treinos...</p>';
  }
  try {
    const q = query(collection(db, "treinos"), where("userId", "==", usuarioAtual.uid));
    const querySnapshot = await withTimeout(getDocs(q), 'As rotinas');
    rotinasReais = [];
    querySnapshot.forEach(item => { rotinasReais.push({ id: item.id, ...normalizeRoutineRecord(item.data()) }); });
    writeRoutinesCache();
    renderRotinas();
    let draft = lerRascunho(usuarioAtual.uid);
    if (draft && !isRecoverableWorkoutDraft(draft, rotinasReais.map(routine => routine.id))) { limparRascunho(); draft = null; }
    if (draft) {
      const recuperar = await confirmAction({ title: 'Retomar treino?', message: 'Encontramos um treino que ficou em andamento neste dispositivo.', confirmText: 'Retomar', cancelText: 'Descartar' });
      if (!recuperar) { limparRascunho(); return; }
      const routine = rotinasReais.find(r => r.id === draft.rotinaId);
      routine.exercicios = normalizeRoutineExercises(cloneValue(draft.exercicios));
      sessaoIniciadaEm = new Date(draft.iniciadaEm);
      tempoSegundos = elapsedSeconds(sessaoIniciadaEm);
      checkinPreTreino = draft.checkinPreTreino || null;
      treinoIniciado = true;
      if (!timerInterval) timerInterval = setInterval(atualizarCronometro, 1000);
      void manterTelaAtiva();
      showToast(`Treino em andamento recuperado: ${routine.nome}`, 'success'); abrirRotina(routine.id); return;
    }
    const requestedRoutineId = requestedWorkout.get('rotina');
    if (requestedWorkout.get('acao') === 'nova') btnNovaRotina.click();
    else if (requestedRoutineId && rotinasReais.some(routine => routine.id === requestedRoutineId)) await iniciarRotinaComCheckin(requestedRoutineId);
  } catch (error) {
    console.error("Erro ao buscar:", error);
    if (cachedRoutines) return;
    rotinasList.innerHTML = '<div class="mol-state my-10"><p class="mol-state-title text-red-300">Não foi possível carregar suas rotinas.</p><button id="retry-routines" type="button" class="mol-state-action mt-4">Tentar novamente</button></div>';
    document.getElementById('retry-routines')?.addEventListener('click', carregarRotinasDoBanco);
    showToast(error.code === 'permission-denied' ? 'Sem permissão para ler treinos. Revise as regras do Firestore.' : 'Não foi possível carregar suas rotinas.');
  }
}

function esconderTudo() {
  viewRotinas.classList.add('hidden');
  viewDetalhe.classList.add('hidden');
  viewNovaRotina.classList.add('hidden');
  viewExplorar.classList.add('hidden');
  viewBiblioteca.classList.add('hidden');
}

function renderWorkoutTemplates() {
  viewExplorar.querySelector('.text-center')?.remove();
  let list = document.getElementById('templates-list');
  if (!list) {
    list = document.createElement('div');
    list.id = 'templates-list';
    list.className = 'space-y-3';
    viewExplorar.appendChild(list);
  }
  list.innerHTML = `<p class="text-sm text-gray-400">Comece com uma estrutura editável e ajuste depois.</p>${Object.entries(WORKOUT_TEMPLATES).map(([name, template]) => `<button type="button" data-template-name="${escapeHTML(name)}" class="w-full rounded-2xl border border-white/10 mol-panel p-4 text-left active:scale-[.98]"><span class="block font-bold">${escapeHTML(name)}</span><span class="mt-1 block text-xs text-gray-500">${escapeHTML(template.description)}</span><span class="mt-3 inline-flex rounded-full bg-neon/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-neon">${template.exercises.length} exercícios</span></button>`).join('')}`;
  list.querySelectorAll('[data-template-name]').forEach(button => button.addEventListener('click', () => void window.criarTemplate(button.dataset.templateName)));
}

btnNovaRotina.addEventListener("click", () => { esconderTudo(); viewNovaRotina.classList.remove("hidden"); inputNomeRotina.focus(); renderIcons(); });
btnExplorar?.addEventListener("click", () => {
  esconderTudo();
  viewExplorar.classList.remove("hidden");
  renderWorkoutTemplates();
  renderIcons();
});
inputBuscaRotina?.addEventListener('input', renderRotinas);

if (btnVoltar) {
  btnVoltar.addEventListener('click', async () => {
    if (treinoIniciado && rotinaAbertaId) {
      const confirmar = await confirmAction({ title: 'Encerrar treino?', message: 'Todos os dados preenchidos nesta sessão serão descartados.', confirmText: 'Encerrar', danger: true });
      if (!confirmar) return; // Se cancelar, não faz nada

      // Reseta os rascunhos da sessão atual no banco para não acumular lixo
      const rotina = rotinasReais.find(r => r.id === rotinaAbertaId);
      if (rotina && rotina.exercicios) {
        const exerciciosLimpos = cleanRoutineExercises(rotina.exercicios);
        const rotinaIdCancelada = rotinaAbertaId;
        rotina.exercicios = exerciciosLimpos;
        updateDoc(doc(db, "treinos", rotinaIdCancelada), { exercicios: exerciciosLimpos })
          .catch(error => console.warn('Limpeza remota do treino cancelado falhou:', error.message));
      }
    }

    limparRascunho(); pararCronometro();
    pararDescanso();
    esconderTudo();
    viewRotinas.classList.remove('hidden');
    rotinaAbertaId = null;
    carregarRotinasDoBanco();
  });
}

btnVoltarNova.addEventListener('click', () => { esconderTudo(); viewRotinas.classList.remove('hidden'); });
btnVoltarExplorar.addEventListener('click', () => { esconderTudo(); viewRotinas.classList.remove('hidden'); });
btnVoltarBiblioteca.addEventListener('click', () => { substituirExercicioIndex = null; filtroMuscular = ''; esconderTudo(); viewDetalhe.classList.remove('hidden'); });

function resetarScrollBiblioteca() {
  viewBiblioteca?.scrollTo?.(0, 0);
  document.querySelector('.app-surface main')?.scrollTo?.(0, 0);
  window.scrollTo(0, 0);
}

const formatarDescanso = seconds => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

function proximaSerie(indexExercicio, indexSerie) {
  const rotina = rotinasReais.find(r => r.id === rotinaAbertaId);
  const exercicios = rotina?.exercicios || [];
  for (let exIndex = indexExercicio; exIndex < exercicios.length; exIndex++) {
    const startSet = exIndex === indexExercicio ? indexSerie + 1 : 0;
    const nextSetIndex = (exercicios[exIndex].series || []).findIndex((serie, setIndex) => setIndex >= startSet && !serie.concluida);
    if (nextSetIndex >= 0) return { exercicio: exercicios[exIndex], indexSerie: nextSetIndex };
  }
  return null;
}

function descansoSugerido(exercicio, serie) {
  const base = Number(exercicio?.descansoSegundos) || 90;
  let ajuste = 0;
  if (serie?.tipo === 'W') ajuste -= 30;
  if (serie?.tipo === 'F') ajuste += 30;
  if (serie?.tipo === 'D') ajuste += 45;
  const rir = Number(serie?.rir);
  if (Number.isFinite(rir) && rir <= 1) ajuste += 30;
  if (Number.isFinite(rir) && rir >= 4) ajuste -= 15;
  return Math.max(15, Math.min(WORKOUT_LIMITS.rest, base + ajuste));
}

function contextoDescanso(indexExercicio, indexSerie) {
  const rotina = rotinasReais.find(r => r.id === rotinaAbertaId);
  const exercicio = rotina?.exercicios?.[indexExercicio] || rotina?.exercicios?.find(ex => ex.series?.some(s => s.concluida));
  const serie = exercicio?.series?.[indexSerie] || null;
  const next = proximaSerie(indexExercicio, indexSerie);
  const nextSet = next?.exercicio?.series?.[next.indexSerie];
  const nextKg = nextSet?.kg || nextSet?.anteriorKg || serie?.kg || '';
  const nextReps = nextSet?.reps || nextSet?.anteriorReps || serie?.reps || '';
  return {
    seconds: descansoSugerido(exercicio, serie),
    title: exercicio?.nome || 'Descanso',
    nextTitle: next
      ? `Proxima: serie ${next.indexSerie + 1} de ${next.exercicio.series.length}${nextKg || nextReps ? ` - ${nextKg || '-'} kg - ${nextReps || '-'} reps` : ''}`
      : 'Ultima serie registrada. Voce pode finalizar o treino.',
    hint: serie?.tipo === 'W'
      ? 'Aquecimento: mantenha o ritmo'
      : Number(serie?.rir) <= 1 || ['F', 'D'].includes(serie?.tipo)
        ? 'Serie pesada: recupere de verdade'
        : 'Recupere a respiracao'
  };
}

function ajustarDescanso(delta) {
  if (!descansoTerminaEm && !descansoPausado) return;
  descansoSegundos = Math.max(0, Math.min(WORKOUT_LIMITS.rest, descansoSegundos + delta));
  descansoTotal = Math.max(15, Math.min(WORKOUT_LIMITS.rest, descansoTotal + delta));
  if (!descansoPausado) descansoTerminaEm = Date.now() + descansoSegundos * 1000;
  atualizarDescanso();
}

function atualizarDescanso() {
  if (descansoTerminaEm && !descansoPausado) descansoSegundos = Math.max(0, Math.ceil((descansoTerminaEm - Date.now()) / 1000));
  const display = formatarDescanso(descansoSegundos);
  const progress = Math.max(0, Math.min(1, descansoTotal ? descansoSegundos / descansoTotal : 0));
  restTime.textContent = display;
  if (restMiniTime) restMiniTime.textContent = display;
  if (restProgress) restProgress.style.width = `${progress * 100}%`;
  if (restMiniProgress) restMiniProgress.style.width = `${progress * 100}%`;
  if (restRing) restRing.style.setProperty('--rest-progress', String(progress));
  if (restExercise && descansoContexto) restExercise.textContent = descansoContexto.title;
  if (restNext && descansoContexto) restNext.textContent = descansoContexto.nextTitle;
  if (restMiniTitle && descansoContexto) restMiniTitle.textContent = descansoContexto.title;
  if (restHint && descansoContexto) restHint.textContent = descansoPausado ? 'Descanso pausado' : descansoContexto.hint;
  if (btnPauseRest) btnPauseRest.textContent = descansoPausado ? 'Retomar' : 'Pausar';
}

function pararDescanso() {
  clearInterval(descansoInterval);
  descansoInterval = null;
  descansoTerminaEm = null;
  descansoPausado = false;
  descansoContexto = null;
  restTimer.classList.add('hidden');
  restTimer.classList.add('is-expanded');
  document.body.classList.remove('rest-active');
}

function iniciarDescanso(indexExercicio, indexSerie = 0) {
  clearInterval(descansoInterval);
  descansoContexto = contextoDescanso(indexExercicio, indexSerie);
  descansoSegundos = descansoContexto.seconds;
  descansoTotal = descansoSegundos;
  descansoTerminaEm = Date.now() + descansoSegundos * 1000;
  descansoPausado = false;
  restTimer.classList.remove('hidden');
  restTimer.classList.add('is-expanded');
  document.body.classList.add('rest-active');
  atualizarDescanso();
  descansoInterval = setInterval(() => {
    atualizarDescanso();
    if (descansoSegundos <= 0) { pararDescanso(); showToast('Descanso concluido. Vamos para a proxima!', 'success'); }
  }, 1000);
  renderIcons(restTimer);
}

document.getElementById('btn-skip-rest')?.addEventListener('click', pararDescanso);
document.getElementById('btn-sub-rest')?.addEventListener('click', () => ajustarDescanso(-15));
document.getElementById('btn-add-rest')?.addEventListener('click', () => {
  if (descansoTotal >= WORKOUT_LIMITS.rest) return showToast('O descanso maximo e de 60 minutos.');
  ajustarDescanso(15);
});
document.getElementById('btn-pause-rest')?.addEventListener('click', () => {
  if (!descansoTerminaEm && !descansoPausado) return;
  if (descansoPausado) {
    descansoTerminaEm = Date.now() + descansoSegundos * 1000;
    descansoPausado = false;
  } else {
    descansoSegundos = Math.max(0, Math.ceil((descansoTerminaEm - Date.now()) / 1000));
    descansoTerminaEm = null;
    descansoPausado = true;
  }
  atualizarDescanso();
});
document.getElementById('btn-collapse-rest')?.addEventListener('click', () => restTimer.classList.remove('is-expanded'));
document.getElementById('btn-open-rest')?.addEventListener('click', () => restTimer.classList.add('is-expanded'));

document.addEventListener('input', (event) => {
  const match = event.target.id?.match(/^(kg|reps|rir)-(\d+)-(\d+)$/);
  if (!match || !rotinaAbertaId) return;
  const [, campo, exIndex, serieIndex] = match;
  const rotina = rotinasReais.find(r => r.id === rotinaAbertaId);
  if (!rotina?.exercicios?.[exIndex]?.series?.[serieIndex]) return;
  rotina.exercicios[exIndex].series[serieIndex][campo] = event.target.value;
  salvarRascunho({ force: true });
});

function atualizarCronometro() {
  if (!treinoIniciado || !sessaoIniciadaEm) return;
  tempoSegundos = elapsedSeconds(sessaoIniciadaEm);
  atualizarDisplayTempo();
  salvarRascunho();
}

function iniciarCronometroGlobal() {
  if (treinoIniciado) return;
  treinoIniciado = true;
  sessaoIniciadaEm = new Date();
  tempoSegundos = 0;
  if (timerInterval) clearInterval(timerInterval);
  salvarRascunho({ force: true });
  timerInterval = setInterval(atualizarCronometro, 1000);
  void manterTelaAtiva();
}

function pararCronometro() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  treinoIniciado = false;
  tempoSegundos = 0;
  sessaoIniciadaEm = null;
  checkinPreTreino = null;
  void liberarTelaAtiva();
}

function atualizarDisplayTempo() {
  const elTempo = document.getElementById('treino-tempo');
  if (!elTempo) return;

  const hrs = Math.floor(tempoSegundos / 3600);
  const mins = Math.floor((tempoSegundos % 3600) / 60);
  const secs = tempoSegundos % 60;

  if (hrs > 0) {
    elTempo.textContent = `${hrs}h ${mins}m`;
  } else if (mins > 0) {
    elTempo.textContent = `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  } else {
    elTempo.textContent = `${secs}s`;
  }
}

function resumoComparativo(volume) {
  const comparisons = [
    [2500, 'um carro compacto'],
    [1200, 'um piano de cauda'],
    [600, 'um dinossauro pequeno'],
    [250, 'um gorila adulto'],
    [100, 'um halter pesado']
  ];
  const match = comparisons.find(([threshold]) => volume >= threshold);
  return match ? `Seu volume foi equivalente a levantar ${match[1]} (comparação divertida).` : 'Cada quilo conta — hoje você colocou a força em movimento.';
}

function novosRecordesDaSessao(exercicios) {
  let total = 0;
  exercicios.forEach(exercicio => {
    const anterior = (historicoPerformance.get(exercicio.nome) || []).reduce((best, item) => Math.max(best, estimate1RM(item.kg, item.reps)), 0);
    const atual = (exercicio.series || []).reduce((best, serie) => serie.concluida ? Math.max(best, estimate1RM(serie.kg, serie.reps)) : best, 0);
    if (atual > 0 && atual > anterior) total += 1;
  });
  return total;
}

function destaqueDaSessao(exercicios = []) {
  return (Array.isArray(exercicios) ? exercicios : []).map(exercicio => {
    const volume = (exercicio.series || []).filter(serie => serie.concluida).reduce((sum, serie) => sum + setVolume(serie), 0);
    const best = (exercicio.series || []).reduce((max, serie) => serie.concluida ? Math.max(max, estimate1RM(serie.kg, serie.reps)) : max, 0);
    return { nome: exercicio.nome, volume, best };
  }).filter(item => item.volume > 0 || item.best > 0).sort((a, b) => b.volume - a.volume || b.best - a.best)[0] || null;
}

function proximaSerieTexto(exercicio, conselho) {
  const ultimo = ultimaPerformance.get(exercicio.nome);
  const latest = ultimo?.sets?.find(item => Number(item.kg) >= 0 && Number(item.reps) > 0);
  if (!latest) return `Primeira referência: busque ${exercicio.repsMin || 8}-${exercicio.repsMax || 12} reps com técnica limpa.`;
  if (conselho?.state === 'increase' && conselho.suggestedWeight) return `Próxima: ${conselho.suggestedWeight.toLocaleString('pt-BR')} kg tentando ${exercicio.repsMin || 8}+ reps.`;
  if (conselho?.state === 'reduce' && conselho.suggestedWeight) return `Próxima: reduza para ${conselho.suggestedWeight.toLocaleString('pt-BR')} kg e recupere a execução.`;
  return `Próxima: ${latest.kg} kg buscando ${Number(latest.reps) + 1} reps ou mesmo RIR.`;
}

async function compartilharResumoTreino(summary) {
  const canvas = document.createElement('canvas');
  canvas.width = 1080; canvas.height = 1350;
  const context = canvas.getContext('2d');
  if (!context) return showToast('Não foi possível criar a imagem do resumo.');
  const background = context.createLinearGradient(0, 0, 1080, 1350);
  const fillCard = (x, y, width, height, radius = 26) => { context.beginPath(); if (context.roundRect) context.roundRect(x, y, width, height, radius); else context.rect(x, y, width, height); context.fill(); };
  background.addColorStop(0, '#0b1710'); background.addColorStop(1, '#050806');
  context.fillStyle = background; context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#57d493'; context.font = '700 34px Inter, sans-serif'; context.fillText('MOL', 72, 100);
  context.fillStyle = '#f8fafc'; context.font = '800 62px Inter, sans-serif'; context.fillText('Treino concluído', 72, 205);
  context.fillStyle = '#8b9a91'; context.font = '400 30px Inter, sans-serif'; context.fillText('Seu esforço de hoje ficou registrado.', 72, 255);
  const cards = [['SÉRIES', summary.series], ['VOLUME', `${Math.round(summary.volume).toLocaleString('pt-BR')} kg`], ['DURAÇÃO', `${summary.minutos} min`], ['EXERCÍCIOS', summary.exercicios], ['NOVOS RECORDES', summary.records]];
  cards.forEach(([label, value], index) => { const x = 72 + (index % 2) * 480; const y = 350 + Math.floor(index / 2) * 190; context.fillStyle = '#142219'; fillCard(x, y, 420, 140); context.fillStyle = '#8b9a91'; context.font = '700 22px Inter, sans-serif'; context.fillText(label, x + 28, y + 42); context.fillStyle = index === 1 || index === 4 ? '#57d493' : '#f8fafc'; context.font = '800 42px Inter, sans-serif'; context.fillText(String(value), x + 28, y + 98); });
  context.fillStyle = '#1d3b28'; fillCard(72, 890, 936, 190);
  context.fillStyle = '#57d493'; context.font = '700 24px Inter, sans-serif'; context.fillText('COMPARAÇÃO MOL', 104, 945);
  context.fillStyle = '#f8fafc'; context.font = '600 30px Inter, sans-serif';
  const comparison = summary.comparison; const words = comparison.match(/.{1,48}(?:\s|$)/g) || [comparison];
  words.slice(0, 3).forEach((line, index) => context.fillText(line.trim(), 104, 995 + index * 38));
  context.fillStyle = '#52645a'; context.font = '400 22px Inter, sans-serif'; context.fillText(new Date().toLocaleDateString('pt-BR'), 72, 1240);
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png')); if (!blob) return showToast('Não foi possível exportar a imagem.');
  const file = new File([blob], 'mol-resumo-treino.png', { type: 'image/png' });
  try {
    if (navigator.canShare?.({ files: [file] })) { await navigator.share({ title: 'Meu treino no Mol', files: [file] }); return; }
    const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = file.name; link.click(); URL.revokeObjectURL(url); showToast('Imagem do resumo baixada.', 'success');
  } catch (error) { if (error?.name !== 'AbortError') showToast('Não foi possível compartilhar o resumo.'); }
}

function mostrarResumoTreino({ series, volume, exercicios, duracao, exerciciosDetalhados = [] }) {
  document.getElementById('mol-workout-summary')?.remove();
  const minutos = Math.max(1, Math.round(duracao / 60));
  const records = novosRecordesDaSessao(exerciciosDetalhados);
  const comparison = resumoComparativo(volume);
  const destaque = destaqueDaSessao(exerciciosDetalhados);
  const destaqueHTML = destaque ? `<p class="mt-3 rounded-2xl mol-soft p-3 text-xs leading-relaxed text-gray-300"><strong class="text-neon">Destaque:</strong> ${escapeHTML(destaque.nome)} com ${Math.round(destaque.volume).toLocaleString('pt-BR')} kg de volume${destaque.best ? ` · e1RM ${destaque.best.toLocaleString('pt-BR')} kg` : ''}.</p>` : '';
  const modal = document.createElement('div');
  modal.id = 'mol-workout-summary';
  modal.className = 'fixed inset-0 z-[200] flex items-end bg-black/70 p-4 backdrop-blur-sm sm:items-center sm:justify-center';
  modal.setAttribute('aria-labelledby', 'workout-summary-title');
  modal.setAttribute('aria-describedby', 'workout-summary-description');
  modal.innerHTML = `<section class="w-full max-w-sm rounded-3xl mol-dialog-surface border-neon/30 p-6 text-center animate-slide-up"><div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neon text-black"><i data-lucide="trophy" class="h-7 w-7"></i></div><p class="mt-4 text-xs font-bold uppercase tracking-[.16em] text-neon">Sessão concluída</p><h2 id="workout-summary-title" class="mt-1 text-2xl font-extrabold">Mandou bem.</h2><div class="mt-6 grid grid-cols-2 gap-2"><div class="rounded-2xl mol-soft p-3"><strong class="block text-lg">${series}</strong><span class="text-[10px] text-gray-400">SÉRIES</span></div><div class="rounded-2xl mol-soft p-3"><strong class="block text-lg">${Math.round(volume).toLocaleString('pt-BR')}</strong><span class="text-[10px] text-gray-400">KG</span></div><div class="rounded-2xl mol-soft p-3"><strong class="block text-lg">${minutos}m</strong><span class="text-[10px] text-gray-400">DURAÇÃO</span></div><div class="rounded-2xl mol-soft p-3"><strong class="block text-lg text-neon">${records}</strong><span class="text-[10px] text-gray-400">NOVOS RECORDES</span></div></div><p id="workout-summary-description" class="mt-4 text-sm text-gray-400">${exercicios} exercícios registrados no seu histórico.</p>${destaqueHTML}<p class="mt-3 rounded-2xl bg-neon/10 p-3 text-xs leading-relaxed text-neon">${comparison}</p><div class="mt-5 grid grid-cols-2 gap-2"><button type="button" data-share class="min-h-12 rounded-2xl mol-soft text-sm font-bold"><i data-lucide="share-2" class="mr-1 inline h-4 w-4"></i>Compartilhar</button><button type="button" data-close class="min-h-12 rounded-2xl bg-neon text-sm font-bold text-black active:scale-[.98]">Concluído</button></div></section>`;
  document.body.appendChild(modal);
  const close = activateDialog(modal, { initialFocus: modal.querySelector('[data-close]') });
  modal.querySelector('[data-close]').onclick = close;
  modal.querySelector('[data-share]').onclick = () => void compartilharResumoTreino({ series, volume, exercicios, minutos, records, comparison });
  modal.onclick = event => { if (event.target === modal) close(); };
  renderIcons();
}

window.mostrarInfoTreino = (tipo) => {
  const infos = {
    serie: ['Série', 'Uma tentativa do exercício. W é aquecimento; números são séries de trabalho; F indica falha e D, drop set.'],
    anterior: ['Anterior', 'Mostra a última carga e repetições registradas para esta série. Toque no valor para copiar.'],
    kg: ['KG', 'A carga usada na série, em quilogramas.'],
    reps: ['Repetições', 'Quantas repetições você fez com a carga informada.'],
    rir: ['RIR — repetições em reserva', 'Quantas repetições você ainda conseguiria fazer antes da falha. RIR 2 significa que sobrariam cerca de duas reps.'],
    check: ['Concluir série', 'Toque quando peso e repetições estiverem registrados. O descanso inicia automaticamente.']
  };
  const [titulo, texto] = infos[tipo] || infos.serie;
  document.getElementById('mol-training-info')?.remove();
  const sheet = document.createElement('div');
  sheet.id = 'mol-training-info';
  sheet.className = 'fixed inset-0 z-[210] flex items-end bg-black/65 p-4 backdrop-blur-sm';
  sheet.setAttribute('aria-labelledby', 'training-info-title');
  sheet.setAttribute('aria-describedby', 'training-info-description');
  sheet.innerHTML = `<section class="w-full max-w-md mx-auto rounded-3xl mol-dialog-surface p-6 animate-slide-up"><div class="mx-auto mb-5 h-1.5 w-11 rounded-full bg-white/20"></div><p class="text-xs font-bold uppercase tracking-[.16em] text-neon">Guia rápido</p><h2 id="training-info-title" class="mt-1 text-xl font-extrabold">${titulo}</h2><p id="training-info-description" class="mt-3 text-sm leading-relaxed text-gray-300">${texto}</p><button type="button" data-close class="mt-6 min-h-12 w-full rounded-2xl mol-soft text-sm font-bold active:bg-white/15">Entendi</button></section>`;
  document.body.appendChild(sheet);
  const close = activateDialog(sheet, { initialFocus: sheet.querySelector('[data-close]') });
  sheet.querySelector('[data-close]').onclick = close;
  sheet.addEventListener('click', event => { if (event.target === sheet) close(); });
};

function renderRotinas() {
  if (rotinasReais.length === 0) {
    rotinasList.innerHTML = '<div class="mol-state my-10"><p class="mol-state-title">Você ainda não tem treinos.</p><p class="mol-state-copy">Crie uma rotina ou use um modelo para começar.</p></div>';
    return;
  }
  const termo = inputBuscaRotina?.value.trim().toLocaleLowerCase('pt-BR') || '';
  const rotinasFiltradas = rotinasReais.filter(rotina => rotina.nome.toLocaleLowerCase('pt-BR').includes(termo));
  if (rotinasFiltradas.length === 0) {
    rotinasList.innerHTML = '<div class="mol-state my-10"><p class="mol-state-title">Nenhuma rotina encontrada.</p><p class="mol-state-copy">Tente outro termo de busca.</p></div>';
    return;
  }
  rotinasList.innerHTML = rotinasFiltradas.map(rotina => `
    <article class="routine-card mol-card rounded-2xl p-5 relative">
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
          <h3 class="line-clamp-2 font-bold text-lg text-white">${escapeHTML(rotina.nome)}</h3>
          <p class="text-xs text-gray-500">${rotina.exercicios ? rotina.exercicios.length : 0} exercícios${rotina.horario ? ` · ${escapeHTML(rotina.horario)}` : ''}</p>
        </div>
        <button type="button" data-routine-action="delete" data-routine-id="${escapeHTML(rotina.id)}" class="text-gray-500 hover:text-red-400 transition-colors p-1" aria-label="Excluir ${escapeHTML(rotina.nome)}">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </div>

      <div class="mt-4 grid grid-cols-2 gap-3">
        <button type="button" data-routine-action="start" data-routine-id="${escapeHTML(rotina.id)}" class="min-h-12 rounded-xl bg-neon px-3 text-sm font-bold text-black active:scale-[0.98]">Iniciar</button>
        <button type="button" data-routine-action="edit" data-routine-id="${escapeHTML(rotina.id)}" class="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/10 px-3 text-sm font-bold text-gray-200 active:bg-white/5"><i data-lucide="pencil" class="h-4 w-4"></i> Editar</button>
      </div>
      <button type="button" data-routine-action="duplicate" data-routine-id="${escapeHTML(rotina.id)}" class="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 text-xs font-bold text-gray-300 active:bg-white/5"><i data-lucide="copy" class="h-4 w-4"></i> Duplicar rotina</button>
    </article>
  `).join('');
  const actions = {
    delete: window.deletarRotina,
    start: window.clicarIniciarRotina,
    edit: window.editarRotina,
    duplicate: window.duplicarRotina
  };
  rotinasList.querySelectorAll('[data-routine-action]').forEach(button => button.addEventListener('click', () => {
    const action = actions[button.dataset.routineAction];
    if (action) void action(button.dataset.routineId);
  }));
  renderIcons();
}

function solicitarCheckin() {
  return new Promise(resolve => {
    document.getElementById('workout-checkin')?.remove();
    const modal = document.createElement('div');
    modal.id = 'workout-checkin';
    modal.className = 'fixed inset-0 z-[220] flex items-end bg-black/70 p-4 backdrop-blur-sm sm:items-center sm:justify-center';
    modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); modal.setAttribute('aria-labelledby', 'checkin-title');
    modal.innerHTML = `<section class="mx-auto w-full max-w-sm rounded-3xl mol-dialog-surface p-6 shadow-2xl"><p class="text-xs font-bold uppercase tracking-[.16em] text-neon">Antes de começar</p><h2 id="checkin-title" class="mt-1 text-xl font-extrabold">Como você está hoje?</h2><p class="mt-2 text-sm text-gray-400">Isso ajuda a ajustar a intensidade com segurança.</p><div class="mt-5 grid grid-cols-3 gap-3"><label class="text-xs font-bold text-gray-400">Energia<input data-checkin="energia" type="number" inputmode="numeric" min="1" max="5" value="3" class="mt-2 min-h-12 w-full rounded-xl mol-field px-3 text-center text-white"></label><label class="text-xs font-bold text-gray-400">Sono<input data-checkin="sono" type="number" inputmode="numeric" min="1" max="5" value="3" class="mt-2 min-h-12 w-full rounded-xl mol-field px-3 text-center text-white"></label><label class="text-xs font-bold text-gray-400">Dor<input data-checkin="dor" type="number" inputmode="numeric" min="0" max="5" value="0" class="mt-2 min-h-12 w-full rounded-xl mol-field px-3 text-center text-white"></label></div><p class="mt-2 text-[11px] text-gray-500">Energia e sono: 1–5 · Dor muscular: 0–5</p><div class="mt-6 grid grid-cols-2 gap-3"><button type="button" data-cancel class="min-h-12 rounded-xl mol-soft text-sm font-bold text-gray-300">Cancelar</button><button type="button" data-start class="min-h-12 rounded-xl bg-neon text-sm font-bold text-black">Iniciar treino</button></div></section>`;
    let closeDialog;
    const close = value => { closeDialog(); resolve(value); };
    modal.querySelector('[data-cancel]').onclick = () => close(null);
    modal.querySelector('[data-start]').onclick = () => {
      const value = name => Number(modal.querySelector(`[data-checkin="${name}"]`).value);
      const energia = value('energia'), sono = value('sono'), dor = value('dor');
      if (energia < 1 || energia > 5 || sono < 1 || sono > 5 || dor < 0 || dor > 5) return showToast('Use valores válidos nas escalas informadas.');
      close({ energia, sono, dor });
    };
    modal.onclick = event => { if (event.target === modal) close(null); };
    document.body.appendChild(modal);
    closeDialog = activateDialog(modal, { initialFocus: modal.querySelector('input'), onCancel: () => close(null) });
  });
}

async function iniciarRotinaComCheckin(id) {
  const checkin = await solicitarCheckin();
  if (!checkin) return;
  checkinPreTreino = checkin;
  if (checkin.energia <= 2 || checkin.dor >= 4) showToast('Hoje priorize técnica e reduza carga se necessário.');
  iniciarCronometroGlobal(); abrirRotina(id);
}

window.clicarIniciarRotina = iniciarRotinaComCheckin;

// Editar abre a ficha sem iniciar cronômetro, sessão ou descanso.
window.editarRotina = (id) => {
  pararDescanso();
  abrirRotina(id);
};

window.iniciarTreinoDaEdicao = async () => {
  if (!rotinaAbertaId) return;
  await iniciarRotinaComCheckin(rotinaAbertaId);
};

window.salvarNomeRotina = async () => {
  const input = document.getElementById('input-editar-nome-rotina');
  const timeInput = document.getElementById('input-editar-horario-rotina');
  const nome = input?.value.trim();
  const horario = timeInput?.value || '';
  const rotina = rotinasReais.find(r => r.id === rotinaAbertaId);
  if (!rotina || !nome) return showToast('Digite um nome para a rotina.');
  if (nome.length > 60) return showToast('Use no máximo 60 caracteres no nome da rotina.');
  if (horario && !/^([01]\d|2[0-3]):[0-5]\d$/.test(horario)) return showToast('Use um horário válido ou deixe em branco.');
  if (nome === rotina.nome && horario === (rotina.horario || '')) return;
  try {
    await updateDoc(doc(db, 'treinos', rotinaAbertaId), { nome, horario });
    rotina.nome = nome;
    rotina.horario = horario;
    detalheTitulo.textContent = nome;
    showToast('Rotina atualizada.', 'success');
  } catch (error) {
    console.error(error);
    showToast('Não foi possível salvar a rotina.');
  }
};

const WEEKDAYS = [[1, 'Segunda'], [2, 'Terça'], [3, 'Quarta'], [4, 'Quinta'], [5, 'Sexta'], [6, 'Sábado'], [0, 'Domingo']];

function routineDaysEditor(days = []) {
  const selected = new Set((Array.isArray(days) ? days : []).map(Number));
  return `<div class="mt-4"><p class="text-xs font-bold uppercase tracking-wider text-gray-400">Dias de treino</p><div class="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">${WEEKDAYS.map(([day, label]) => `<label><input class="peer sr-only" type="checkbox" value="${day}" ${selected.has(day) ? 'checked' : ''}><span class="flex min-h-10 items-center justify-center rounded-xl mol-soft px-2 text-xs font-bold text-gray-400 peer-checked:bg-neon peer-checked:text-black">${label}</span></label>`).join('')}</div><button type="button" onclick="salvarDiasRotina()" class="mt-3 min-h-10 rounded-xl border border-white/10 px-3 text-xs font-bold text-gray-200">Salvar dias</button></div>`;
}

window.salvarDiasRotina = async () => {
  const rotina = rotinasReais.find(r => r.id === rotinaAbertaId);
  const selector = document.getElementById('routine-days-editor');
  if (!rotina || !selector) return;
  const diasSemana = [...selector.querySelectorAll('input:checked')].map(input => Number(input.value)).sort((a, b) => a - b);
  try {
    await updateDoc(doc(db, 'treinos', rotina.id), { diasSemana });
    rotina.diasSemana = diasSemana;
    showToast('Dias de treino atualizados.', 'success');
  } catch (error) {
    console.error('Dias da rotina não salvos:', error);
    showToast('Não foi possível salvar os dias de treino.');
  }
};

window.deletarRotina = async (id) => {
  if (await confirmAction({ title: 'Excluir rotina?', message: 'Essa rotina e seus exercícios serão removidos permanentemente.', confirmText: 'Excluir', danger: true })) {
    try {
      await deleteDoc(doc(db, "treinos", id));
      carregarRotinasDoBanco();
    } catch (error) {
      console.error("Erro ao deletar treino:", error);
      showToast('Não foi possível excluir o treino.');
    }
  }
};

btnSalvarNova.addEventListener('click', async () => {
  const nome = inputNomeRotina.value.trim();
  if (!nome) return showToast('Dê um nome para a rotina.');
  if (rotinasReais.length >= WORKOUT_STRUCTURE_LIMITS.routines) return showToast(`Você pode salvar até ${WORKOUT_STRUCTURE_LIMITS.routines} rotinas.`);
  if (!usuarioAtual) return showToast('A sessão expirou. Entre novamente.');
  btnSalvarNova.disabled = true;
  btnSalvarNova.textContent = "Salvando...";
  try {
    const diasSemana = [...routineDays.querySelectorAll('input:checked')].map(input => Number(input.value));
    const horario = inputHorarioRotina?.value || '';
    const novaRotina = { userId: usuarioAtual.uid, nome, descricao: 'Treino Personalizado', horario, diasSemana, exercicios: [], criadoEm: new Date() };
    const reference = await addDoc(collection(db, 'treinos'), { ...novaRotina, criadoEm: serverTimestamp() });
    rotinasReais = [...rotinasReais, { id: reference.id, ...novaRotina }];
    writeRoutinesCache();
    inputNomeRotina.value = '';
    if (inputHorarioRotina) inputHorarioRotina.value = '';
    routineDays.querySelectorAll('input').forEach(input => input.checked = false);
    esconderTudo();
    viewRotinas.classList.remove('hidden');
    renderRotinas();
    void carregarRotinasDoBanco();
    showToast('Rotina criada com sucesso.', 'success');
  } catch (error) {
    console.error('Erro ao criar rotina:', error);
    showToast(error.code === 'permission-denied' ? 'O Firestore bloqueou a criação. Revise as regras de treinos.' : 'Não foi possível criar a rotina. Tente novamente.');
  } finally { btnSalvarNova.textContent = "Salvar"; btnSalvarNova.disabled = false; }
});

window.criarTemplate = async (nome) => {
  const template = WORKOUT_TEMPLATES[nome];
  const exercicios = (template?.exercises || []).map(([exerciseName, group, repsMin, repsMax, rirAlvo, descansoSegundos]) => ({
    nome: exerciseName,
    grupo: group,
    repsMin,
    repsMax,
    rirAlvo,
    descansoSegundos,
    notas: nome === 'Casa / Sem academia' ? 'Use carga disponível e priorize amplitude controlada.' : '',
    series: Array.from({ length: template.sets || 3 }, () => ({ tipo: 'N', method: SET_METHODS.NORMAL, kg: '', reps: '', rir: String(rirAlvo), anteriorKg: '', anteriorReps: '', anteriorRir: '', concluida: false }))
  }));
  if (!template) return showToast('Modelo não encontrado.');
  if (!usuarioAtual) return showToast('A sessão ainda está carregando.');
  if (rotinasReais.length >= WORKOUT_STRUCTURE_LIMITS.routines) return showToast(`Você pode salvar até ${WORKOUT_STRUCTURE_LIMITS.routines} rotinas.`);
  try {
    await addDoc(collection(db, 'treinos'), { userId: usuarioAtual.uid, nome, descricao: template.description, diasSemana: template.days, exercicios, criadoEm: serverTimestamp() });
    showToast('Modelo criado. Ajuste-o para sua realidade.', 'success'); await carregarRotinasDoBanco(); esconderTudo(); viewRotinas.classList.remove('hidden');
  } catch (error) { console.error(error); showToast('Não foi possível criar o modelo.'); }
};

window.duplicarRotina = async (id) => {
  const origem = rotinasReais.find(r => r.id === id);
  if (!origem) return;
  if (rotinasReais.length >= WORKOUT_STRUCTURE_LIMITS.routines) return showToast(`Você pode salvar até ${WORKOUT_STRUCTURE_LIMITS.routines} rotinas.`);
  const exercicios = JSON.parse(JSON.stringify(origem.exercicios || [])).map(ex => ({ ...ex, series: (ex.series || []).map(s => ({ ...s, kg: '', reps: '', concluida: false })) }));
  const nome = `${origem.nome || 'Rotina'} (cópia)`.slice(0, 60);
  try { await addDoc(collection(db, 'treinos'), { userId: usuarioAtual.uid, nome, descricao: origem.descricao || '', exercicios, criadoEm: serverTimestamp() }); await carregarRotinasDoBanco(); showToast('Rotina duplicada.', 'success'); }
  catch (error) { console.error(error); showToast('Não foi possível duplicar a rotina.'); }
};

window.escolherExercicio = async (nomeExercicio) => {
  const rotina = rotinasReais.find(r => r.id === rotinaAbertaId);
  if (!rotina) return;

  const catalogo = bibliotecaDeExercicios.find(ex => ex.nome === nomeExercicio);
  const ultimo = ultimaPerformance.get(nomeExercicio);
  const substituindo = Number.isInteger(substituirExercicioIndex);
  const anterior = substituindo ? cloneValue(rotina.exercicios[substituirExercicioIndex]) : null;
  const ultimoPorSerie = (index) => ultimo?.sets?.find(item => item.index === index) || null;
  const seriesBase = substituindo && anterior?.series?.length
    ? anterior.series.map((serie, index) => {
      const serieAnterior = ultimoPorSerie(index);
      return { ...serie, kg: '', reps: '', rir: '', anteriorKg: serieAnterior?.kg ?? '', anteriorReps: serieAnterior?.reps ?? '', anteriorRir: serieAnterior?.rir ?? '', concluida: false };
    })
    : [{ tipo: 'N', kg: '', reps: '', rir: '', anteriorKg: ultimoPorSerie(0)?.kg ?? '', anteriorReps: ultimoPorSerie(0)?.reps ?? '', anteriorRir: ultimoPorSerie(0)?.rir ?? '', concluida: false }];
  const novoExercicio = {
    nome: nomeExercicio,
    grupo: catalogo?.grupo || 'Outros',
    descansoSegundos: anterior?.descansoSegundos || 90,
    notas: anterior?.notas || '',
    repsMin: anterior?.repsMin || 8,
    repsMax: anterior?.repsMax || 12,
    rirAlvo: anterior?.rirAlvo ?? 2,
    series: seriesBase
  };
  if (!rotina.exercicios) rotina.exercicios = [];
  if (!substituindo && rotina.exercicios.length >= WORKOUT_STRUCTURE_LIMITS.exercises) return showToast(`Cada rotina pode ter até ${WORKOUT_STRUCTURE_LIMITS.exercises} exercícios.`);
  if (substituindo) rotina.exercicios[substituirExercicioIndex] = novoExercicio;
  else rotina.exercicios.push(novoExercicio);
  registrarRecente(nomeExercicio);

  try {
    await updateDoc(doc(db, 'treinos', rotinaAbertaId), { exercicios: exerciciosParaPersistir(rotina) });
    substituirExercicioIndex = null;
    filtroMuscular = '';
    abrirRotina(rotinaAbertaId);
    showToast(substituindo ? 'Exercício substituído.' : 'Exercício adicionado.', 'success');
  } catch (error) {
    if (substituindo) rotina.exercicios[substituirExercicioIndex] = anterior;
    else rotina.exercicios.pop();
    console.error(error);
    showToast(substituindo ? 'Não foi possível substituir o exercício.' : 'Não foi possível adicionar o exercício.');
  }
};

window.abrirSubstituicao = indexEx => {
  const rotina = rotinasReais.find(r => r.id === rotinaAbertaId);
  const exercicio = rotina?.exercicios?.[indexEx];
  if (!exercicio) return;
  if (exercicio.series?.some(serie => serie.concluida)) return showToast('Conclua o treino antes de trocar um exercício que já possui séries registradas.');
  substituirExercicioIndex = indexEx;
  const origem = bibliotecaDeExercicios.find(item => item.nome === exercicio.nome) || exercicio;
  const recomendados = rankExerciseSubstitutes(origem, bibliotecaDeExercicios, grupoDetalhado);
  filtroMuscular = grupoDetalhado(origem);
  esconderTudo();
  prepararAtalhosBiblioteca();
  if (inputBuscaExercicio) inputBuscaExercicio.value = '';
  renderizarBiblioteca('');
  if (libraryResultsSummary) libraryResultsSummary.insertAdjacentHTML('afterbegin', `<span class="text-neon">Substituindo ${escapeHTML(exercicio.nome)}</span>`);
  viewBiblioteca.classList.remove('hidden');
  resetarScrollBiblioteca();
  if (recomendados[0]) showToast(`Sugestão: ${recomendados[0].nome}`, 'success');
  renderIcons();
};
// ---------------------------------------------
// RENDERIZAR BIBLIOTECA DE EXERCÍCIOS (COM BUSCA AO DIGITAR)
// ---------------------------------------------
let filtroMuscular = '';

function atualizarEstadoFiltrosBiblioteca() {
  document.querySelectorAll('[data-exercise-filter]').forEach(item => {
    const ativo = (item.dataset.exerciseFilter || '') === filtroMuscular;
    item.classList.toggle('bg-neon', ativo); item.classList.toggle('text-black', ativo);
    item.classList.toggle('bg-white/5', !ativo); item.classList.toggle('text-gray-300', !ativo);
    item.setAttribute('aria-pressed', String(ativo));
  });
  document.querySelectorAll('[data-library-filter]').forEach(item => {
    const ativo = item.dataset.libraryFilter === filtroMuscular;
    item.classList.toggle('bg-neon', ativo); item.classList.toggle('text-black', ativo);
    item.classList.toggle('bg-white/5', !ativo); item.classList.toggle('text-gray-300', !ativo);
    item.setAttribute('aria-pressed', String(ativo));
  });
}

window.abrirDetalheExercicio = (nome) => {
  const exercicio = bibliotecaDeExercicios.find(item => item.nome === nome); if (!exercicio) return;
  const grupo = grupoDetalhado(exercicio); const equipamento = equipamentoDo(exercicio);
  const orientacao = orientacaoDo(exercicio);
  const historico = (historicoPerformance.get(nome) || []).slice(0, 6).reverse();
  const cargas = historico.map(item => item.kg); const maxCarga = Math.max(...cargas, 1);
  const pontos = cargas.map((carga, index) => `${index * (100 / Math.max(cargas.length - 1, 1))},${40 - (carga / maxCarga) * 34}`).join(' ');
  const melhor = historico.reduce((max, item) => Math.max(max, item.kg * (1 + item.reps / 30)), 0);
  const substitutos = rankExerciseSubstitutes(exercicio, bibliotecaDeExercicios, grupoDetalhado).slice(0, 3);
  document.getElementById('exercise-detail')?.remove();
  const modal = document.createElement('div'); modal.id = 'exercise-detail'; modal.className = 'fixed inset-0 z-[210] flex items-end bg-black/70 p-4 backdrop-blur-sm';
  modal.setAttribute('aria-labelledby', 'exercise-detail-title');
  modal.innerHTML = `<section class="mx-auto w-full max-w-md rounded-3xl mol-dialog-surface p-6"><div class="mx-auto h-1.5 w-11 rounded-full bg-white/20"></div><div class="mt-5 flex gap-4"><img src="${exerciseFigure}" alt="" class="h-20 w-16 rounded-2xl mol-soft p-2"><div><p class="text-xs font-bold uppercase tracking-wider text-neon">${escapeHTML(grupo)}</p><h2 id="exercise-detail-title" class="mt-1 text-xl font-extrabold">${escapeHTML(nome)}</h2><p class="mt-1 text-sm text-gray-400">${equipamento}</p></div></div>${historico.length ? `<section class="mt-5 rounded-2xl mol-soft p-4"><p class="text-xs font-bold uppercase tracking-wider text-gray-400">Evolução recente</p><p class="mt-1 text-sm font-bold text-neon">e1RM estimado: ${melhor.toFixed(1)} kg</p><svg viewBox="0 0 100 44" class="mt-3 h-16 w-full"><polyline points="${pontos}" fill="none" stroke="#1E7349" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg><p class="text-xs text-gray-500">${historico.map(item => `${item.kg} kg × ${item.reps}`).join(' · ')}</p></section>` : ''}<div class="mt-6 space-y-4 text-sm"><div><strong>Execução</strong><p class="mt-1 text-gray-400">${orientacao.execucao}</p></div><div><strong>Erros para evitar</strong><p class="mt-1 text-gray-400">${orientacao.erros}</p></div><div><strong>Substituições</strong><p class="mt-1 text-gray-400">${substitutos.map(item => escapeHTML(item.nome)).join(' · ') || 'Sem substituições cadastradas.'}</p></div></div><div class="mt-6 grid grid-cols-2 gap-3"><button type="button" data-close class="min-h-12 rounded-2xl mol-soft font-bold text-gray-300">Fechar</button><button type="button" data-add class="min-h-12 rounded-2xl bg-neon font-bold text-black">Adicionar</button></div></section>`;
  document.body.appendChild(modal);
  const close = activateDialog(modal, { initialFocus: modal.querySelector('[data-close]') });
  modal.onclick = event => { if (event.target === modal) close(); };
  modal.querySelector('[data-close]').onclick = close; modal.querySelector('[data-add]').onclick = () => { close(); window.escolherExercicio(nome); };
};

function renderizarBiblioteca(filtro = '') {
  if (!bibliotecaList) return;

  const termo = filtro.trim();
  let exerciciosFiltrados = bibliotecaDeExercicios.filter(ex =>
    matchesExerciseSearch(ex, termo, grupoDetalhado, equipamentoDo) &&
    (!filtroMuscular || (filtroMuscular === 'Favoritos' ? favoritosExercicios.includes(ex.nome) : filtroMuscular === 'Recentes' ? recentesExercicios.includes(ex.nome) : grupoDetalhado(ex) === filtroMuscular || equipamentoDo(ex) === filtroMuscular))
  );

  if (libraryResultsSummary) {
    const contexto = filtroMuscular || (termo ? `Busca: ${filtro}` : 'Todos os exercícios');
    libraryResultsSummary.innerHTML = `<span>${exerciciosFiltrados.length} ${exerciciosFiltrados.length === 1 ? 'exercício' : 'exercícios'}</span><span class="rounded-full mol-soft px-2 py-1 font-bold text-gray-400">${escapeHTML(contexto)}</span>`;
  }

  if (exerciciosFiltrados.length === 0) {
    bibliotecaList.innerHTML = '<div class="mol-state my-10"><p class="mol-state-title">Nenhum exercício encontrado.</p><p class="mol-state-copy">Tente outro nome, grupo muscular ou crie um exercício personalizado.</p></div>';
    return;
  }

  bibliotecaList.innerHTML = exerciciosFiltrados.map((ex, index) => `
    <article class="exercise-library-card rounded-2xl border border-white/5 mol-panel p-3 transition-colors active:bg-white/5">
      <div class="flex items-start gap-3">
        <img src="${exerciseFigure}" alt="" class="h-14 w-12 shrink-0 rounded-xl mol-soft p-1.5">
        <div class="min-w-0 flex-1 text-left">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="line-clamp-2 text-sm font-extrabold leading-snug text-white">${escapeHTML(ex.nome)}</p>
              <div class="mt-2 flex flex-wrap gap-1.5">
                <span class="rounded-full bg-neon/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-neon">${escapeHTML(grupoDetalhado(ex))}</span>
                <span class="rounded-full mol-soft px-2 py-1 text-[10px] font-semibold text-gray-400">${escapeHTML(equipamentoDo(ex))}</span>
              </div>
            </div>
            <div class="flex shrink-0 gap-1">
              <button type="button" data-exercise-action="favorite" data-exercise-index="${index}" aria-label="Favoritar ${escapeHTML(ex.nome)}" class="flex h-10 w-10 items-center justify-center rounded-xl mol-soft active:bg-white/10 ${favoritosExercicios.includes(ex.nome) ? 'text-neon' : 'text-gray-500'}"><i data-lucide="star" class="h-5 w-5 ${favoritosExercicios.includes(ex.nome) ? 'fill-current' : ''}"></i></button>
              <button type="button" data-exercise-action="detail" data-exercise-index="${index}" aria-label="Ver detalhes de ${escapeHTML(ex.nome)}" class="flex h-10 w-10 items-center justify-center rounded-xl mol-soft text-gray-400 active:bg-white/10"><i data-lucide="info" class="h-5 w-5"></i></button>
            </div>
          </div>
          <div class="mt-3 flex items-center justify-between gap-3">
            ${ultimaPerformance.has(ex.nome) ? `<p class="min-w-0 text-xs font-semibold text-neon">Último: ${ultimaPerformance.get(ex.nome).kg} kg × ${ultimaPerformance.get(ex.nome).reps}</p>` : '<p class="min-w-0 text-xs text-gray-600">Sem histórico ainda</p>'}
            <button type="button" data-exercise-action="add" data-exercise-index="${index}" aria-label="Adicionar ${escapeHTML(ex.nome)}" class="inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-neon px-3 text-xs font-extrabold text-black active:scale-[.98]"><i data-lucide="plus" class="h-4 w-4"></i><span>Adicionar</span></button>
          </div>
        </div>
      </div>
    </article>
  `).join('');
  bibliotecaList.querySelectorAll('[data-exercise-action]').forEach(button => button.onclick = () => {
    const exercise = exerciciosFiltrados[Number(button.dataset.exerciseIndex)];
    if (!exercise) return;
    if (button.dataset.exerciseAction === 'favorite') window.alternarFavoritoExercicio(exercise.nome);
    if (button.dataset.exerciseAction === 'detail') window.abrirDetalheExercicio(exercise.nome);
    if (button.dataset.exerciseAction === 'add') window.escolherExercicio(exercise.nome);
  });

  renderIcons();
}

// Ouvinte do input de busca para filtrar em tempo real
if (inputBuscaExercicio) {
  inputBuscaExercicio.addEventListener('input', (e) => {
    renderizarBiblioteca(e.target.value);
  });
}

document.querySelectorAll('[data-exercise-filter]').forEach(button => button.addEventListener('click', () => {
  filtroMuscular = button.dataset.exerciseFilter || '';
  atualizarEstadoFiltrosBiblioteca();
  renderizarBiblioteca(inputBuscaExercicio?.value || '');
  resetarScrollBiblioteca();
}));

function prepararAtalhosBiblioteca() {
  if (document.getElementById('library-shortcuts')) return;
  bibliotecaList.insertAdjacentHTML('beforebegin', '<div id="library-shortcuts" class="mb-4 flex gap-2 overflow-x-auto pb-1"><button type="button" data-library-filter="Favoritos" aria-pressed="false" class="library-filter-chip rounded-full mol-soft px-4 py-2 text-xs font-bold text-gray-300">Favoritos</button><button type="button" data-library-filter="Recentes" aria-pressed="false" class="library-filter-chip rounded-full mol-soft px-4 py-2 text-xs font-bold text-gray-300">Recentes</button><button type="button" data-library-filter="Máquina" aria-pressed="false" class="library-filter-chip rounded-full mol-soft px-4 py-2 text-xs font-bold text-gray-300">Máquinas</button><button type="button" data-library-filter="Polia" aria-pressed="false" class="library-filter-chip rounded-full mol-soft px-4 py-2 text-xs font-bold text-gray-300">Polia</button><button type="button" id="create-custom-exercise" class="rounded-full bg-neon/15 px-4 py-2 text-xs font-bold text-neon">+ Personalizado</button></div>');
  document.querySelectorAll('[data-library-filter]').forEach(button => button.onclick = () => {
    filtroMuscular = filtroMuscular === button.dataset.libraryFilter ? '' : button.dataset.libraryFilter;
    atualizarEstadoFiltrosBiblioteca();
    renderizarBiblioteca(inputBuscaExercicio?.value || '');
    resetarScrollBiblioteca();
  });
  document.getElementById('create-custom-exercise').onclick = abrirCriadorExercicio;
}

function abrirCriadorExercicio() {
  if (exerciciosPersonalizados.length >= MAX_CUSTOM_EXERCISES) return showToast(`Você pode salvar até ${MAX_CUSTOM_EXERCISES} exercícios personalizados.`);
  document.getElementById('custom-exercise-modal')?.remove();
  const modal = document.createElement('div');
  modal.id = 'custom-exercise-modal'; modal.className = 'fixed inset-0 z-[220] flex items-end bg-black/70 p-4 backdrop-blur-sm sm:items-center sm:justify-center';
  modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); modal.setAttribute('aria-labelledby', 'custom-exercise-title');
  modal.innerHTML = `<section class="mx-auto w-full max-w-sm rounded-3xl mol-dialog-surface p-6"><p class="text-xs font-bold uppercase tracking-[.16em] text-neon">Biblioteca pessoal</p><h2 id="custom-exercise-title" class="mt-1 text-xl font-extrabold">Novo exercício</h2><label class="mt-5 block text-xs font-bold text-gray-400" for="custom-exercise-name">Nome</label><input id="custom-exercise-name" maxlength="80" autocomplete="off" class="mt-2 min-h-12 w-full rounded-xl mol-field px-4 text-white" placeholder="Ex.: Remada unilateral"><label class="mt-4 block text-xs font-bold text-gray-400" for="custom-exercise-group">Grupo muscular</label><input id="custom-exercise-group" maxlength="40" autocomplete="off" class="mt-2 min-h-12 w-full rounded-xl mol-field px-4 text-white" value="Outros"><div class="mt-6 grid grid-cols-2 gap-3"><button type="button" data-cancel class="min-h-12 rounded-xl mol-soft text-sm font-bold text-gray-300">Cancelar</button><button type="button" data-save class="min-h-12 rounded-xl bg-neon text-sm font-bold text-black">Criar</button></div></section>`;
  let close;
  modal.querySelector('[data-save]').onclick = () => {
    const nome = modal.querySelector('#custom-exercise-name').value.trim();
    const grupo = modal.querySelector('#custom-exercise-group').value.trim() || 'Outros';
    if (!nome) return showToast('Digite o nome do exercício.');
    if (exerciciosPersonalizados.length >= MAX_CUSTOM_EXERCISES) return showToast(`Você pode salvar até ${MAX_CUSTOM_EXERCISES} exercícios personalizados.`);
    if (bibliotecaDeExercicios.some(item => item.nome.toLocaleLowerCase('pt-BR') === nome.toLocaleLowerCase('pt-BR'))) return showToast('Esse exercício já existe na biblioteca.');
    const novo = { nome, grupo, personalizado: true };
    exerciciosPersonalizados.push(novo); bibliotecaDeExercicios.push(novo); salvarPreferenciasBiblioteca(); renderizarBiblioteca(inputBuscaExercicio?.value || ''); close(); showToast('Exercício personalizado criado.', 'success');
  };
  modal.onclick = event => { if (event.target === modal) close(); };
  document.body.appendChild(modal);
  close = activateDialog(modal, { initialFocus: modal.querySelector('#custom-exercise-name') });
  modal.querySelector('[data-cancel]').onclick = close;
}

// Garantir que a busca limpa ao abrir a tela de adicionar exercício
if (btnAddExercicio) {
  btnAddExercicio.addEventListener('click', () => {
    substituirExercicioIndex = null;
    filtroMuscular = '';
    esconderTudo();
    prepararAtalhosBiblioteca();
    if (inputBuscaExercicio) inputBuscaExercicio.value = '';
    atualizarEstadoFiltrosBiblioteca();
    renderizarBiblioteca('');
    viewBiblioteca.classList.remove('hidden');
    resetarScrollBiblioteca();
    renderIcons();
  });
}

function abrirRotina(id) {
  rotinaAbertaId = id;
  const rotina = rotinasReais.find(r => r.id === id);
  if (!rotina) {
    rotinaAbertaId = null;
    esconderTudo();
    viewRotinas.classList.remove('hidden');
    showToast('Esta rotina não está mais disponível.');
    return;
  }
  detalheTitulo.textContent = rotina.nome;

  let totalSeries = 0;
  let seriesFeitas = 0;
  let volumeTotal = 0;

  if (rotina.exercicios) {
    rotina.exercicios.forEach(ex => {
      if (ex.series) {
        ex.series.forEach(s => {
          totalSeries++;
          if (s.concluida) {
            seriesFeitas++;
            const kg = parseFloat(s.kg) || 0;
            const reps = parseFloat(s.reps) || 0;
            volumeTotal += (kg * reps);
          }
        });
      }
    });
  }

  // REQUISITO 1 & 2: O botão só fica com fundo neon sólido se 100% das séries estiverem concluídas
  const btnConcluir = document.getElementById('btn-concluir-treino');
  if (btnConcluir) {
    if (!treinoIniciado) {
      btnConcluir.classList.add('hidden');
    } else if (totalSeries > 0 && seriesFeitas === totalSeries) {
      btnConcluir.classList.remove('hidden');
      btnConcluir.disabled = false;
      btnConcluir.className = "min-h-11 px-4 py-2 rounded-xl text-xs font-bold bg-neon text-black transition-all active:scale-95 shadow-lg shadow-neon/20 cursor-pointer";
      btnConcluir.textContent = 'Finalizar';
    } else if (seriesFeitas > 0) {
      btnConcluir.classList.remove('hidden');
      btnConcluir.disabled = false;
      btnConcluir.className = "min-h-11 px-4 py-2 rounded-xl text-xs font-bold border border-neon/50 text-neon transition-all active:scale-95";
      btnConcluir.textContent = `Finalizar ${seriesFeitas}/${totalSeries}`;
    } else {
      btnConcluir.classList.remove('hidden');
      btnConcluir.disabled = true;
      btnConcluir.className = "min-h-11 px-4 py-2 rounded-xl text-xs font-bold border border-white/10 text-gray-500 opacity-60 cursor-not-allowed";
      btnConcluir.textContent = 'Finalize uma série';
    }
  }

  const seriesPlanejadas = (rotina.exercicios || []).reduce((total, ex) => total + (ex.series || []).length, 0);
  const minutosEstimados = Math.max(15, Math.round(seriesPlanejadas * 3.25));
  const indiceExercicioAtual = Math.max(0, (rotina.exercicios || []).findIndex(exercicio => (exercicio.series || []).some(serie => !serie.concluida)));
  const painelMetricasHTML = treinoIniciado ? `
    <div class="mb-4 overflow-hidden rounded-2xl border border-white/5 mol-panel p-3 text-center"><div class="grid grid-cols-3 gap-2">
      <div>
        <p class="text-[10px] text-gray-400 font-semibold uppercase">Duração</p>
        <p id="treino-tempo" class="text-sm font-bold text-white mt-0.5">0s</p>
      </div>
      <div class="border-x border-white/10">
        <p class="text-[10px] text-gray-400 font-semibold uppercase">Volume</p>
        <p class="text-sm font-bold text-neon mt-0.5">${volumeTotal} kg</p>
      </div>
      <div>
        <p class="text-[10px] text-gray-400 font-semibold uppercase">Séries</p>
        <p class="text-sm font-bold text-white mt-0.5">${seriesFeitas}/${totalSeries}</p>
      </div>
    </div><div class="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div class="h-full rounded-full bg-neon transition-all duration-300" style="width:${totalSeries ? (seriesFeitas / totalSeries) * 100 : 0}%"></div></div><div class="mt-2 flex items-center justify-between gap-3"><p class="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Progresso da sessão · tela ativa</p><button type="button" onclick="alternarModoCompacto()" aria-pressed="${modoCompacto}" class="min-h-9 rounded-xl mol-soft px-3 text-[10px] font-bold text-gray-300">${modoCompacto ? 'Mostrar todos' : 'Modo foco'}</button></div></div>
  ` : `<div class="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-white/10 mol-soft p-4"><div><p class="text-sm font-bold">Modo edição</p><p class="mt-1 text-xs text-gray-400">${seriesPlanejadas} séries · cerca de ${minutosEstimados} min</p></div><button type="button" onclick="iniciarTreinoDaEdicao()" class="min-h-11 shrink-0 rounded-xl bg-neon px-3 text-xs font-bold text-black active:scale-[.98]">Iniciar</button></div>`;
  const editorNomeHTML = treinoIniciado ? '' : `<div class="mb-4 rounded-2xl border border-white/10 mol-panel p-4"><label for="input-editar-nome-rotina" class="text-xs font-bold uppercase tracking-wider text-gray-400">Nome da rotina</label><div class="mt-2 flex gap-2"><input id="input-editar-nome-rotina" type="text" maxlength="60" class="min-w-0 flex-1 rounded-xl border border-white/10 mol-field px-3 py-3 text-sm font-bold text-white outline-none focus:border-neon"><button type="button" onclick="salvarNomeRotina()" class="min-h-11 rounded-xl bg-neon px-4 text-sm font-bold text-black active:scale-[.98]">Salvar</button></div><label for="input-editar-horario-rotina" class="mt-4 block text-xs font-bold uppercase tracking-wider text-gray-400">Horário do treino <span class="font-normal normal-case tracking-normal text-gray-500">(opcional)</span><input id="input-editar-horario-rotina" type="time" class="mt-2 min-h-12 w-full rounded-xl mol-field px-3 text-white"></label><div id="routine-days-editor">${routineDaysEditor(rotina.diasSemana)}</div></div>`;

  if (!rotina.exercicios || rotina.exercicios.length === 0) {
    exerciciosList.innerHTML = `
      ${painelMetricasHTML}
      ${editorNomeHTML}
      <div class="mol-state my-10"><p class="mol-state-title">Nenhum exercício.</p><p class="mol-state-copy">Adicione exercícios para montar esta rotina.</p></div>
    `;
  } else {
    let exerciciosHtml = rotina.exercicios.map((ex, indexEx) => {
      let contadorNormal = 0;
      const conselho = progressionAdvice(ex, historicoPerformance.get(ex.nome) || []);
      const conselhoTom = conselho.state === 'increase' ? 'bg-neon/10 text-neon' : conselho.state === 'reduce' ? 'bg-orange-400/10 text-orange-400' : 'mol-soft text-gray-400';
      const sugestaoProxima = proximaSerieTexto(ex, conselho);
      const currentClass = indexEx === indiceExercicioAtual ? 'is-current' : '';
      const notaExercicio = typeof ex.notas === 'string' ? ex.notas.trim() : '';
      const notaHTML = notaExercicio ? `<section class="mb-3 rounded-xl border border-neon/15 bg-neon/5 p-3 text-neon"><div class="flex items-start gap-2"><i data-lucide="clipboard-list" class="mt-0.5 h-4 w-4 shrink-0"></i><p class="text-[11px] leading-relaxed">${escapeHTML(notaExercicio)}</p></div></section>` : '';
      const editorNotaHTML = treinoIniciado ? '' : `<details class="mb-3 rounded-xl mol-soft p-3"><summary class="cursor-pointer text-xs font-bold text-gray-400">Observações do exercício</summary><label class="mt-3 block text-[10px] font-bold uppercase tracking-wider text-gray-500" for="nota-exercicio-${indexEx}">Orientação, ajuste de máquina ou detalhe técnico</label><textarea id="nota-exercicio-${indexEx}" maxlength="500" rows="3" class="mt-2 min-h-24 w-full resize-y rounded-xl border border-white/10 mol-field p-3 text-sm text-white outline-none transition-colors focus:border-neon" placeholder="Ex.: usar máquina Technogym, polia abaixo das escápulas, atenção ao desconforto..." onblur="atualizarNotaExercicio(${indexEx}, this.value)">${escapeHTML(notaExercicio)}</textarea><p class="mt-2 text-[11px] text-gray-500">Salva automaticamente ao sair do campo.</p></details>`;

      return `
      <article class="workout-exercise-card ${currentClass} mol-panel rounded-2xl pt-4 pb-2 px-4 border border-white/5 mb-4">
        <div class="flex items-center justify-between mb-4">
          <div><h4 class="font-bold text-sm text-neon">${escapeHTML(ex.nome)}</h4><p class="mt-1 text-[11px] text-gray-500">Meta: ${ex.repsMin || 8}–${ex.repsMax || 12} reps · RIR ${ex.rirAlvo ?? 2} · ${ex.descansoSegundos || 90}s</p></div>
          <div class="flex gap-1"><button type="button" onclick="moverExercicio(${indexEx}, -1)" aria-label="Mover ${escapeHTML(ex.nome)} para cima" class="h-10 w-10 rounded-xl text-gray-400 active:bg-white/10"><i data-lucide="chevron-up" class="w-5 h-5"></i></button><button type="button" onclick="moverExercicio(${indexEx}, 1)" aria-label="Mover ${escapeHTML(ex.nome)} para baixo" class="h-10 w-10 rounded-xl text-gray-400 active:bg-white/10"><i data-lucide="chevron-down" class="w-5 h-5"></i></button><button type="button" onclick="excluirExercicio(${indexEx})" aria-label="Excluir ${escapeHTML(ex.nome)}" class="h-10 w-10 rounded-xl text-gray-500 active:bg-red-500/10 active:text-red-400"><i data-lucide="trash-2" class="w-4 h-4"></i></button></div>
        </div>
        ${notaHTML}
        <section class="coach-advice mb-3 rounded-xl ${conselhoTom} p-3"><div class="flex items-start gap-2"><i data-lucide="sparkles" class="mt-0.5 h-4 w-4 shrink-0"></i><div><p class="text-xs font-extrabold">${escapeHTML(conselho.title)}</p><p class="mt-1 text-[11px] leading-relaxed opacity-90">${escapeHTML(conselho.message)}</p><p class="mt-2 rounded-xl bg-black/10 px-3 py-2 text-[11px] font-bold opacity-95">${escapeHTML(sugestaoProxima)}</p></div></div></section>
        <button type="button" onclick="abrirSubstituicao(${indexEx})" class="mb-3 flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/10 text-xs font-bold text-gray-400"><i data-lucide="replace" class="h-4 w-4"></i> Substituir exercício</button>
        ${editorNotaHTML}
        <details class="mb-4 rounded-xl mol-soft p-3"><summary class="cursor-pointer text-xs font-bold text-gray-400">Ajustar metas e progressão</summary><div class="workout-target-grid mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4"><label class="text-[10px] text-gray-500">REPS mín.<input min="1" max="1000" step="1" onchange="atualizarMetaExercicio(${indexEx}, 'repsMin', this.value)" type="number" value="${ex.repsMin || 8}" class="mt-1 w-full rounded-lg mol-field p-2 text-center text-sm text-white"></label><label class="text-[10px] text-gray-500">REPS máx.<input min="1" max="1000" step="1" onchange="atualizarMetaExercicio(${indexEx}, 'repsMax', this.value)" type="number" value="${ex.repsMax || 12}" class="mt-1 w-full rounded-lg mol-field p-2 text-center text-sm text-white"></label><label class="text-[10px] text-gray-500">RIR alvo<input min="0" max="10" step="1" onchange="atualizarMetaExercicio(${indexEx}, 'rirAlvo', this.value)" type="number" value="${ex.rirAlvo ?? 2}" class="mt-1 w-full rounded-lg mol-field p-2 text-center text-sm text-white"></label><label class="text-[10px] text-gray-500">DESC. (s)<input min="15" max="3600" step="5" onchange="atualizarMetaExercicio(${indexEx}, 'descansoSegundos', this.value)" type="number" value="${ex.descansoSegundos || 90}" class="mt-1 w-full rounded-lg mol-field p-2 text-center text-sm text-white"></label></div></details>

        <div class="workout-set-header flex items-center gap-1 mb-2 px-1"><div class="workout-set-grid grid flex-1 grid-cols-[1.2fr_2.4fr_1.7fr_1.7fr_1.2fr_1.2fr] gap-1 text-[10px] text-gray-500 font-semibold text-center tracking-wider items-center">
          <button type="button" onclick="mostrarInfoTreino('serie')" class="min-h-8 rounded-md active:bg-white/10">SÉRIE</button>
          <button type="button" onclick="mostrarInfoTreino('anterior')" class="min-h-8 rounded-md active:bg-white/10">ANTERIOR</button>
          <button type="button" onclick="mostrarInfoTreino('kg')" class="min-h-8 rounded-md active:bg-white/10">KG</button>
          <button type="button" onclick="mostrarInfoTreino('reps')" class="min-h-8 rounded-md active:bg-white/10">REPS</button>
          <button type="button" onclick="mostrarInfoTreino('rir')" class="min-h-8 rounded-md active:bg-white/10">RIR</button>
          <button type="button" onclick="mostrarInfoTreino('check')" aria-label="O que é concluir série" class="min-h-8 rounded-md active:bg-white/10"><i data-lucide="check" class="w-3 h-3 mx-auto"></i></button>
        </div><div class="w-8 shrink-0"></div></div>

        <div class="space-y-1">
          ${ex.series.map((serie, indexSerie) => {
            let label = '';
            let corFundo = 'mol-field text-white';

            if (serie.tipo === 'N' || serie.tipo === '1') {
              contadorNormal++;
              label = contadorNormal;
            } else if (serie.tipo === 'W') {
              label = 'W'; corFundo = 'text-orange-400 bg-orange-400/10';
            } else if (serie.tipo === 'F') {
              label = 'F'; corFundo = 'text-red-400 bg-red-400/10';
            } else if (serie.tipo === 'D') {
              label = 'D'; corFundo = 'text-blue-400 bg-blue-400/10';
            }

            const metodo = setMethod(serie);
            if (metodo !== SET_METHODS.NORMAL) {
              const meta = methodMeta[metodo] || methodMeta[SET_METHODS.DROP_SET];
              const bgLinhaMetodo = serie.concluida ? 'bg-neon/10' : 'mol-soft';
              const bgBotaoCheckMetodo = serie.concluida ? 'bg-neon text-black' : 'mol-field border border-white/10 text-transparent';
              return `
              <div class="relative flex items-stretch gap-1 mb-1">
                <button type="button" onclick="abrirEditorMetodoSerie(${indexEx}, ${indexSerie})" class="${bgLinhaMetodo} flex min-w-0 flex-1 items-center gap-3 rounded-xl px-3 py-3 text-left active:bg-white/10">
                  <span class="set-type-badge shrink-0 text-[10px] font-extrabold ${meta.tone}">${meta.badge}</span>
                  <span class="min-w-0 flex-1">
                    <span class="block text-[10px] font-bold uppercase tracking-wider text-neon">${meta.label}</span>
                    <strong class="mt-1 block truncate text-sm text-white">${escapeHTML(setSummary(serie))}</strong>
                  </span>
                  <i data-lucide="chevron-right" class="h-4 w-4 shrink-0 text-gray-500"></i>
                </button>
                <button type="button" onclick="concluirSerie(${indexEx}, ${indexSerie})" aria-label="Concluir ${meta.label}" class="flex h-auto w-11 shrink-0 items-center justify-center rounded-xl ${bgBotaoCheckMetodo} transition-colors active:scale-95">
                  <i data-lucide="check" class="w-4 h-4 ${serie.concluida ? 'text-white' : 'text-gray-600'}"></i>
                </button>
                <button type="button" onclick="excluirSerie(${indexEx}, ${indexSerie})" aria-label="Excluir série" class="flex h-auto w-9 shrink-0 items-center justify-center rounded-xl text-gray-600 active:bg-red-500/10 active:text-red-400">
                  <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
              </div>`;
            }

            const anteriorSerie = valorAnteriorDaSerie(ex, indexSerie);
            const temAnterior = anteriorSerie?.kg != null && Number(anteriorSerie.reps) > 0;
            const textoAnterior = temAnterior ? `${anteriorSerie.kg}kg x ${anteriorSerie.reps}` : '-';

            const bgLinha = serie.concluida ? 'bg-neon/10' : 'mol-soft';
            const bgBotaoCheck = serie.concluida ? 'bg-neon text-black' : 'mol-field border border-white/10 text-transparent';
            const bgInput = serie.concluida ? 'bg-transparent text-white' : 'mol-field text-white';

            return `
            <div class="relative flex items-center gap-1 mb-1">
              <div class="workout-set-grid flex-1 ${bgLinha} grid items-center grid-cols-[1.2fr_2.4fr_1.7fr_1.7fr_1.2fr_1.2fr] gap-1 py-1.5 px-1 rounded transition-colors">

                <div class="set-type-badge is-editable mx-auto cursor-pointer text-xs font-bold transition-colors ${corFundo}"
                     onclick="abrirModalTipoSerie(${indexEx}, ${indexSerie})">
                  ${label}
                </div>

                <button type="button" onclick="copiarAnterior(${indexEx}, ${indexSerie})" class="min-w-0 text-center text-gray-400 text-[11px] font-medium flex min-h-10 w-full items-center justify-center rounded-lg active:bg-white/10" aria-label="Copiar carga anterior">
                  <span>${textoAnterior}</span>
                </button>

                <input type="number" min="0" max="2000" step="0.25" inputmode="decimal" aria-label="Carga em quilogramas da série ${label}" id="kg-${indexEx}-${indexSerie}" placeholder="${anteriorSerie?.kg ?? '-'}" value="${serie.kg ?? ''}" class="${bgInput} w-full text-center py-1.5 rounded text-sm font-semibold outline-none focus:border-neon border border-transparent transition-colors">
                <input type="number" min="1" max="1000" step="1" inputmode="numeric" aria-label="Repetições da série ${label}" id="reps-${indexEx}-${indexSerie}" placeholder="${anteriorSerie?.reps ?? '-'}" value="${serie.reps ?? ''}" class="${bgInput} w-full text-center py-1.5 rounded text-sm font-semibold outline-none focus:border-neon border border-transparent transition-colors">
                <input type="number" min="0" max="10" step="1" inputmode="numeric" aria-label="RIR da série ${label}" id="rir-${indexEx}-${indexSerie}" placeholder="-" value="${serie.rir ?? ''}" class="${bgInput} w-full text-center py-1.5 rounded text-sm font-semibold outline-none focus:border-neon border border-transparent transition-colors">

                <button type="button" onclick="concluirSerie(${indexEx}, ${indexSerie})" aria-label="Concluir série ${label}" class="h-11 w-11 mx-auto rounded-xl ${bgBotaoCheck} flex items-center justify-center transition-colors active:scale-95">
                  <i data-lucide="check" class="w-4 h-4 ${serie.concluida ? 'text-white' : 'text-gray-600'}"></i>
                </button>
              </div>


              <button type="button" onclick="excluirSerie(${indexEx}, ${indexSerie})" aria-label="Excluir série" class="flex h-11 w-9 items-center justify-center rounded-xl text-gray-600 active:bg-red-500/10 active:text-red-400">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            </div>
          `}).join('')}
        </div>

        <button type="button" onclick="adicionarSerie(${indexEx})" class="w-full text-center py-3 mt-2 text-xs font-semibold text-gray-500 hover:text-white transition-colors flex items-center justify-center gap-1">
          <i data-lucide="plus" class="w-3 h-3"></i> Adicionar Série
        </button>
      </article>
    `}).join('');

    exerciciosList.innerHTML = painelMetricasHTML + editorNomeHTML + exerciciosHtml;
  }
  const inputEditarNome = document.getElementById('input-editar-nome-rotina');
  if (inputEditarNome) inputEditarNome.value = rotina.nome;

  esconderTudo();
  viewDetalhe.classList.remove('hidden');
  viewDetalhe.classList.toggle('workout-compact', treinoIniciado && modoCompacto);
  renderIcons();
  atualizarDisplayTempo();
  if (treinoIniciado) salvarRascunho({ force: true });
}
window.abrirRotina = abrirRotina;

window.atualizarMetaExercicio = async (indexEx, campo, valor) => {
  const rotina = rotinasReais.find(r => r.id === rotinaAbertaId);
  const exercicio = rotina?.exercicios?.[indexEx];
  if (!exercicio) return;
  const validacao = validateExerciseTargets(exercicio, campo, valor);
  if (!validacao.valid) { showToast(validacao.message); abrirRotina(rotinaAbertaId); return; }
  const anterior = exercicio[campo];
  exercicio[campo] = validacao.value;
  salvarRascunho({ force: true });
  try { await updateDoc(doc(db, 'treinos', rotinaAbertaId), { exercicios: exerciciosParaPersistir(rotina) }); showToast('Meta atualizada.', 'success'); }
  catch (error) { exercicio[campo] = anterior; abrirRotina(rotinaAbertaId); console.error(error); showToast('Não foi possível salvar a meta.'); }
};

window.atualizarNotaExercicio = async (indexEx, valor) => {
  const rotina = rotinasReais.find(r => r.id === rotinaAbertaId);
  const exercicio = rotina?.exercicios?.[indexEx];
  if (!exercicio) return;
  const nota = String(valor || '').trim().slice(0, 500);
  const anterior = exercicio.notas || '';
  if (nota === anterior) return;
  exercicio.notas = nota;
  salvarRascunho({ force: true });
  try {
    await updateDoc(doc(db, 'treinos', rotinaAbertaId), { exercicios: exerciciosParaPersistir(rotina) });
    showToast(nota ? 'Observação salva.' : 'Observação removida.', 'success');
  } catch (error) {
    exercicio.notas = anterior;
    abrirRotina(rotinaAbertaId);
    console.error(error);
    showToast('Não foi possível salvar a observação.');
  }
};

window.copiarAnterior = (indexEx, indexSerie) => {
  const exercicio = rotinasReais.find(r => r.id === rotinaAbertaId)?.exercicios[indexEx];
  const anterior = valorAnteriorDaSerie(exercicio, indexSerie);
  if (!anterior) return showToast('Ainda não há carga anterior para copiar.');
  const kg = document.getElementById(`kg-${indexEx}-${indexSerie}`);
  const reps = document.getElementById(`reps-${indexEx}-${indexSerie}`);
  kg.value = anterior.kg; reps.value = anterior.reps;
  kg.dispatchEvent(new Event('input', { bubbles: true })); reps.dispatchEvent(new Event('input', { bubbles: true }));
  showToast('Carga anterior copiada.', 'success');
};

// ---------------------------------------------
// REQUISITO 1: VALIDAÇÃO RÍGIDA DE CARGA/REPS NO CHECK
// ---------------------------------------------
window.concluirSerie = async (indexEx, indexSerie) => {
  if (!treinoIniciado) return showToast('Você está editando a rotina. Toque em Iniciar para registrar séries.');
  const rotina = rotinasReais.find(r => r.id === rotinaAbertaId);
  const serie = rotina.exercicios[indexEx].series[indexSerie];

  if (isAdvancedSet(serie)) {
    if (serie.concluida) {
      serie.concluida = false;
    } else {
      const validacao = validateContextualSet(serie);
      if (!validacao.valid) {
        showToast(validacao.message);
        window.abrirEditorMetodoSerie(indexEx, indexSerie);
        return;
      }
      serie.details = validacao.values.details;
      syncSetLegacyFields(serie);
      serie.concluida = true;
    }
    salvarRascunho({ force: true });
    abrirRotina(rotinaAbertaId);
    if (serie.concluida) iniciarDescanso(indexEx, indexSerie);
    return;
  }

  const inputKg = document.getElementById(`kg-${indexEx}-${indexSerie}`).value.trim();
  const inputReps = document.getElementById(`reps-${indexEx}-${indexSerie}`).value.trim();
  const inputRir = document.getElementById(`rir-${indexEx}-${indexSerie}`).value.trim();

  // Se a série JÁ ESTÁ concluída, permitir desmarcar livremente
  if (serie.concluida) {
    serie.concluida = false;
  } else {
    const dadosDaSerie = completarComAnteriorSeVazio({
      exercicio: rotina.exercicios[indexEx],
      indexSerie,
      kg: inputKg,
      reps: inputReps,
      rir: inputRir,
    });
    const validacao = validateSet(dadosDaSerie);
    if (!validacao.valid) return showToast(validacao.message);

    serie.concluida = true;
    serie.kg = validacao.values.kg;
    serie.reps = validacao.values.reps;
    serie.rir = validacao.values.rir ?? '';
    if (dadosDaSerie.usadoAnterior) showToast('Série concluída com os dados do último treino.', 'success');
  }
  salvarRascunho({ force: true });
  abrirRotina(rotinaAbertaId);
  if (serie.concluida) iniciarDescanso(indexEx, indexSerie);
};

// ---------------------------------------------
// REQUISITO 2 & 3: SALVAMENTO COM RESET DE CHECKS E HISTÓRICO LIMPO PARA A PRÓXIMA SEMANA
// ---------------------------------------------
window.finalizarEConcluirTreino = async () => {
  if (finalizandoTreino) return;
  const rotina = rotinasReais.find(r => r.id === rotinaAbertaId);
  if (!rotina || !rotina.exercicios) return;

  const totais = workoutTotals(rotina.exercicios);
  if (totais.completed === 0) return showToast('Conclua ao menos uma série antes de finalizar.');
  if (totais.completed < totais.total) {
    const confirmar = await confirmAction({ title: 'Finalizar treino?', message: `${totais.total - totais.completed} série(s) ficarão como não realizadas.`, confirmText: 'Finalizar assim' });
    if (!confirmar) return;
  }
  finalizandoTreino = true;
  const btnFinalizar = document.getElementById('btn-concluir-treino');
  if (btnFinalizar) { btnFinalizar.disabled = true; btnFinalizar.textContent = 'Salvando...'; }

  atualizarCronometro();
  const sessaoConcluida = completedWorkoutSnapshot(rotina.exercicios);
  const resumoVolume = totais.volume;
  const duracaoConcluida = tempoSegundos;
  const exerciciosLimpos = cleanRoutineExercises(rotina.exercicios);

  try {
    // A sessão é um registro imutável: rotinas podem mudar, o histórico não.
    const batch = writeBatch(db);
    const sessaoRef = doc(collection(db, 'sessoes'));
    batch.set(sessaoRef, {
      userId: usuarioAtual.uid,
      rotinaId: rotinaAbertaId,
      nomeRotina: rotina.nome,
      exercicios: sessaoConcluida,
      volumeTotal: resumoVolume,
      duracaoSegundos: duracaoConcluida,
      checkinPreTreino,
      iniciadaEm: sessaoIniciadaEm || serverTimestamp(),
      concluidoEm: serverTimestamp()
    });
    batch.update(doc(db, "treinos", rotinaAbertaId), {
      exercicios: exerciciosLimpos,
      ultimoTreinoEm: serverTimestamp()
    });
    await batch.commit();

    removeSessionItems(
      `mol-progress-cache-${usuarioAtual.uid}`,
      `mol-history-cache-${usuarioAtual.uid}`,
      `mol-profile-cache-${usuarioAtual.uid}`
    );
    rotina.exercicios = exerciciosLimpos;
    limparRascunho();
    pararCronometro();
    pararDescanso();
    mostrarResumoTreino({ series: totais.completed, volume: resumoVolume, exercicios: sessaoConcluida.filter(ex => ex.series?.some(serie => serie.concluida)).length, duracao: duracaoConcluida, exerciciosDetalhados: sessaoConcluida });

    esconderTudo();
    viewRotinas.classList.remove('hidden');
    carregarRotinasDoBanco();
  } catch (error) {
    console.error("Erro ao salvar treino:", error);
    showToast('Não foi possível concluir o treino.');
  } finally {
    finalizandoTreino = false;
    if (btnFinalizar) { btnFinalizar.disabled = false; btnFinalizar.textContent = 'Finalizar'; }
  }
};

window.adicionarSerie = async (indexEx) => {
  const rotina = rotinasReais.find(r => r.id === rotinaAbertaId);
  if (!rotina?.exercicios?.[indexEx]) return;
  if (rotina.exercicios[indexEx].series.length >= WORKOUT_STRUCTURE_LIMITS.setsPerExercise) return showToast(`Cada exercício pode ter até ${WORKOUT_STRUCTURE_LIMITS.setsPerExercise} séries.`);
  rotina.exercicios[indexEx].series.push({ tipo: 'N', kg: '', reps: '', concluida: false });

  try {
    await updateDoc(doc(db, "treinos", rotinaAbertaId), { exercicios: exerciciosParaPersistir(rotina) });
    abrirRotina(rotinaAbertaId);
  } catch (error) { console.error(error); showToast('Não foi possível adicionar a série.'); await carregarRotinasDoBanco(); }
};

async function excluirSerie(indexEx, indexSerie) {
  const rotina = rotinasReais.find(r => r.id === rotinaAbertaId);
  if (!rotina?.exercicios?.[indexEx]?.series?.[indexSerie]) return;
  if (rotina.exercicios[indexEx].series.length === 1) return showToast('O exercício precisa manter ao menos uma série. Para removê-lo, use a lixeira do exercício.');
  if (!await confirmAction({ title: 'Excluir série?', message: 'Os dados preenchidos nesta série serão removidos.', confirmText: 'Excluir', danger: true })) return;
  rotina.exercicios[indexEx].series.splice(indexSerie, 1);

  try {
    await updateDoc(doc(db, "treinos", rotinaAbertaId), { exercicios: exerciciosParaPersistir(rotina) });
    abrirRotina(rotinaAbertaId);
  } catch (error) { console.error(error); showToast('Não foi possível excluir a série.'); await carregarRotinasDoBanco(); }
};

window.moverExercicio = async (indexEx, direcao) => {
  const rotina = rotinasReais.find(r => r.id === rotinaAbertaId);
  const destino = indexEx + direcao;
  if (!rotina || destino < 0 || destino >= rotina.exercicios.length) return;
  [rotina.exercicios[indexEx], rotina.exercicios[destino]] = [rotina.exercicios[destino], rotina.exercicios[indexEx]];
  try { await updateDoc(doc(db, 'treinos', rotinaAbertaId), { exercicios: exerciciosParaPersistir(rotina) }); abrirRotina(rotinaAbertaId); }
  catch (error) { [rotina.exercicios[indexEx], rotina.exercicios[destino]] = [rotina.exercicios[destino], rotina.exercicios[indexEx]]; abrirRotina(rotinaAbertaId); console.error(error); showToast('Não foi possível reordenar o exercício.'); }
};

window.excluirExercicio = async (indexEx) => {
  const rotina = rotinasReais.find(r => r.id === rotinaAbertaId);
  if (!rotina?.exercicios?.[indexEx]) return;
  if (!await confirmAction({ title: 'Excluir exercício?', message: `${rotina.exercicios[indexEx].nome} e todas as suas séries serão removidos da rotina.`, confirmText: 'Excluir', danger: true })) return;
  rotina.exercicios.splice(indexEx, 1);

  try {
    await updateDoc(doc(db, "treinos", rotinaAbertaId), { exercicios: exerciciosParaPersistir(rotina) });
    abrirRotina(rotinaAbertaId);
  } catch (error) { console.error(error); showToast('Não foi possível excluir o exercício.'); await carregarRotinasDoBanco(); }
};

const modalTipoSerie = document.getElementById('modal-tipo-serie');
const modalTipoSerieContent = document.getElementById('modal-tipo-serie-content');
let editandoSerie = { ex: null, serie: null };
let focoAntesDoModal = null;

function fecharModalTipoSerie() {
  modalTipoSerie.classList.add('opacity-0');
  modalTipoSerieContent.classList.add('translate-y-full');
  setTimeout(() => { modalTipoSerie.classList.add('hidden'); focoAntesDoModal?.focus(); }, 300);
}

window.abrirModalTipoSerie = (indexEx, indexSerie) => {
  editandoSerie = { ex: indexEx, serie: indexSerie };
  focoAntesDoModal = document.activeElement;
  modalTipoSerie.classList.remove('hidden');
  setTimeout(() => {
    modalTipoSerie.classList.remove('opacity-0');
    modalTipoSerieContent.classList.remove('translate-y-full');
    modalTipoSerieContent.querySelector('button')?.focus();
  }, 10);
}
window.excluirSerie = excluirSerie;

window.mudarTipoSerie = async (novoTipo) => {
  const rotina = rotinasReais.find(r => r.id === rotinaAbertaId);
  const serie = rotina.exercicios[editandoSerie.ex].series[editandoSerie.serie];
  serie.tipo = novoTipo;
  serie.method = novoTipo === 'D' ? SET_METHODS.DROP_SET : SET_METHODS.NORMAL;
  serie.details = defaultMethodDetails(serie.method, serie);

  fecharModalTipoSerie();

  try {
    await updateDoc(doc(db, "treinos", rotinaAbertaId), { exercicios: exerciciosParaPersistir(rotina) });
    abrirRotina(rotinaAbertaId);
  } catch (error) { console.error(error); showToast('Não foi possível alterar o tipo da série.'); await carregarRotinasDoBanco(); }
};

function instalarOpcoesContextuais() {
  const list = modalTipoSerieContent?.querySelector('.space-y-2');
  const remove = modalTipoSerie?.querySelector('[data-remove-series]');
  if (!list || !remove || modalTipoSerie.querySelector('[data-series-method]')) return;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div class="h-px bg-white/10 my-2"></div>
    <p class="px-4 pt-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">Métodos contextuais</p>
    ${Object.entries(methodMeta).map(([method, meta]) => `<button type="button" data-series-method="${method}" class="w-full flex items-center p-4 rounded-2xl active:bg-white/5 transition-colors"><span class="font-extrabold w-10 text-sm ${meta.tone}">${meta.badge}</span><span class="font-medium text-white text-base">${meta.label}</span></button>`).join('')}
  `;
  [...wrapper.children].forEach(child => list.insertBefore(child, remove.previousElementSibling));
}

window.mudarMetodoSerie = async (method) => {
  const rotina = rotinasReais.find(r => r.id === rotinaAbertaId);
  const serie = rotina?.exercicios?.[editandoSerie.ex]?.series?.[editandoSerie.serie];
  if (!serie || !methodMeta[method]) return;
  serie.tipo = method === SET_METHODS.DROP_SET ? 'D' : 'N';
  serie.method = method;
  serie.details = defaultMethodDetails(method, serie);
  syncSetLegacyFields(serie);
  fecharModalTipoSerie();
  salvarRascunho({ force: true });
  try {
    await updateDoc(doc(db, "treinos", rotinaAbertaId), { exercicios: exerciciosParaPersistir(rotina) });
    abrirRotina(rotinaAbertaId);
    window.abrirEditorMetodoSerie(editandoSerie.ex, editandoSerie.serie);
  } catch (error) { console.error(error); showToast('Não foi possível alterar o método da série.'); await carregarRotinasDoBanco(); }
};

function numberField(name, label, value, attrs = '') {
  return `<label class="text-[10px] font-bold uppercase tracking-wider text-gray-500">${label}<input name="${name}" value="${value ?? ''}" type="number" inputmode="decimal" ${attrs} class="mt-1 min-h-12 w-full rounded-xl mol-field px-3 text-sm font-bold text-white outline-none focus:border-neon"></label>`;
}

function valuesFromForm(form, names) {
  return Object.fromEntries(names.map(name => [name, form.elements[name]?.value?.trim() ?? '']));
}

window.abrirEditorMetodoSerie = (indexEx, indexSerie) => {
  const rotina = rotinasReais.find(r => r.id === rotinaAbertaId);
  const exercicio = rotina?.exercicios?.[indexEx];
  const serie = exercicio?.series?.[indexSerie];
  if (!serie) return;
  const method = setMethod(serie);
  const meta = methodMeta[method];
  if (!meta) return;
  const details = { ...defaultMethodDetails(method, serie), ...(serie.details || {}) };
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 z-[210] flex items-end bg-black/70 p-0';
  modal.innerHTML = `<form class="mx-auto w-full max-w-md rounded-t-3xl mol-dialog-surface p-6 animate-slide-up" data-method-form><div class="mx-auto mb-5 h-1.5 w-11 rounded-full bg-white/20"></div><p class="text-xs font-bold uppercase tracking-wider text-neon">${meta.label}</p><h2 class="mt-1 text-xl font-extrabold">${escapeHTML(exercicio.nome)}</h2><div data-method-fields class="mt-5 space-y-4"></div><label class="mt-4 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Observação<textarea name="note" maxlength="240" class="mt-1 min-h-20 w-full rounded-xl mol-field p-3 text-sm text-white outline-none focus:border-neon">${escapeHTML(details.note || '')}</textarea></label><div class="mt-6 grid grid-cols-2 gap-3"><button type="button" data-close class="min-h-12 rounded-2xl mol-soft text-sm font-bold text-gray-300">Fechar</button><button type="submit" class="min-h-12 rounded-2xl bg-neon text-sm font-bold text-black">Salvar</button></div></form>`;
  const fields = modal.querySelector('[data-method-fields]');
  if (method === SET_METHODS.DROP_SET) fields.innerHTML = `<section class="rounded-2xl mol-soft p-4"><p class="mb-3 text-xs font-bold uppercase tracking-wider text-neon">Série principal</p><div class="grid grid-cols-2 gap-2">${numberField('primaryKg', 'Carga inicial', details.primary?.kg, 'min="0" max="2000" step="0.25"')}${numberField('primaryReps', 'Reps', details.primary?.reps, 'min="1" max="1000" step="1"')}</div></section><section class="rounded-2xl mol-soft p-4"><p class="mb-3 text-xs font-bold uppercase tracking-wider text-neon">Drops</p><div class="space-y-2">${[0,1,2].map(i => `<div class="grid grid-cols-2 gap-2">${numberField(`dropKg${i}`, `Drop ${i + 1} kg`, details.drops?.[i]?.kg, 'min="0" max="2000" step="0.25"')}${numberField(`dropReps${i}`, 'Reps', details.drops?.[i]?.reps, 'min="1" max="1000" step="1"')}</div>`).join('')}</div>${numberField('restSeconds', 'Descanso entre drops (s)', details.restSeconds ?? 0, 'min="0" max="3600" step="5"')}</section>`;
  if (method === SET_METHODS.REST_PAUSE || method === SET_METHODS.CLUSTER) fields.innerHTML = `<section class="rounded-2xl mol-soft p-4"><div class="grid grid-cols-2 gap-2">${numberField('kg', 'Carga', details.kg, 'min="0" max="2000" step="0.25"')}${numberField('restSeconds', 'Descanso (s)', details.restSeconds, 'min="0" max="3600" step="5"')}</div><p class="mb-2 mt-4 text-xs font-bold uppercase tracking-wider text-neon">Blocos</p><div class="grid grid-cols-4 gap-2">${[0,1,2,3,4,5].map(i => numberField(`block${i}`, `${i + 1}`, details.blocks?.[i], 'min="1" max="1000" step="1"')).join('')}</div></section>`;
  if (method === SET_METHODS.MYO_REPS) fields.innerHTML = `<section class="rounded-2xl mol-soft p-4"><p class="mb-3 text-xs font-bold uppercase tracking-wider text-neon">Série de ativação</p><div class="grid grid-cols-2 gap-2">${numberField('activationKg', 'Carga', details.activation?.kg, 'min="0" max="2000" step="0.25"')}${numberField('activationReps', 'Reps', details.activation?.reps, 'min="1" max="1000" step="1"')}</div>${numberField('restSeconds', 'Descanso (s)', details.restSeconds, 'min="0" max="3600" step="5"')}</section><section class="rounded-2xl mol-soft p-4"><p class="mb-3 text-xs font-bold uppercase tracking-wider text-neon">Mini-séries</p><div class="grid grid-cols-4 gap-2">${[0,1,2,3,4,5].map(i => numberField(`mini${i}`, `+${i + 1}`, details.miniSets?.[i], 'min="1" max="1000" step="1"')).join('')}</div></section>`;
  if (method === SET_METHODS.ISOMETRIC) fields.innerHTML = `<section class="rounded-2xl mol-soft p-4"><div class="grid grid-cols-3 gap-2">${numberField('kg', 'Carga', details.kg, 'min="0" max="2000" step="0.25"')}${numberField('reps', 'Reps', details.reps, 'min="1" max="1000" step="1"')}${numberField('holdSeconds', 'Isometria (s)', details.holdSeconds, 'min="1" max="3600" step="1"')}</div></section>`;
  document.body.appendChild(modal);
  modal.querySelector('[data-close]').onclick = () => modal.remove();
  modal.addEventListener('click', event => { if (event.target === modal) modal.remove(); });
  modal.querySelector('form').onsubmit = async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const note = form.elements.note?.value?.trim().slice(0, 240) || '';
    if (method === SET_METHODS.DROP_SET) {
      const values = valuesFromForm(form, ['primaryKg', 'primaryReps', 'restSeconds', 'dropKg0', 'dropReps0', 'dropKg1', 'dropReps1', 'dropKg2', 'dropReps2']);
      serie.details = { primary: { kg: values.primaryKg, reps: values.primaryReps }, drops: [0,1,2].map(i => ({ kg: values[`dropKg${i}`], reps: values[`dropReps${i}`] })).filter(item => item.kg || item.reps), restSeconds: values.restSeconds || 0, note };
    } else if (method === SET_METHODS.REST_PAUSE || method === SET_METHODS.CLUSTER) {
      const values = valuesFromForm(form, ['kg', 'restSeconds', ...[0,1,2,3,4,5].map(i => `block${i}`)]);
      serie.details = { kg: values.kg, blocks: [0,1,2,3,4,5].map(i => values[`block${i}`]).filter(Boolean), restSeconds: values.restSeconds || (method === SET_METHODS.REST_PAUSE ? 20 : 15), note };
    } else if (method === SET_METHODS.MYO_REPS) {
      const values = valuesFromForm(form, ['activationKg', 'activationReps', 'restSeconds', ...[0,1,2,3,4,5].map(i => `mini${i}`)]);
      serie.details = { activation: { kg: values.activationKg, reps: values.activationReps }, miniSets: [0,1,2,3,4,5].map(i => values[`mini${i}`]).filter(Boolean), restSeconds: values.restSeconds || 15, note };
    } else if (method === SET_METHODS.ISOMETRIC) {
      const values = valuesFromForm(form, ['kg', 'reps', 'holdSeconds']);
      serie.details = { kg: values.kg, reps: values.reps, holdSeconds: values.holdSeconds, note };
    }
    const validacao = validateContextualSet(serie);
    if (!validacao.valid) return showToast(validacao.message);
    serie.details = validacao.values.details;
    syncSetLegacyFields(serie);
    salvarRascunho({ force: true });
    try { await updateDoc(doc(db, "treinos", rotinaAbertaId), { exercicios: exerciciosParaPersistir(rotina) }); modal.remove(); abrirRotina(rotinaAbertaId); showToast('Método salvo.', 'success'); }
    catch (error) { console.error(error); showToast('Não foi possível salvar o método.'); }
  };
  renderIcons(modal);
};

window.removerSerieAberta = () => {
  excluirSerie(editandoSerie.ex, editandoSerie.serie);
  fecharModalTipoSerie();
};

instalarOpcoesContextuais();
modalTipoSerie.querySelectorAll('[data-series-type]').forEach(button => button.addEventListener('click', () => window.mudarTipoSerie(button.dataset.seriesType)));
modalTipoSerie.querySelectorAll('[data-series-method]').forEach(button => button.addEventListener('click', () => window.mudarMetodoSerie(button.dataset.seriesMethod)));
modalTipoSerie.querySelector('[data-remove-series]')?.addEventListener('click', () => window.removerSerieAberta());

modalTipoSerie.addEventListener('click', (e) => {
  if (e.target === modalTipoSerie) {
    fecharModalTipoSerie();
  }
});

modalTipoSerie.addEventListener('keydown', event => {
  if (event.key === 'Escape') { event.preventDefault(); fecharModalTipoSerie(); return; }
  if (event.key !== 'Tab') return;
  const controls = [...modalTipoSerie.querySelectorAll('button:not(:disabled)')];
  const first = controls[0]; const last = controls.at(-1);
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});

window.addEventListener('load', () => renderIcons(), { once: true });
