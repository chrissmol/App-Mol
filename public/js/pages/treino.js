// js/pages/treino.js
import { auth, db } from '../config/firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, addDoc, getDocs, query, where, serverTimestamp, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let usuarioAtual = null;
let rotinasReais = []; 
let rotinaAbertaId = null; 

let tempoSegundos = 0;
let timerInterval = null;
let treinoIniciado = false;

import { bibliotecaDeExercicios } from '../data/exercicios-data.js';

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

const btnNovaRotina = document.getElementById('btn-nova-rotina');
const btnExplorar = document.getElementById('btn-explorar');
const btnVoltar = document.getElementById('btn-voltar');
const btnVoltarNova = document.getElementById('btn-voltar-nova');
const btnVoltarExplorar = document.getElementById('btn-voltar-explorar');
const btnVoltarBiblioteca = document.getElementById('btn-voltar-biblioteca');
const btnSalvarNova = document.getElementById('btn-salvar-nova');
const btnAddExercicio = document.getElementById('btn-add-exercicio');
const inputBuscaExercicio = document.getElementById('input-busca-exercicio');

onAuthStateChanged(auth, (user) => {
  if (!user) window.location.href = './login.html';
  else {
    usuarioAtual = user;
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
  } catch (error) {
    console.error("Erro ao buscar:", error);
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
btnExplorar.addEventListener('click', () => { esconderTudo(); viewExplorar.classList.remove('hidden'); lucide.createIcons(); });

if (btnVoltar) {
  btnVoltar.addEventListener('click', async () => { 
    if (rotinaAbertaId) {
      const confirmar = confirm("Tem certeza? Você vai sair e o progresso não salvo desta sessão será descartado.");
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

    pararCronometro();
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

function iniciarCronometroGlobal() {
  if (treinoIniciado) return;
  treinoIniciado = true;
  tempoSegundos = 0;
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    tempoSegundos++;
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

function renderRotinas() {
  if (rotinasReais.length === 0) {
    rotinasList.innerHTML = '<p class="text-center text-gray-500 my-10">Você ainda não tem treinos.</p>';
    return;
  }
  rotinasList.innerHTML = rotinasReais.map(rotina => `
    <div class="bg-card-dark rounded-2xl p-5 border border-white/5 relative mb-4">
      <div class="flex items-start justify-between mb-2">
        <div>
          <h3 class="font-bold text-lg text-white">${rotina.nome}</h3>
          <p class="text-xs text-gray-500">${rotina.exercicios ? rotina.exercicios.length : 0} exercícios</p>
        </div>
        <button onclick="deletarRotina('${rotina.id}')" class="text-gray-500 hover:text-red-400 transition-colors p-1" title="Excluir Treino">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </div>

      <button onclick="clicarIniciarRotina('${rotina.id}')" class="w-full bg-neon text-black font-bold py-2.5 rounded-xl text-sm active:scale-[0.98] transition-transform mt-3">
        Iniciar Rotina
      </button>
    </div>
  `).join('');
  lucide.createIcons();
}

window.clicarIniciarRotina = (id) => {
  iniciarCronometroGlobal();
  abrirRotina(id);
};

window.deletarRotina = async (id) => {
  if (confirm("Tem certeza que deseja excluir esta rotina de treino?")) {
    try {
      await deleteDoc(doc(db, "treinos", id));
      carregarRotinasDoBanco();
    } catch (error) {
      console.error("Erro ao deletar treino:", error);
      alert("Não foi possível excluir o treino.");
    }
  }
};

btnSalvarNova.addEventListener('click', async () => {
  const nome = inputNomeRotina.value.trim();
  if (!nome) return;
  btnSalvarNova.textContent = "Salvando...";
  try {
    await addDoc(collection(db, "treinos"), { userId: usuarioAtual.uid, nome: nome, descricao: "Treino Personalizado", exercicios: [], criadoEm: serverTimestamp() });
    inputNomeRotina.value = '';
    btnSalvarNova.textContent = "Salvar";
    carregarRotinasDoBanco();
    esconderTudo();
    viewRotinas.classList.remove('hidden');
  } catch (error) { console.error(error); }
});

window.escolherExercicio = async (nomeExercicio) => {
  const rotina = rotinasReais.find(r => r.id === rotinaAbertaId);
  if (!rotina) return;

  const novoExercicio = { nome: nomeExercicio, series: [{ tipo: 'N', kg: '', reps: '', anteriorKg: '', anteriorReps: '', concluida: false }] };
  if (!rotina.exercicios) rotina.exercicios = [];
  rotina.exercicios.push(novoExercicio);

  try {
    await updateDoc(doc(db, "treinos", rotinaAbertaId), { exercicios: rotina.exercicios });
    abrirRotina(rotinaAbertaId);
  } catch (error) { console.error(error); }
};

// ---------------------------------------------
// RENDERIZAR BIBLIOTECA DE EXERCÍCIOS (COM BUSCA AO DIGITAR)
// ---------------------------------------------
function renderizarBiblioteca(filtro = '') {
  if (!bibliotecaList) return;

  const termo = filtro.toLowerCase().trim();
  const exerciciosFiltrados = bibliotecaDeExercicios.filter(ex => 
    ex.nome.toLowerCase().includes(termo) || ex.grupo.toLowerCase().includes(termo)
  );

  if (exerciciosFiltrados.length === 0) {
    bibliotecaList.innerHTML = '<p class="text-center text-gray-500 my-10 text-sm">Nenhum exercício encontrado.</p>';
    return;
  }

  bibliotecaList.innerHTML = exerciciosFiltrados.map(ex => `
    <div class="flex items-center justify-between bg-card-dark p-4 rounded-xl border border-white/5 active:bg-white/5 transition-colors cursor-pointer mb-2" onclick="escolherExercicio('${ex.nome}')">
      <div>
        <p class="font-bold text-sm text-white">${ex.nome}</p>
        <p class="text-xs text-gray-500">${ex.grupo}</p>
      </div>
      <i data-lucide="plus-circle" class="w-5 h-5 text-neon"></i>
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

// Garantir que a busca limpa ao abrir a tela de adicionar exercício
if (btnAddExercicio) {
  btnAddExercicio.addEventListener('click', () => {
    esconderTudo();
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
    if (totalSeries > 0 && seriesFeitas === totalSeries) {
      btnConcluir.className = "px-4 py-2 rounded-xl text-xs font-bold bg-neon text-black transition-all active:scale-95 shadow-lg shadow-neon/20 cursor-pointer";
    } else {
      btnConcluir.className = "px-4 py-2 rounded-xl text-xs font-bold border border-neon/50 text-neon transition-all active:scale-95 opacity-50 cursor-not-allowed";
    }
  }

  const painelMetricasHTML = `
    <div class="grid grid-cols-3 gap-2 mb-4 bg-card-dark p-3 rounded-2xl border border-white/5 text-center">
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
    </div>
  `;
  
  if (!rotina.exercicios || rotina.exercicios.length === 0) {
    exerciciosList.innerHTML = `
      ${painelMetricasHTML}
      <p class="text-center text-sm text-gray-500 my-10">Nenhum exercício. Adicione abaixo!</p>
    `;
  } else {
    let exerciciosHtml = rotina.exercicios.map((ex, indexEx) => {
      let contadorNormal = 0; 

      return `
      <div class="bg-card-dark rounded-xl pt-4 pb-2 px-4 border border-white/5 mb-4">
        <div class="flex items-center justify-between mb-4">
          <h4 class="font-bold text-sm text-neon">${ex.nome}</h4>
          <button onclick="excluirExercicio(${indexEx})" class="text-gray-500 hover:text-red-400 transition-colors p-1" title="Remover exercício">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
        
        <div class="grid grid-cols-[1.5fr_3fr_2fr_2fr_1.5fr] gap-2 text-[10px] text-gray-500 font-semibold mb-2 text-center tracking-wider px-1 items-center">
          <div>SÉRIE</div>
          <div>ANTERIOR</div>
          <div class="flex items-center justify-center gap-1">KG</div>
          <div>REPS</div>
          <div><i data-lucide="check" class="w-3 h-3 mx-auto"></i></div>
        </div>

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
              <div class="w-full ${bgLinha} grid items-center grid-cols-[1.5fr_3fr_2fr_2fr_1.5fr] gap-2 py-1.5 px-1 rounded transition-colors">
                
                <div class="w-7 h-7 mx-auto rounded flex items-center justify-center text-xs font-bold cursor-pointer transition-colors ${corFundo}" 
                     onclick="abrirModalTipoSerie(${indexEx}, ${indexSerie})">
                  ${label}
                </div>
                
                <div class="text-gray-400 text-[11px] font-medium flex items-center justify-center">
                  ${textoAnterior}
                </div>
                
                <input type="number" id="kg-${indexEx}-${indexSerie}" placeholder="-" value="${serie.kg || ''}" class="${bgInput} w-full text-center py-1.5 rounded text-sm font-semibold outline-none focus:border-neon border border-transparent transition-colors">
                <input type="number" id="reps-${indexEx}-${indexSerie}" placeholder="-" value="${serie.reps || ''}" class="${bgInput} w-full text-center py-1.5 rounded text-sm font-semibold outline-none focus:border-neon border border-transparent transition-colors">
                
                <button onclick="concluirSerie(${indexEx}, ${indexSerie})" class="w-7 h-7 mx-auto rounded ${bgBotaoCheck} flex items-center justify-center transition-colors cursor-pointer">
                  <i data-lucide="check" class="w-4 h-4 ${serie.concluida ? 'text-black' : 'text-gray-600'}"></i>
                </button>
              </div>

              <button onclick="excluirSerie(${indexEx}, ${indexSerie})" class="p-2 text-gray-600 hover:text-red-400 transition-colors" title="Excluir série">
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

    exerciciosList.innerHTML = painelMetricasHTML + exerciciosHtml;
  }
  
  esconderTudo();
  viewDetalhe.classList.remove('hidden');
  lucide.createIcons();
  atualizarDisplayTempo();
};

// ---------------------------------------------
// REQUISITO 1: VALIDAÇÃO RÍGIDA DE CARGA/REPS NO CHECK
// ---------------------------------------------
window.concluirSerie = async (indexEx, indexSerie) => {
  const rotina = rotinasReais.find(r => r.id === rotinaAbertaId);
  const serie = rotina.exercicios[indexEx].series[indexSerie];

  const inputKg = document.getElementById(`kg-${indexEx}-${indexSerie}`).value.trim();
  const inputReps = document.getElementById(`reps-${indexEx}-${indexSerie}`).value.trim();

  // Se a série JÁ ESTÁ concluída, permitir desmarcar livremente
  if (serie.concluida) {
    serie.concluida = false;
  } else {
    // Se NÃO está concluída, exige preenchimento obrigatório de KG e REPS
    if (!inputKg || !inputReps || parseFloat(inputKg) <= 0 || parseFloat(inputReps) <= 0) {
      alert("Preencha o Peso (KG) e as Repetições antes de concluir esta série!");
      return; // Interrompe e não deixa marcar o check
    }

    serie.concluida = true;
    serie.kg = inputKg;
    serie.reps = inputReps;
    serie.anteriorKg = inputKg;
    serie.anteriorReps = inputReps;
  }

  try {
    await updateDoc(doc(db, "treinos", rotinaAbertaId), { exercicios: rotina.exercicios });
    abrirRotina(rotinaAbertaId); 
  } catch (error) { console.error(error); }
};

// ---------------------------------------------
// REQUISITO 2 & 3: SALVAMENTO COM RESET DE CHECKS E HISTÓRICO LIMPO PARA A PRÓXIMA SEMANA
// ---------------------------------------------
window.finalizarEConcluirTreino = async () => {
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
    alert("Você precisa concluir todas as séries de todos os exercícios antes de finalizar o treino!");
    return;
  }

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
    await updateDoc(doc(db, "treinos", rotinaAbertaId), { 
      exercicios: rotina.exercicios,
      ultimoTreinoEm: serverTimestamp() 
    });

    pararCronometro();
    alert("Parabéns! Treino concluído com sucesso. Seus recordes foram salvos e a ficha foi resetada limpa para a próxima semana.");
    
    esconderTudo();
    viewRotinas.classList.remove('hidden');
    carregarRotinasDoBanco();
  } catch (error) {
    console.error("Erro ao salvar treino:", error);
    alert("Erro ao concluir o treino.");
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