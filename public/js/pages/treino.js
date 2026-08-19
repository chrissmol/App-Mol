// js/pages/treino.js
document.title = 'Mol';
import { auth, db } from '../config/firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, addDoc, getDocs, getDoc, setDoc, query, where, serverTimestamp, doc, updateDoc, deleteDoc, writeBatch } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { showToast, confirmAction, escapeHTML } from '../utils/ui.js';
import { setupAppShell } from '../utils/app-shell.js';
setupAppShell();

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
let finalizandoTreino = false;
let checkinPreTreino = null;

const draftKey = (id) => `mol-workout-draft-${id}`;
function lerRascunho(id) {
  try { return JSON.parse(localStorage.getItem(draftKey(id)) || 'null'); }
  catch { localStorage.removeItem(draftKey(id)); return null; }
}
function salvarRascunho() {
  if (!usuarioAtual || !rotinaAbertaId) return;
  const rotina = rotinasReais.find(r => r.id === rotinaAbertaId);
  if (!rotina) return;
  try { localStorage.setItem(draftKey(usuarioAtual.uid), JSON.stringify({ rotinaId: rotinaAbertaId, exercicios: rotina.exercicios, tempoSegundos, iniciadaEm: sessaoIniciadaEm?.toISOString(), checkinPreTreino })); }
  catch (error) { console.warn('Não foi possível salvar o rascunho local.', error); }
}
function limparRascunho() { if (usuarioAtual) localStorage.removeItem(draftKey(usuarioAtual.uid)); }

import { bibliotecaDeExercicios } from '../data/exercicios-data.js';
// Funciona tanto no Live Server quanto no build do Vite, sem tentar executar o SVG como JavaScript.
const exerciseFigure = new URL('../../assets/exercise-figure.svg', import.meta.url).href;
let favoritosExercicios = [];
let recentesExercicios = [];
let exerciciosPersonalizados = [];
const ultimaPerformance = new Map();
const historicoPerformance = new Map();
const bibliotecaKey = () => `mol-exercise-library-${usuarioAtual?.uid || 'guest'}`;
function salvarPreferenciasBiblioteca() { localStorage.setItem(bibliotecaKey(), JSON.stringify({ favoritosExercicios, recentesExercicios, exerciciosPersonalizados })); if (usuarioAtual) setDoc(doc(db, 'users', usuarioAtual.uid), { exerciseLibraryPreferences: { favoritosExercicios, recentesExercicios, exerciciosPersonalizados } }, { merge: true }).catch(error => console.warn('Preferências locais não sincronizadas:', error.message)); }
function carregarPreferenciasBiblioteca() { try { ({ favoritosExercicios = [], recentesExercicios = [], exerciciosPersonalizados = [] } = JSON.parse(localStorage.getItem(bibliotecaKey()) || '{}')); exerciciosPersonalizados.forEach(ex => { if (!bibliotecaDeExercicios.some(item => item.nome === ex.nome)) bibliotecaDeExercicios.push(ex); }); } catch { favoritosExercicios = []; recentesExercicios = []; exerciciosPersonalizados = []; } }
async function carregarPreferenciasDaConta() { try { const snapshot = await getDoc(doc(db, 'users', usuarioAtual.uid)); const prefs = snapshot.data()?.exerciseLibraryPreferences; if (!prefs) return; favoritosExercicios = prefs.favoritosExercicios || favoritosExercicios; recentesExercicios = prefs.recentesExercicios || recentesExercicios; exerciciosPersonalizados = prefs.exerciciosPersonalizados || exerciciosPersonalizados; exerciciosPersonalizados.forEach(ex => { if (!bibliotecaDeExercicios.some(item => item.nome === ex.nome)) bibliotecaDeExercicios.push(ex); }); localStorage.setItem(bibliotecaKey(), JSON.stringify({ favoritosExercicios, recentesExercicios, exerciciosPersonalizados })); renderizarBiblioteca(inputBuscaExercicio?.value || ''); } catch (error) { console.warn('Preferências da conta não carregadas:', error.message); } }
async function carregarUltimasPerformances() { try { const snapshot = await getDocs(query(collection(db, 'sessoes'), where('userId', '==', usuarioAtual.uid))); const sessoes = snapshot.docs.map(item => item.data()).sort((a, b) => (b.concluidoEm?.seconds || 0) - (a.concluidoEm?.seconds || 0)); sessoes.forEach(sessao => (sessao.exercicios || []).forEach(exercicio => { const serie = [...(exercicio.series || [])].reverse().find(item => item.concluida && Number(item.kg) >= 0 && Number(item.reps) > 0); if (!serie) return; const registro = { kg: Number(serie.kg), reps: Number(serie.reps) }; const lista = historicoPerformance.get(exercicio.nome) || []; lista.push(registro); historicoPerformance.set(exercicio.nome, lista); if (!ultimaPerformance.has(exercicio.nome)) ultimaPerformance.set(exercicio.nome, registro); })); renderizarBiblioteca(inputBuscaExercicio?.value || ''); } catch (error) { console.warn('Últimas performances não carregadas:', error.message); } }
function equipamentoDo(ex) { const nome = ex.nome.toLowerCase(); if (nome.includes('máquina') || nome.includes('cadeira') || nome.includes('smith') || nome.includes('hack')) return 'Máquina'; if (nome.includes('polia') || nome.includes('cabo')) return 'Polia'; if (nome.includes('halter')) return 'Halteres'; if (nome.includes('barra')) return 'Barra'; return 'Peso corporal'; }
function registrarRecente(nome) { recentesExercicios = [nome, ...recentesExercicios.filter(item => item !== nome)].slice(0, 12); salvarPreferenciasBiblioteca(); }
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
const buscaRotinas = document.getElementById('busca-rotinas');
const inputBuscaRotina = document.getElementById('input-busca-rotina');
const restTimer = document.getElementById('rest-timer');
const restTime = document.getElementById('rest-time');
const restProgress = document.getElementById('rest-progress');

onAuthStateChanged(auth, (user) => {
  if (!user) window.location.href = './login.html';
  else {
    usuarioAtual = user;
    carregarPreferenciasBiblioteca();
    void carregarPreferenciasDaConta();
    void carregarUltimasPerformances();
    carregarRotinasDoBanco();
    renderizarBiblioteca();
  }
});

