// js/pages/treino.js
import { auth } from '../config/firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Proteção de rota
onAuthStateChanged(auth, (user) => {
  if (!user) window.location.href = './login.html';
});

// Elementos do DOM (Views)
const viewRotinas = document.getElementById('view-rotinas');
const viewDetalhe = document.getElementById('view-detalhe');
const viewNovaRotina = document.getElementById('view-nova-rotina');
const viewExplorar = document.getElementById('view-explorar');

// Elementos do DOM (Listas e Textos)
const rotinasList = document.getElementById('rotinas-list');
const exerciciosList = document.getElementById('exercicios-list');
const detalheTitulo = document.getElementById('detalhe-titulo');

// Elementos do DOM (Botões)
const btnNovaRotina = document.getElementById('btn-nova-rotina');
const btnExplorar = document.getElementById('btn-explorar');
const btnVoltar = document.getElementById('btn-voltar');
const btnVoltarNova = document.getElementById('btn-voltar-nova');
const btnVoltarExplorar = document.getElementById('btn-voltar-explorar');

// Mock Data (Os treinos que você já tinha)
const rotinasMock = [
  {
    id: 1,
    nome: "Upper A",
    descricao: "Supino Inclinado, Remada Iso-Lateral...",
    exercicios: [
      { nome: "Supino Inclinado (Halter)", series: [{ tipo: "W", kg: 18, reps: "10-12" }, { tipo: "1", kg: 22, reps: "8-10" }] },
      { nome: "Remada Iso-Lateral (Máquina)", series: [{ tipo: "1", kg: 38, reps: "10" }] }
    ]
  },
  { id: 2, nome: "Lower A", descricao: "Agachamento Hack, Leg Press 45º...", exercicios: [] }
];

// Função Helper para esconder todas as telas
function esconderTudo() {
  viewRotinas.classList.add('hidden');
  viewDetalhe.classList.add('hidden');
  viewNovaRotina.classList.add('hidden');
  viewExplorar.classList.add('hidden');
}

// ---------------------------------------------
// NAVEGAÇÃO DOS BOTÕES
// ---------------------------------------------

// Botão "Nova Rotina" -> Abre a tela de criar rotina
btnNovaRotina.addEventListener('click', () => {
  esconderTudo();
  viewNovaRotina.classList.remove('hidden');
  lucide.createIcons(); // Recarrega os ícones da tela
});

// Botão "Explorar" -> Abre a tela de explorar
btnExplorar.addEventListener('click', () => {
  esconderTudo();
  viewExplorar.classList.remove('hidden');
  lucide.createIcons();
});

// Botões de Voltar (Todos retornam para a lista principal)
btnVoltar.addEventListener('click', () => {
  esconderTudo();
  viewRotinas.classList.remove('hidden');
});
btnVoltarNova.addEventListener('click', () => {
  esconderTudo();
  viewRotinas.classList.remove('hidden');
});
btnVoltarExplorar.addEventListener('click', () => {
  esconderTudo();
  viewRotinas.classList.remove('hidden');
});

// ---------------------------------------------
// RENDERIZAÇÃO
// ---------------------------------------------

function renderRotinas() {
  rotinasList.innerHTML = rotinasMock.map(rotina => `
    <div class="bg-card-dark rounded-2xl p-5 border border-white/5 cursor-pointer active:scale-[0.98] transition-transform" onclick="abrirRotina(${rotina.id})">
      <h3 class="font-bold text-lg mb-1">${rotina.nome}</h3>
      <p class="text-xs text-gray-500 mb-4 line-clamp-1">${rotina.descricao}</p>
      <button class="w-full bg-neon text-black font-bold py-2.5 rounded-lg text-sm">Iniciar Rotina</button>
    </div>
  `).join('');
}

window.abrirRotina = (id) => {
  const rotina = rotinasMock.find(r => r.id === id);
  if (!rotina) return;
  detalheTitulo.textContent = rotina.nome;
  
  exerciciosList.innerHTML = rotina.exercicios.map(ex => `
    <div class="bg-card-dark rounded-xl p-4 border border-white/5">
      <div class="flex items-center justify-between mb-4">
        <h4 class="font-bold text-sm text-neon">${ex.nome}</h4>
        <i data-lucide="more-horizontal" class="w-4 h-4 text-gray-500"></i>
      </div>
      <div class="grid grid-cols-4 text-[10px] text-gray-500 font-semibold mb-2 text-center tracking-wider">
        <div>SÉRIE</div><div>KG</div><div>REPS</div><div><i data-lucide="check" class="w-3 h-3 mx-auto"></i></div>
      </div>
      <div class="space-y-2">
        ${ex.series.map(serie => `
          <div class="grid grid-cols-4 items-center gap-2 text-center">
            <div class="w-7 h-7 mx-auto rounded flex items-center justify-center text-xs font-bold ${serie.tipo === 'W' ? 'text-orange-400 bg-orange-400/10' : 'bg-card-dark-2'}">${serie.tipo}</div>
            <input type="text" value="${serie.kg}" class="bg-card-dark-2 w-full text-center py-1.5 rounded text-sm font-semibold outline-none focus:border-neon border border-transparent">
            <input type="text" value="${serie.reps}" class="bg-card-dark-2 w-full text-center py-1.5 rounded text-sm font-semibold outline-none focus:border-neon border border-transparent">
            <button class="w-7 h-7 mx-auto rounded bg-card-dark-2 border border-white/10 flex items-center justify-center hover:border-neon transition-colors"></button>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  lucide.createIcons();
  esconderTudo();
  viewDetalhe.classList.remove('hidden');
};

// Inicialização
renderRotinas();
lucide.createIcons();