async function carregarRotinasDoBanco() {
  rotinasList.innerHTML = '<p class="text-sm text-gray-500 text-center mt-4">Carregando seus treinos...</p>';
  try {
    const q = query(collection(db, "treinos"), where("userId", "==", usuarioAtual.uid));
    const querySnapshot = await getDocs(q);
    rotinasReais = [];
    querySnapshot.forEach((doc) => { rotinasReais.push({ id: doc.id, ...doc.data() }); });
    renderRotinas();
    const draft = lerRascunho(usuarioAtual.uid);
    if (draft && rotinasReais.some(r => r.id === draft.rotinaId)) {
      const routine = rotinasReais.find(r => r.id === draft.rotinaId);
      routine.exercicios = draft.exercicios;
      tempoSegundos = draft.tempoSegundos || 0;
      sessaoIniciadaEm = draft.iniciadaEm ? new Date(draft.iniciadaEm) : new Date();
      treinoIniciado = true;
      if (!timerInterval) timerInterval = setInterval(() => { tempoSegundos++; atualizarDisplayTempo(); salvarRascunho(); }, 1000);
      showToast(`Treino em andamento recuperado: ${routine.nome}`, 'success'); abrirRotina(routine.id);
    }
  } catch (error) {
    console.error("Erro ao buscar:", error);
    rotinasList.innerHTML = '<p class="text-center text-sm text-red-400 my-10">Não foi possível carregar suas rotinas.</p>';
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

btnNovaRotina.addEventListener('click', () => { esconderTudo(); viewNovaRotina.classList.remove('hidden'); lucide.createIcons(); });
btnExplorar?.addEventListener('click', () => {
  esconderTudo();
  viewExplorar.classList.remove('hidden');
  viewExplorar.querySelector('.text-center')?.remove();
  if (!document.getElementById('templates-list')) viewExplorar.insertAdjacentHTML('beforeend', `<div id="templates-list" class="space-y-3"><p class="text-sm text-gray-400">Comece com uma estrutura editável.</p>${[['Upper / Lower','4 dias · foco em força e hipertrofia'],['Push Pull Legs','6 dias · divisão clássica'],['Full Body','3 dias · ótimo para iniciantes']].map(([name,description])=>`<button onclick="criarTemplate('${name}')" class="w-full rounded-2xl border border-white/10 bg-card-dark p-4 text-left active:scale-[.98]"><span class="block font-bold">${name}</span><span class="mt-1 block text-xs text-gray-500">${description}</span></button>`).join('')}</div>`);
  lucide.createIcons();
});

// A ação principal é pesquisa nas próprias rotinas, não descoberta de modelos.
btnExplorar?.addEventListener('click', () => {
  esconderTudo();
  viewRotinas.classList.remove('hidden');
  const ficouOculta = buscaRotinas.classList.toggle('hidden');
  if (ficouOculta) {
    inputBuscaRotina.value = '';
    renderRotinas();
  } else {
    inputBuscaRotina.focus();
  }
  lucide.createIcons();
});

inputBuscaRotina?.addEventListener('input', renderRotinas);

if (btnVoltar) {
  btnVoltar.addEventListener('click', async () => { 
    if (treinoIniciado && rotinaAbertaId) {
      const confirmar = await confirmAction({ title: 'Encerrar treino?', message: 'As séries não concluídas desta sessão serão descartadas.', confirmText: 'Encerrar', danger: true });
      if (!confirmar) return; // Se cancelar, não faz nada

      // Reseta os rascunhos da sessão atual no banco para não acumular lixo
      const rotina = rotinasReais.find(r => r.id === rotinaAbertaId);
      if (rotina && rotina.exercicios) {
        rotina.exercicios.forEach(ex => {
          if (ex.series) {
            ex.series.forEach(serie => {
              serie.concluida = false;
              serie.kg = '';
              serie.reps = '';
              // Nota: preservamos 'anteriorKg' e 'anteriorReps' para não perder o histórico passado!
            });
          }
        });

        try {
          // Salva o estado limpo no Firebase para descartar o rascunho incompleto
          await updateDoc(doc(db, "treinos", rotinaAbertaId), { 
            exercicios: rotina.exercicios 
          });
        } catch (error) {
          console.error("Erro ao limpar rascunho do treino:", error);
        }
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
btnVoltarBiblioteca.addEventListener('click', () => { esconderTudo(); viewDetalhe.classList.remove('hidden'); });

btnAddExercicio.addEventListener('click', () => {
  esconderTudo();
  viewBiblioteca.classList.remove('hidden');
});

function atualizarDescanso() {
  const minutos = Math.floor(descansoSegundos / 60);
  const segundos = descansoSegundos % 60;
  restTime.textContent = `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
  restProgress.style.width = `${Math.max(0, (descansoSegundos / descansoTotal) * 100)}%`;
}

function pararDescanso() {
  clearInterval(descansoInterval);
  descansoInterval = null;
  restTimer.classList.add('hidden');
}

function iniciarDescanso(indexExercicio) {
  clearInterval(descansoInterval);
  const rotina = rotinasReais.find(r => r.id === rotinaAbertaId);
  const exercise = rotina?.exercicios?.[indexExercicio] || rotina?.exercicios?.find(ex => ex.series?.some(s => s.concluida));
  descansoSegundos = exercise?.descansoSegundos || 90; descansoTotal = descansoSegundos;
  restTimer.classList.remove('hidden'); atualizarDescanso();
  descansoInterval = setInterval(() => {
    descansoSegundos--; atualizarDescanso();
    if (descansoSegundos <= 0) { pararDescanso(); showToast('Descanso concluído. Vamos para a próxima!', 'success'); }
  }, 1000);
}

document.getElementById('btn-skip-rest')?.addEventListener('click', pararDescanso);
document.getElementById('btn-add-rest')?.addEventListener('click', () => { descansoSegundos += 30; descansoTotal += 30; atualizarDescanso(); });

document.addEventListener('input', (event) => {
  const match = event.target.id?.match(/^(kg|reps|rir)-(\d+)-(\d+)$/);
  if (!match || !rotinaAbertaId) return;
  const [, campo, exIndex, serieIndex] = match;
  const rotina = rotinasReais.find(r => r.id === rotinaAbertaId);
  if (!rotina?.exercicios?.[exIndex]?.series?.[serieIndex]) return;
  rotina.exercicios[exIndex].series[serieIndex][campo] = event.target.value;
  salvarRascunho();
});

function iniciarCronometroGlobal() {
  if (treinoIniciado) return;
  treinoIniciado = true;
  sessaoIniciadaEm = new Date();
  tempoSegundos = 0;
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    tempoSegundos++; salvarRascunho();
    atualizarDisplayTempo();
  }, 1000);
}

function pararCronometro() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  treinoIniciado = false;
  tempoSegundos = 0;
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

function mostrarResumoTreino({ series, volume, exercicios, duracao }) {
  document.getElementById('mol-workout-summary')?.remove();
  const minutos = Math.max(1, Math.round(duracao / 60));
  const modal = document.createElement('div');
  modal.id = 'mol-workout-summary';
  modal.className = 'fixed inset-0 z-[200] flex items-end bg-black/70 p-4 backdrop-blur-sm sm:items-center sm:justify-center';
  modal.innerHTML = `<section class="w-full max-w-sm rounded-3xl border border-neon/30 bg-[#151b17] p-6 text-center animate-slide-up"><div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neon text-black"><i data-lucide="trophy" class="h-7 w-7"></i></div><p class="mt-4 text-xs font-bold uppercase tracking-[.16em] text-neon">Sessão concluída</p><h2 class="mt-1 text-2xl font-extrabold">Mandou bem.</h2><div class="mt-6 grid grid-cols-3 gap-2"><div class="rounded-2xl bg-white/5 p-3"><strong class="block text-lg">${series}</strong><span class="text-[10px] text-gray-400">SÉRIES</span></div><div class="rounded-2xl bg-white/5 p-3"><strong class="block text-lg">${Math.round(volume).toLocaleString('pt-BR')}</strong><span class="text-[10px] text-gray-400">KG</span></div><div class="rounded-2xl bg-white/5 p-3"><strong class="block text-lg">${minutos}m</strong><span class="text-[10px] text-gray-400">DURAÇÃO</span></div></div><p class="mt-4 text-sm text-gray-400">${exercicios} exercícios registrados no seu histórico.</p><button class="mt-6 min-h-12 w-full rounded-2xl bg-neon font-bold text-black active:scale-[.98]" onclick="this.closest('#mol-workout-summary').remove()">Concluído</button></section>`;
  document.body.appendChild(modal); lucide.createIcons();
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
  sheet.innerHTML = `<div class="w-full max-w-md mx-auto rounded-3xl border border-white/10 bg-[#161a17] p-6 animate-slide-up"><div class="mx-auto mb-5 h-1.5 w-11 rounded-full bg-white/20"></div><p class="text-xs font-bold uppercase tracking-[.16em] text-neon">Guia rápido</p><h2 class="mt-1 text-xl font-extrabold">${titulo}</h2><p class="mt-3 text-sm leading-relaxed text-gray-300">${texto}</p><button class="mt-6 min-h-12 w-full rounded-2xl bg-white/10 text-sm font-bold active:bg-white/15" onclick="this.closest('#mol-training-info').remove()">Entendi</button></div>`;
  sheet.addEventListener('click', event => { if (event.target === sheet) sheet.remove(); });
  document.body.appendChild(sheet);
};

function renderRotinas() {
  if (rotinasReais.length === 0) {
    rotinasList.innerHTML = '<p class="text-center text-gray-500 my-10">Você ainda não tem treinos.</p>';
    return;
  }
  const termo = inputBuscaRotina?.value.trim().toLocaleLowerCase('pt-BR') || '';
  const rotinasFiltradas = rotinasReais.filter(rotina => rotina.nome.toLocaleLowerCase('pt-BR').includes(termo));
  if (rotinasFiltradas.length === 0) {
    rotinasList.innerHTML = '<p class="my-10 text-center text-sm text-gray-500">Nenhuma rotina encontrada.</p>';
    return;
  }
  rotinasList.innerHTML = rotinasFiltradas.map(rotina => `
    <div class="bg-card-dark rounded-2xl p-5 border border-white/5 relative mb-4">
      <div class="flex items-start justify-between mb-2">
        <div>
          <h3 class="font-bold text-lg text-white">${escapeHTML(rotina.nome)}</h3>
          <p class="text-xs text-gray-500">${rotina.exercicios ? rotina.exercicios.length : 0} exercícios</p>
        </div>
        <button onclick="deletarRotina('${rotina.id}')" class="text-gray-500 hover:text-red-400 transition-colors p-1" title="Excluir Treino">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </div>

      <div class="mt-4 grid grid-cols-2 gap-3">
        <button onclick="clicarIniciarRotina('${rotina.id}')" class="min-h-12 rounded-xl bg-neon px-3 text-sm font-bold text-black active:scale-[0.98]">Iniciar</button>
        <button onclick="editarRotina('${rotina.id}')" class="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/10 px-3 text-sm font-bold text-gray-200 active:bg-white/5"><i data-lucide="pencil" class="h-4 w-4"></i> Editar</button>
      </div>
      <button onclick="duplicarRotina('${rotina.id}')" class="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 text-xs font-bold text-gray-300 active:bg-white/5"><i data-lucide="copy" class="h-4 w-4"></i> Duplicar rotina</button>
    </div>
  `).join('');
  lucide.createIcons();
}

window.clicarIniciarRotina = (id) => {
  iniciarCronometroGlobal();
  abrirRotina(id);
};

// Editar abre a ficha sem iniciar cronômetro, sessão ou descanso.
window.editarRotina = (id) => {
  pararDescanso();
  abrirRotina(id);
};

window.iniciarTreinoDaEdicao = () => {
  if (!rotinaAbertaId) return;
  const energia = prompt('Check-in rápido — energia de 1 a 5', '3');
  if (energia === null) return;
  const sono = prompt('Sono de 1 a 5', '3');
  const dor = prompt('Dor muscular de 0 a 5', '0');
  checkinPreTreino = { energia: Math.min(5, Math.max(1, Number(energia) || 3)), sono: Math.min(5, Math.max(1, Number(sono) || 3)), dor: Math.min(5, Math.max(0, Number(dor) || 0)) };
  if (checkinPreTreino.energia <= 2 || checkinPreTreino.dor >= 4) showToast('Hoje priorize técnica e reduza carga se necessário.');
  iniciarCronometroGlobal();
  abrirRotina(rotinaAbertaId);
};

window.salvarNomeRotina = async () => {
  const input = document.getElementById('input-editar-nome-rotina');
  const nome = input?.value.trim();
  const rotina = rotinasReais.find(r => r.id === rotinaAbertaId);
  if (!rotina || !nome) return showToast('Digite um nome para a rotina.');
  if (nome === rotina.nome) return;
  try {
    await updateDoc(doc(db, 'treinos', rotinaAbertaId), { nome });
    rotina.nome = nome;
    detalheTitulo.textContent = nome;
    showToast('Nome da rotina atualizado.', 'success');
  } catch (error) {
    console.error(error);
    showToast('Não foi possível salvar o nome.');
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
  if (!usuarioAtual) return showToast('A sessão expirou. Entre novamente.');
  btnSalvarNova.textContent = "Salvando...";
  try {
    const diasSemana = [...routineDays.querySelectorAll('input:checked')].map(input => Number(input.value));
    await addDoc(collection(db, "treinos"), { userId: usuarioAtual.uid, nome: nome, descricao: "Treino Personalizado", diasSemana, exercicios: [], criadoEm: serverTimestamp() });
    inputNomeRotina.value = '';
    routineDays.querySelectorAll('input').forEach(input => input.checked = false);
    await carregarRotinasDoBanco();
    esconderTudo();
    viewRotinas.classList.remove('hidden');
    showToast('Rotina criada com sucesso.', 'success');
  } catch (error) {
    console.error('Erro ao criar rotina:', error);
    showToast(error.code === 'permission-denied' ? 'O Firestore bloqueou a criação. Revise as regras de treinos.' : 'Não foi possível criar a rotina. Tente novamente.');
  } finally { btnSalvarNova.textContent = "Salvar"; }
});

window.criarTemplate = async (nome) => {
  const modelos = {
    'Upper / Lower': [{ nome: 'Supino Reto (Barra)', grupo: 'Peito' }, { nome: 'Remada Curvada (Barra)', grupo: 'Costas' }, { nome: 'Agachamento Goblet com Halter', grupo: 'Pernas' }],
    'Push Pull Legs': [{ nome: 'Supino Inclinado (Halter)', grupo: 'Peito' }, { nome: 'Puxada Alta (Frente / Triângulo)', grupo: 'Costas' }, { nome: 'Leg Press 45° com Pegada Alta e Fechada', grupo: 'Pernas' }],
    'Full Body': [{ nome: 'Agachamento Goblet com Halter', grupo: 'Pernas' }, { nome: 'Supino Reto (Halter)', grupo: 'Peito' }, { nome: 'Remada Curvada (Halter)', grupo: 'Costas' }]
  };
  const exercicios = (modelos[nome] || []).map(ex => ({ ...ex, descansoSegundos: 90, series: Array.from({ length: 3 }, () => ({ tipo: 'N', kg: '', reps: '', rir: '2', anteriorKg: '', anteriorReps: '', concluida: false })) }));
  await addDoc(collection(db, 'treinos'), { userId: usuarioAtual.uid, nome, descricao: 'Modelo Mol editável', exercicios, criadoEm: serverTimestamp() });
  showToast('Modelo criado. Ajuste-o para sua realidade.', 'success'); carregarRotinasDoBanco(); esconderTudo(); viewRotinas.classList.remove('hidden');
};

window.duplicarRotina = async (id) => {
  const origem = rotinasReais.find(r => r.id === id);
  if (!origem) return;
  const exercicios = JSON.parse(JSON.stringify(origem.exercicios || [])).map(ex => ({ ...ex, series: (ex.series || []).map(s => ({ ...s, kg: '', reps: '', concluida: false })) }));
  try { await addDoc(collection(db, 'treinos'), { userId: usuarioAtual.uid, nome: `${origem.nome} (cópia)`, descricao: origem.descricao || '', exercicios, criadoEm: serverTimestamp() }); await carregarRotinasDoBanco(); showToast('Rotina duplicada.', 'success'); }
  catch (error) { console.error(error); showToast('Não foi possível duplicar a rotina.'); }
};

window.escolherExercicio = async (nomeExercicio) => {
  const rotina = rotinasReais.find(r => r.id === rotinaAbertaId);
  if (!rotina) return;

  const catalogo = bibliotecaDeExercicios.find(ex => ex.nome === nomeExercicio);
  const ultimo = ultimaPerformance.get(nomeExercicio);
  const novoExercicio = { nome: nomeExercicio, grupo: catalogo?.grupo || 'Outros', descansoSegundos: 90, notas: '', series: [{ tipo: 'N', kg: '', reps: '', rir: '', anteriorKg: ultimo?.kg ?? '', anteriorReps: ultimo?.reps ?? '', concluida: false }] };
  if (!rotina.exercicios) rotina.exercicios = [];
  rotina.exercicios.push(novoExercicio);
  registrarRecente(nomeExercicio);

  try {
    await updateDoc(doc(db, "treinos", rotinaAbertaId), { exercicios: rotina.exercicios });
    abrirRotina(rotinaAbertaId);
  } catch (error) { console.error(error); }
};

// ---------------------------------------------
// RENDERIZAR BIBLIOTECA DE EXERCÍCIOS (COM BUSCA AO DIGITAR)
// ---------------------------------------------
let filtroMuscular = '';
function grupoDetalhado(exercicio) {
  const nome = exercicio.nome.toLowerCase();
  if (exercicio.grupo === 'Peito' || exercicio.grupo === 'Costas' || exercicio.grupo === 'Ombros' || exercicio.grupo === 'Abdômen') return exercicio.grupo;
  if (exercicio.grupo === 'Bíceps' || exercicio.grupo === 'Tríceps' || exercicio.grupo === 'Antebraço') return 'Braços';
  if (nome.includes('flexora') || nome.includes('stiff') || nome.includes('romeno') || nome.includes('nórdica') || nome.includes('good morning')) return 'Posterior';
  if (nome.includes('glúteo') || nome.includes('pélvica') || nome.includes('abdutora') || nome.includes('abdução') || nome.includes('hip thrust')) return 'Glúteos';
  if (exercicio.grupo === 'Pernas') return 'Quadríceps';
  return exercicio.grupo;
}

function orientacaoDo(exercicio) {
  const n = exercicio.nome.toLowerCase();
  if (n.includes('supino') || n.includes('chest press')) return { execucao: 'Apoie escápulas no banco, mantenha os pés firmes e desça a carga até uma posição confortável no peito. Empurre sem perder a retração dos ombros.', erros: 'Cotovelo excessivamente aberto, quadril saindo do banco, barra quicando no peito e ombros projetados à frente.' };
  if (n.includes('agachamento') || n.includes('leg press') || n.includes('hack')) return { execucao: 'Mantenha o pé inteiro apoiado, joelhos acompanhando a linha dos pés e tronco firme. Desça somente até onde mantém coluna neutra e controle.', erros: 'Joelhos cedendo para dentro, calcanhar levantando, encurtar amplitude por carga alta e perder a lombar no fundo.' };
  if (n.includes('extensora')) return { execucao: 'Ajuste o eixo da máquina ao joelho, mantenha quadril no encosto e estenda com controle. Pause brevemente no topo sem chutar a carga.', erros: 'Tirar o quadril do banco, usar impulso, travar o joelho com força e deixar a carga despencar.' };
  if (n.includes('flexora') || n.includes('stiff') || n.includes('romeno') || n.includes('good morning')) return { execucao: 'Inicie pelo quadril: mantenha a coluna neutra, leve o quadril para trás e sinta alongar o posterior. Suba contraindo glúteos, sem hiperestender a lombar.', erros: 'Arredondar a lombar, dobrar demais o joelho no stiff, transformar o movimento em agachamento e usar balanço.' };
  if (n.includes('pélvica') || n.includes('hip thrust') || n.includes('glute bridge')) return { execucao: 'Mantenha costelas baixas, queixo levemente recolhido e empurre o chão pelos calcanhares. Termine com quadril neutro e glúteos contraídos.', erros: 'Hiperestender a lombar no topo, abrir os joelhos sem controle, pés muito distantes e descer rápido demais.' };
  if (n.includes('puxada') || n.includes('pulldown') || n.includes('barra fixa')) return { execucao: 'Comece deprimindo as escápulas e puxe os cotovelos em direção às costelas. Mantenha peito alto sem jogar o tronco para trás.', erros: 'Puxar só com bíceps, elevar ombros, usar balanço do corpo e encurtar a volta da carga.' };
  if (n.includes('remada')) return { execucao: 'Trave o tronco, inicie o movimento pelas escápulas e leve os cotovelos para trás. Pause perto do fim da puxada e retorne devagar.', erros: 'Balançar o tronco, encolher os ombros, puxar para o pescoço e perder a posição lombar.' };
  if (n.includes('lateral') || n.includes('ombro') || n.includes('desenvolvimento')) return { execucao: 'Mantenha costelas controladas e suba a carga no plano da escápula. Use amplitude confortável e cadência constante.', erros: 'Roubar com lombar, encolher trapézio, usar impulso e descer sem controle.' };
  if (n.includes('rosca')) return { execucao: 'Mantenha cotovelos estáveis e punhos neutros. Suba contraindo bíceps e desça em dois a três segundos.', erros: 'Balançar o tronco, levar cotovelos à frente demais, dobrar punhos e encurtar a descida.' };
  if (n.includes('tríceps') || n.includes('francês') || n.includes('testa')) return { execucao: 'Estabilize ombros e cotovelos; mova somente o antebraço. Estenda até contrair o tríceps sem perder o controle.', erros: 'Abrir cotovelos, usar ombro para empurrar, compensar com lombar e travar articulações com força.' };
  return { execucao: 'Ajuste o equipamento ao seu corpo, faça repetições lentas e mantenha amplitude que permita controle e postura estável.', erros: 'Aumentar a carga antes de dominar a técnica, usar impulso, encurtar a fase de retorno e ignorar desconforto articular.' };
}

window.abrirDetalheExercicio = (nome) => {
  const exercicio = bibliotecaDeExercicios.find(item => item.nome === nome); if (!exercicio) return;
  const grupo = grupoDetalhado(exercicio); const equipamento = equipamentoDo(exercicio);
  const orientacao = orientacaoDo(exercicio);
  const historico = (historicoPerformance.get(nome) || []).slice(0, 6).reverse();
  const cargas = historico.map(item => item.kg); const maxCarga = Math.max(...cargas, 1);
  const pontos = cargas.map((carga, index) => `${index * (100 / Math.max(cargas.length - 1, 1))},${40 - (carga / maxCarga) * 34}`).join(' ');
  const melhor = historico.reduce((max, item) => Math.max(max, item.kg * (1 + item.reps / 30)), 0);
  const substitutos = bibliotecaDeExercicios.filter(item => item.nome !== nome && grupoDetalhado(item) === grupo).slice(0, 3);
  document.getElementById('exercise-detail')?.remove();
  const modal = document.createElement('div'); modal.id = 'exercise-detail'; modal.className = 'fixed inset-0 z-[210] flex items-end bg-black/70 p-4 backdrop-blur-sm';
  modal.innerHTML = `<section class="mx-auto w-full max-w-md rounded-3xl bg-[#161a17] p-6"><div class="mx-auto h-1.5 w-11 rounded-full bg-white/20"></div><div class="mt-5 flex gap-4"><img src="${exerciseFigure}" alt="" class="h-20 w-16 rounded-2xl bg-white/5 p-2"><div><p class="text-xs font-bold uppercase tracking-wider text-neon">${grupo}</p><h2 class="mt-1 text-xl font-extrabold">${escapeHTML(nome)}</h2><p class="mt-1 text-sm text-gray-400">${equipamento}</p></div></div>${historico.length ? `<section class="mt-5 rounded-2xl bg-white/[.03] p-4"><p class="text-xs font-bold uppercase tracking-wider text-gray-400">Evolução recente</p><p class="mt-1 text-sm font-bold text-neon">e1RM estimado: ${melhor.toFixed(1)} kg</p><svg viewBox="0 0 100 44" class="mt-3 h-16 w-full"><polyline points="${pontos}" fill="none" stroke="#1E7349" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg><p class="text-xs text-gray-500">${historico.map(item => `${item.kg} kg × ${item.reps}`).join(' · ')}</p></section>` : ''}<div class="mt-6 space-y-4 text-sm"><div><strong>Execução</strong><p class="mt-1 text-gray-400">${orientacao.execucao}</p></div><div><strong>Erros para evitar</strong><p class="mt-1 text-gray-400">${orientacao.erros}</p></div><div><strong>Substituições</strong><p class="mt-1 text-gray-400">${substitutos.map(item => escapeHTML(item.nome)).join(' · ') || 'Sem substituições cadastradas.'}</p></div></div><div class="mt-6 grid grid-cols-2 gap-3"><button data-close class="min-h-12 rounded-2xl bg-white/5 font-bold text-gray-300">Fechar</button><button data-add class="min-h-12 rounded-2xl bg-neon font-bold text-black">Adicionar</button></div></section>`;
  modal.onclick = event => { if (event.target === modal) modal.remove(); }; document.body.appendChild(modal);
  modal.querySelector('[data-close]').onclick = () => modal.remove(); modal.querySelector('[data-add]').onclick = () => { modal.remove(); window.escolherExercicio(nome); };
};

function renderizarBiblioteca(filtro = '') {
  if (!bibliotecaList) return;

  const termo = filtro.toLowerCase().trim();
  const sinonimos = { peitoral: 'peito', chest: 'peito', dorsal: 'costas', lombar: 'costas', biceps: 'bíceps', triceps: 'tríceps', perna: 'quadríceps' };
  const termoExpandido = sinonimos[termo] || termo;
  const exerciciosFiltrados = bibliotecaDeExercicios.filter(ex =>
    (ex.nome.toLowerCase().includes(termo) || ex.grupo.toLowerCase().includes(termo) || grupoDetalhado(ex).toLowerCase().includes(termoExpandido)) &&
    (!filtroMuscular || (filtroMuscular === 'Favoritos' ? favoritosExercicios.includes(ex.nome) : filtroMuscular === 'Recentes' ? recentesExercicios.includes(ex.nome) : grupoDetalhado(ex) === filtroMuscular || equipamentoDo(ex) === filtroMuscular))
  );

  if (exerciciosFiltrados.length === 0) {
    bibliotecaList.innerHTML = '<p class="text-center text-gray-500 my-10 text-sm">Nenhum exercício encontrado.</p>';
    return;
  }

  bibliotecaList.innerHTML = exerciciosFiltrados.map(ex => `
    <div class="flex items-center justify-between bg-card-dark p-3 rounded-xl border border-white/5 active:bg-white/5 transition-colors mb-2">
      <img src="${exerciseFigure}" alt="" class="mr-3 h-12 w-10 shrink-0 rounded-lg bg-white/5 p-1">
      <div class="min-w-0 flex-1 text-left">
        <p class="font-bold text-sm text-white">${ex.nome}</p>
        <p class="text-xs text-gray-500">${grupoDetalhado(ex)} · ${ex.grupo}</p>
        ${ultimaPerformance.has(ex.nome) ? `<p class="mt-1 text-xs font-semibold text-neon">Último: ${ultimaPerformance.get(ex.nome).kg} kg × ${ultimaPerformance.get(ex.nome).reps}</p>` : '<p class="mt-1 text-xs text-gray-600">Sem histórico ainda</p>'}
      </div>
      <button type="button" onclick="alternarFavoritoExercicio('${ex.nome}')" aria-label="Favoritar ${ex.nome}" class="ml-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 active:bg-white/10 ${favoritosExercicios.includes(ex.nome) ? 'text-neon' : 'text-gray-500'}"><i data-lucide="star" class="h-5 w-5 ${favoritosExercicios.includes(ex.nome) ? 'fill-current' : ''}"></i></button>
      <button type="button" onclick="abrirDetalheExercicio('${ex.nome}')" aria-label="Ver detalhes de ${ex.nome}" class="ml-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-gray-400 active:bg-white/10"><i data-lucide="info" class="h-5 w-5"></i></button>
      <button type="button" onclick="escolherExercicio('${ex.nome}')" aria-label="Adicionar ${ex.nome}" class="ml-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neon/15 text-neon active:bg-neon active:text-black"><i data-lucide="plus" class="h-5 w-5"></i></button>
    </div>
  `).join('');
  
  lucide.createIcons();
}

// Ouvinte do input de busca para filtrar em tempo real
if (inputBuscaExercicio) {
  inputBuscaExercicio.addEventListener('input', (e) => {
    renderizarBiblioteca(e.target.value);
  });
}

document.querySelectorAll('[data-exercise-filter]').forEach(button => button.addEventListener('click', () => {
  filtroMuscular = button.dataset.exerciseFilter || '';
  document.querySelectorAll('[data-exercise-filter]').forEach(item => {
    const ativo = item === button;
    item.classList.toggle('bg-neon', ativo); item.classList.toggle('text-black', ativo);
    item.classList.toggle('bg-white/5', !ativo); item.classList.toggle('text-gray-300', !ativo);
  });
  renderizarBiblioteca(inputBuscaExercicio?.value || '');
}));

function prepararAtalhosBiblioteca() {
  if (document.getElementById('library-shortcuts')) return;
  bibliotecaList.insertAdjacentHTML('beforebegin', '<div id="library-shortcuts" class="mb-4 flex gap-2 overflow-x-auto pb-1"><button data-library-filter="Favoritos" class="rounded-full bg-white/5 px-4 py-2 text-xs font-bold text-gray-300">Favoritos</button><button data-library-filter="Recentes" class="rounded-full bg-white/5 px-4 py-2 text-xs font-bold text-gray-300">Recentes</button><button data-library-filter="Máquina" class="rounded-full bg-white/5 px-4 py-2 text-xs font-bold text-gray-300">Máquinas</button><button data-library-filter="Polia" class="rounded-full bg-white/5 px-4 py-2 text-xs font-bold text-gray-300">Polia</button><button id="create-custom-exercise" class="rounded-full bg-neon/15 px-4 py-2 text-xs font-bold text-neon">+ Personalizado</button></div>');
  document.querySelectorAll('[data-library-filter]').forEach(button => button.onclick = () => { filtroMuscular = button.dataset.libraryFilter; renderizarBiblioteca(inputBuscaExercicio?.value || ''); });
  document.getElementById('create-custom-exercise').onclick = () => {
    const nome = prompt('Nome do exercício'); if (!nome?.trim()) return;
    const grupo = prompt('Grupo muscular', 'Outros')?.trim() || 'Outros';
    const novo = { nome: nome.trim(), grupo, personalizado: true };
    exerciciosPersonalizados.push(novo); bibliotecaDeExercicios.push(novo); salvarPreferenciasBiblioteca(); renderizarBiblioteca(inputBuscaExercicio?.value || ''); showToast('Exercício personalizado criado.', 'success');
  };
}

// Garantir que a busca limpa ao abrir a tela de adicionar exercício
if (btnAddExercicio) {
  btnAddExercicio.addEventListener('click', () => {
    esconderTudo();
    prepararAtalhosBiblioteca();
    if (inputBuscaExercicio) inputBuscaExercicio.value = '';
    renderizarBiblioteca('');
    viewBiblioteca.classList.remove('hidden');
    lucide.createIcons();
  });
}

window.abrirRotina = (id) => {
  rotinaAbertaId = id;
  const rotina = rotinasReais.find(r => r.id === id);
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
      btnConcluir.className = "px-4 py-2 rounded-xl text-xs font-bold bg-neon text-black transition-all active:scale-95 shadow-lg shadow-neon/20 cursor-pointer";
      btnConcluir.textContent = 'Finalizar';
    } else {
      btnConcluir.classList.remove('hidden');
      btnConcluir.className = "px-4 py-2 rounded-xl text-xs font-bold border border-neon/50 text-neon transition-all active:scale-95 opacity-50 cursor-not-allowed";
      btnConcluir.textContent = totalSeries ? `Faltam ${totalSeries - seriesFeitas}` : 'Finalizar';
    }
  }

  const seriesPlanejadas = (rotina.exercicios || []).reduce((total, ex) => total + (ex.series || []).length, 0);
  const minutosEstimados = Math.max(15, Math.round(seriesPlanejadas * 3.25));
  const painelMetricasHTML = treinoIniciado ? `
    <div class="mb-4 overflow-hidden rounded-2xl border border-white/5 bg-card-dark p-3 text-center"><div class="grid grid-cols-3 gap-2">
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
    </div><div class="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div class="h-full rounded-full bg-neon transition-all duration-300" style="width:${totalSeries ? (seriesFeitas / totalSeries) * 100 : 0}%"></div></div><p class="mt-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500">Progresso da sessão</p></div>
  ` : `<div class="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[.03] p-4"><div><p class="text-sm font-bold">Modo edição</p><p class="mt-1 text-xs text-gray-400">${seriesPlanejadas} séries · cerca de ${minutosEstimados} min</p></div><button onclick="iniciarTreinoDaEdicao()" class="min-h-11 shrink-0 rounded-xl bg-neon px-3 text-xs font-bold text-black active:scale-[.98]">Iniciar</button></div>`;
  const editorNomeHTML = treinoIniciado ? '' : `<div class="mb-4 rounded-2xl border border-white/10 bg-card-dark p-4"><label for="input-editar-nome-rotina" class="text-xs font-bold uppercase tracking-wider text-gray-400">Nome da rotina</label><div class="mt-2 flex gap-2"><input id="input-editar-nome-rotina" type="text" class="min-w-0 flex-1 rounded-xl border border-white/10 bg-card-dark-2 px-3 py-3 text-sm font-bold text-white outline-none focus:border-neon"><button onclick="salvarNomeRotina()" class="min-h-11 rounded-xl bg-neon px-4 text-sm font-bold text-black active:scale-[.98]">Salvar</button></div></div>`;
  
  if (!rotina.exercicios || rotina.exercicios.length === 0) {
    exerciciosList.innerHTML = `
      ${painelMetricasHTML}
      ${editorNomeHTML}
      <p class="text-center text-sm text-gray-500 my-10">Nenhum exercício. Adicione abaixo!</p>
    `;
  } else {
    let exerciciosHtml = rotina.exercicios.map((ex, indexEx) => {
      let contadorNormal = 0; 

      return `
      <div class="bg-card-dark rounded-xl pt-4 pb-2 px-4 border border-white/5 mb-4">
        <div class="flex items-center justify-between mb-4">
          <div><h4 class="font-bold text-sm text-neon">${escapeHTML(ex.nome)}</h4><p class="mt-1 text-[11px] text-gray-500">Meta: ${ex.repsMin || 8}–${ex.repsMax || 12} reps · RIR ${ex.rirAlvo ?? 2} · ${ex.descansoSegundos || 90}s</p></div>
          <div class="flex gap-1"><button onclick="moverExercicio(${indexEx}, -1)" aria-label="Mover para cima" class="h-10 w-10 rounded-xl text-gray-400 active:bg-white/10"><i data-lucide="chevron-up" class="w-5 h-5"></i></button><button onclick="moverExercicio(${indexEx}, 1)" aria-label="Mover para baixo" class="h-10 w-10 rounded-xl text-gray-400 active:bg-white/10"><i data-lucide="chevron-down" class="w-5 h-5"></i></button><button onclick="excluirExercicio(${indexEx})" class="h-10 w-10 rounded-xl text-gray-500 active:bg-red-500/10 active:text-red-400"><i data-lucide="trash-2" class="w-4 h-4"></i></button></div>
        </div>
        <details class="mb-4 rounded-xl bg-white/[.03] p-3"><summary class="cursor-pointer text-xs font-bold text-gray-400">Ajustar metas e progressão</summary><div class="mt-3 grid grid-cols-4 gap-2 text-center"><label class="text-[10px] text-gray-500">REPS mín.<input onchange="atualizarMetaExercicio(${indexEx}, 'repsMin', this.value)" type="number" value="${ex.repsMin || 8}" class="mt-1 w-full rounded-lg bg-card-dark-2 p-2 text-center text-sm text-white"></label><label class="text-[10px] text-gray-500">REPS máx.<input onchange="atualizarMetaExercicio(${indexEx}, 'repsMax', this.value)" type="number" value="${ex.repsMax || 12}" class="mt-1 w-full rounded-lg bg-card-dark-2 p-2 text-center text-sm text-white"></label><label class="text-[10px] text-gray-500">RIR alvo<input onchange="atualizarMetaExercicio(${indexEx}, 'rirAlvo', this.value)" type="number" value="${ex.rirAlvo ?? 2}" class="mt-1 w-full rounded-lg bg-card-dark-2 p-2 text-center text-sm text-white"></label><label class="text-[10px] text-gray-500">DESC. (s)<input onchange="atualizarMetaExercicio(${indexEx}, 'descansoSegundos', this.value)" type="number" value="${ex.descansoSegundos || 90}" class="mt-1 w-full rounded-lg bg-card-dark-2 p-2 text-center text-sm text-white"></label></div></details>
        
        <div class="flex items-center gap-1 mb-2 px-1"><div class="grid flex-1 grid-cols-[1.2fr_2.4fr_1.7fr_1.7fr_1.2fr_1.2fr] gap-1 text-[10px] text-gray-500 font-semibold text-center tracking-wider items-center">
          <button onclick="mostrarInfoTreino('serie')" class="min-h-8 rounded-md active:bg-white/10">SÉRIE</button>
          <button onclick="mostrarInfoTreino('anterior')" class="min-h-8 rounded-md active:bg-white/10">ANTERIOR</button>
          <button onclick="mostrarInfoTreino('kg')" class="min-h-8 rounded-md active:bg-white/10">KG</button>
          <button onclick="mostrarInfoTreino('reps')" class="min-h-8 rounded-md active:bg-white/10">REPS</button>
          <button onclick="mostrarInfoTreino('rir')" class="min-h-8 rounded-md active:bg-white/10">RIR</button>
          <button onclick="mostrarInfoTreino('check')" aria-label="O que é concluir série" class="min-h-8 rounded-md active:bg-white/10"><i data-lucide="check" class="w-3 h-3 mx-auto"></i></button>
        </div><div class="w-8 shrink-0"></div></div>

        <div class="space-y-1">
          ${ex.series.map((serie, indexSerie) => {
            let label = '';
            let corFundo = 'bg-card-dark-2 text-white'; 
            
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

            const textoAnterior = (serie.anteriorKg && serie.anteriorReps) ? `${serie.anteriorKg}kg x ${serie.anteriorReps}` : '-';
            
            const bgLinha = serie.concluida ? 'bg-neon/10' : 'bg-card-dark-2/30';
            const bgBotaoCheck = serie.concluida ? 'bg-neon text-black' : 'bg-card-dark-2 border border-white/10 text-transparent';
            const bgInput = serie.concluida ? 'bg-transparent text-white' : 'bg-card-dark-2 text-white';

            return `
            <div class="relative flex items-center gap-1 mb-1">
              <div class="flex-1 ${bgLinha} grid items-center grid-cols-[1.2fr_2.4fr_1.7fr_1.7fr_1.2fr_1.2fr] gap-1 py-1.5 px-1 rounded transition-colors">
                
                <div class="w-7 h-7 mx-auto rounded flex items-center justify-center text-xs font-bold cursor-pointer transition-colors ${corFundo}" 
                     onclick="abrirModalTipoSerie(${indexEx}, ${indexSerie})">
                  ${label}
                </div>
                
                <button onclick="copiarAnterior(${indexEx}, ${indexSerie})" class="min-w-0 text-center text-gray-400 text-[11px] font-medium flex min-h-10 w-full items-center justify-center rounded-lg active:bg-white/10" aria-label="Copiar carga anterior">
                  <span>${textoAnterior}</span>
                </button>
                
                <input type="number" id="kg-${indexEx}-${indexSerie}" placeholder="-" value="${serie.kg || ''}" class="${bgInput} w-full text-center py-1.5 rounded text-sm font-semibold outline-none focus:border-neon border border-transparent transition-colors">
                <input type="number" id="reps-${indexEx}-${indexSerie}" placeholder="-" value="${serie.reps || ''}" class="${bgInput} w-full text-center py-1.5 rounded text-sm font-semibold outline-none focus:border-neon border border-transparent transition-colors">
                <input type="number" min="0" max="10" id="rir-${indexEx}-${indexSerie}" placeholder="-" value="${serie.rir || ''}" class="${bgInput} w-full text-center py-1.5 rounded text-sm font-semibold outline-none focus:border-neon border border-transparent transition-colors">
                
                <button onclick="concluirSerie(${indexEx}, ${indexSerie})" aria-label="Concluir série ${label}" class="h-11 w-11 mx-auto rounded-xl ${bgBotaoCheck} flex items-center justify-center transition-colors active:scale-95">
                  <i data-lucide="check" class="w-4 h-4 ${serie.concluida ? 'text-black' : 'text-gray-600'}"></i>
                </button>
              </div>


              <button onclick="excluirSerie(${indexEx}, ${indexSerie})" aria-label="Excluir série" class="flex h-11 w-9 items-center justify-center rounded-xl text-gray-600 active:bg-red-500/10 active:text-red-400" title="Excluir série">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            </div>
          `}).join('')}
        </div>

        <button onclick="adicionarSerie(${indexEx})" class="w-full text-center py-3 mt-2 text-xs font-semibold text-gray-500 hover:text-white transition-colors flex items-center justify-center gap-1">
          <i data-lucide="plus" class="w-3 h-3"></i> Adicionar Série
        </button>
      </div>
    `}).join('');

    exerciciosList.innerHTML = painelMetricasHTML + editorNomeHTML + exerciciosHtml;
  }
  const inputEditarNome = document.getElementById('input-editar-nome-rotina');
  if (inputEditarNome) inputEditarNome.value = rotina.nome;
  
  esconderTudo();
  viewDetalhe.classList.remove('hidden');
  lucide.createIcons();
  atualizarDisplayTempo();
};

window.atualizarMetaExercicio = async (indexEx, campo, valor) => {
  const rotina = rotinasReais.find(r => r.id === rotinaAbertaId);
  const numero = Number(valor);
  if (!Number.isFinite(numero) || numero < 0) return;
  rotina.exercicios[indexEx][campo] = numero;
  salvarRascunho();
  try { await updateDoc(doc(db, 'treinos', rotinaAbertaId), { exercicios: rotina.exercicios }); showToast('Meta atualizada.', 'success'); }
  catch (error) { console.error(error); showToast('Não foi possível salvar a meta.'); }
};

window.copiarAnterior = (indexEx, indexSerie) => {
  const serie = rotinasReais.find(r => r.id === rotinaAbertaId)?.exercicios[indexEx]?.series[indexSerie];
  if (!serie?.anteriorKg || !serie?.anteriorReps) return showToast('Ainda não há carga anterior para copiar.');
  const kg = document.getElementById(`kg-${indexEx}-${indexSerie}`);
  const reps = document.getElementById(`reps-${indexEx}-${indexSerie}`);
  kg.value = serie.anteriorKg; reps.value = serie.anteriorReps;
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

  const inputKg = document.getElementById(`kg-${indexEx}-${indexSerie}`).value.trim();
  const inputReps = document.getElementById(`reps-${indexEx}-${indexSerie}`).value.trim();
  const inputRir = document.getElementById(`rir-${indexEx}-${indexSerie}`).value.trim();

  // Se a série JÁ ESTÁ concluída, permitir desmarcar livremente
  if (serie.concluida) {
    serie.concluida = false;
  } else {
    // Se NÃO está concluída, exige preenchimento obrigatório de KG e REPS
    if (!inputKg || !inputReps || parseFloat(inputKg) <= 0 || parseFloat(inputReps) <= 0) {
      showToast('Preencha peso e repetições antes de concluir a série.');
      return; // Interrompe e não deixa marcar o check
    }

    serie.concluida = true;
    serie.kg = inputKg;
    serie.reps = inputReps;
    serie.rir = inputRir;
    serie.anteriorKg = inputKg;
    serie.anteriorReps = inputReps;
  }

  try {
    await updateDoc(doc(db, "treinos", rotinaAbertaId), { exercicios: rotina.exercicios });
    abrirRotina(rotinaAbertaId);
    salvarRascunho();
    if (serie.concluida) iniciarDescanso(indexEx);
  } catch (error) { console.error(error); }
};

// ---------------------------------------------
// REQUISITO 2 & 3: SALVAMENTO COM RESET DE CHECKS E HISTÓRICO LIMPO PARA A PRÓXIMA SEMANA
// ---------------------------------------------
window.finalizarEConcluirTreino = async () => {
  if (finalizandoTreino) return;
  const rotina = rotinasReais.find(r => r.id === rotinaAbertaId);
  if (!rotina || !rotina.exercicios) return;

  // Verifica se 100% das séries estão concluídas antes de salvar
  let totalSeries = 0;
  let seriesFeitas = 0;

  rotina.exercicios.forEach(ex => {
    if (ex.series) {
      ex.series.forEach(s => {
        totalSeries++;
        if (s.concluida) seriesFeitas++;
      });
    }
  });

  if (totalSeries === 0 || seriesFeitas < totalSeries) {
    showToast('Conclua todas as séries antes de finalizar.');
    return;
  }
  finalizandoTreino = true;
  const btnFinalizar = document.getElementById('btn-concluir-treino');
  if (btnFinalizar) { btnFinalizar.disabled = true; btnFinalizar.textContent = 'Salvando...'; }

  const sessaoConcluida = JSON.parse(JSON.stringify(rotina.exercicios));
  const resumoVolume = sessaoConcluida.reduce((total, ex) => total + ex.series.reduce((sum, serie) => sum + ((Number(serie.kg) || 0) * (Number(serie.reps) || 0)), 0), 0);
  const duracaoConcluida = tempoSegundos;

  // Atualiza os recordes (anteriorKg e anteriorReps) e limpa o check/campos para a próxima semana
  rotina.exercicios.forEach((ex, indexEx) => {
    if (ex.series) {
      ex.series.forEach((serie, indexSerie) => {
        const inputKg = document.getElementById(`kg-${indexEx}-${indexSerie}`);
        const inputReps = document.getElementById(`reps-${indexEx}-${indexSerie}`);
        
        if (inputKg && inputReps) {
          const valKg = inputKg.value.trim();
          const valReps = inputReps.value.trim();
          
          if (valKg && valReps) {
            serie.anteriorKg = valKg;
            serie.anteriorReps = valReps;
          }
        }
        
        // REQUISITO 3: Zera os inputs e desmarca o check para o próximo treino da semana seguinte
        serie.concluida = false;
        serie.kg = '';
        serie.reps = '';
      });
    }
  });

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
      exercicios: rotina.exercicios,
      ultimoTreinoEm: serverTimestamp() 
    });
    await batch.commit();

    limparRascunho();
    pararCronometro();
    pararDescanso();
    mostrarResumoTreino({ series: totalSeries, volume: resumoVolume, exercicios: sessaoConcluida.length, duracao: duracaoConcluida });
    
    esconderTudo();
    viewRotinas.classList.remove('hidden');
    carregarRotinasDoBanco();
  } catch (error) {
    console.error("Erro ao salvar treino:", error);
    showToast('Não foi possível concluir o treino.');
  } finally {
    finalizandoTreino = false;
    if (btnFinalizar) btnFinalizar.disabled = false;
  }
};

window.adicionarSerie = async (indexEx) => {
  const rotina = rotinasReais.find(r => r.id === rotinaAbertaId);
  rotina.exercicios[indexEx].series.push({ tipo: 'N', kg: '', reps: '', concluida: false }); 

  try {
    await updateDoc(doc(db, "treinos", rotinaAbertaId), { exercicios: rotina.exercicios });
    abrirRotina(rotinaAbertaId);
  } catch (error) { console.error(error); }
};

window.excluirSerie = async (indexEx, indexSerie) => {
  const rotina = rotinasReais.find(r => r.id === rotinaAbertaId);
  rotina.exercicios[indexEx].series.splice(indexSerie, 1); 

  if (rotina.exercicios[indexEx].series.length === 0) {
    rotina.exercicios.splice(indexEx, 1);
  }

  try {
    await updateDoc(doc(db, "treinos", rotinaAbertaId), { exercicios: rotina.exercicios });
    abrirRotina(rotinaAbertaId);
  } catch (error) { console.error(error); }
};

window.moverExercicio = async (indexEx, direcao) => {
  const rotina = rotinasReais.find(r => r.id === rotinaAbertaId);
  const destino = indexEx + direcao;
  if (!rotina || destino < 0 || destino >= rotina.exercicios.length) return;
  [rotina.exercicios[indexEx], rotina.exercicios[destino]] = [rotina.exercicios[destino], rotina.exercicios[indexEx]];
  try { await updateDoc(doc(db, 'treinos', rotinaAbertaId), { exercicios: rotina.exercicios }); abrirRotina(rotinaAbertaId); }
  catch (error) { console.error(error); showToast('Não foi possível reordenar o exercício.'); }
};

window.excluirExercicio = async (indexEx) => {
  const rotina = rotinasReais.find(r => r.id === rotinaAbertaId);
  rotina.exercicios.splice(indexEx, 1);

  try {
    await updateDoc(doc(db, "treinos", rotinaAbertaId), { exercicios: rotina.exercicios });
    abrirRotina(rotinaAbertaId);
  } catch (error) { console.error(error); }
};

const modalTipoSerie = document.getElementById('modal-tipo-serie');
const modalTipoSerieContent = document.getElementById('modal-tipo-serie-content');
let editandoSerie = { ex: null, serie: null }; 

window.abrirModalTipoSerie = (indexEx, indexSerie) => {
  editandoSerie = { ex: indexEx, serie: indexSerie };
  modalTipoSerie.classList.remove('hidden');
  setTimeout(() => {
    modalTipoSerie.classList.remove('opacity-0');
    modalTipoSerieContent.classList.remove('translate-y-full');
  }, 10);
};

window.mudarTipoSerie = async (novoTipo) => {
  const rotina = rotinasReais.find(r => r.id === rotinaAbertaId);
  rotina.exercicios[editandoSerie.ex].series[editandoSerie.serie].tipo = novoTipo;

  modalTipoSerie.classList.add('opacity-0');
  modalTipoSerieContent.classList.add('translate-y-full');
  setTimeout(() => modalTipoSerie.classList.add('hidden'), 300);

  try {
    await updateDoc(doc(db, "treinos", rotinaAbertaId), { exercicios: rotina.exercicios });
    abrirRotina(rotinaAbertaId); 
  } catch (error) { console.error(error); }
};

window.removerSerieAberta = () => {
  excluirSerie(editandoSerie.ex, editandoSerie.serie);
  modalTipoSerie.classList.add('opacity-0');
  modalTipoSerieContent.classList.add('translate-y-full');
  setTimeout(() => modalTipoSerie.classList.add('hidden'), 300);
};

modalTipoSerie.addEventListener('click', (e) => {
  if (e.target === modalTipoSerie) {
    modalTipoSerie.classList.add('opacity-0');
    modalTipoSerieContent.classList.add('translate-y-full');
    setTimeout(() => modalTipoSerie.classList.add('hidden'), 300);
  }
});

lucide.createIcons();
