import { auth, db } from '../config/firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { escapeHTML, showToast } from '../utils/ui.js';
import { setupAppShell } from '../utils/app-shell.js';
setupAppShell();

const main = document.querySelector('main'); let user, meals = [];
const newId = () => crypto.randomUUID();
async function save() { try { await setDoc(doc(db, 'dietas', user.uid), { userId: user.uid, refeicoes: meals, atualizadoEm: new Date().toISOString() }, { merge: true }); return true; } catch { showToast('Não foi possível salvar a dieta.'); return false; } }
function home() { main.innerHTML = `<header><p class="text-xs font-bold uppercase tracking-wider text-neon">Minha agenda alimentar</p><h1 class="mt-1 text-2xl font-extrabold">Dieta</h1><p class="mt-2 text-sm text-gray-400">Veja o que comer em cada horário.</p></header><button id="add-meal" class="mt-6 min-h-12 w-full rounded-2xl bg-neon font-bold text-black">+ Adicionar refeição</button><div id="meal-cards" class="mt-5 space-y-3"></div>`; const cards = document.getElementById('meal-cards'); cards.innerHTML = meals.length ? [...meals].sort((a,b)=>a.hora.localeCompare(b.hora)).map(meal => `<button data-meal="${meal.id}" class="glass-card w-full rounded-3xl p-5 text-left active:scale-[.98]"><span class="text-xs font-bold text-neon">${meal.hora}</span><strong class="mt-1 block text-xl">${escapeHTML(meal.nome)}</strong><span class="mt-2 block text-sm text-gray-400">${meal.alimentos.length} alimento(s) · Toque para ver</span></button>`).join('') : '<p class="py-10 text-center text-sm text-gray-500">Adicione café da manhã, almoço, jantar ou seus próprios horários.</p>'; document.getElementById('add-meal').onclick = () => mealForm(); cards.querySelectorAll('[data-meal]').forEach(button => button.onclick = () => detail(meals.find(meal => meal.id === button.dataset.meal))); }
function mealForm(meal = { id: newId(), nome: '', hora: '12:00', alimentos: [] }) { main.innerHTML = `<button id="back" class="text-sm font-bold text-gray-400">← Dieta</button><h1 class="mt-4 text-2xl font-extrabold">${meal.nome ? 'Editar refeição' : 'Nova refeição'}</h1><input id="name" value="${escapeHTML(meal.nome)}" placeholder="Ex.: Almoço" class="mt-6 w-full rounded-xl bg-card-dark-2 p-4 text-white"><input id="time" type="time" value="${meal.hora}" class="mt-3 w-full rounded-xl bg-card-dark-2 p-4 text-white"><button id="save-meal" class="mt-4 min-h-12 w-full rounded-2xl bg-neon font-bold text-black">Salvar refeição</button>`; document.getElementById('back').onclick = home; document.getElementById('save-meal').onclick = async () => { meal.nome = document.getElementById('name').value.trim(); meal.hora = document.getElementById('time').value; if (!meal.nome) return showToast('Digite o nome da refeição.'); if (!meals.some(item => item.id === meal.id)) meals.push(meal); if (await save()) detail(meal); }; }
function detail(meal) { main.innerHTML = `<button id="back" class="text-sm font-bold text-gray-400">← Dieta</button><h1 class="mt-4 text-2xl font-extrabold">${escapeHTML(meal.nome)}</h1><p class="mt-1 text-sm text-neon">${meal.hora}</p><button id="add-food" class="mt-5 min-h-12 w-full rounded-2xl bg-neon font-bold text-black">+ Adicionar alimento</button><div id="foods" class="mt-5 space-y-3"></div>`; const list = document.getElementById('foods'); list.innerHTML = meal.alimentos.length ? meal.alimentos.map((food,index) => `<article class="glass-card flex items-center justify-between rounded-2xl p-4"><div><strong>${escapeHTML(food.nome)}</strong><p class="mt-1 text-xs text-gray-400">${escapeHTML(food.quantidade || 'Porção livre')}</p></div><button data-remove="${index}" class="text-red-400">Remover</button></article>`).join('') : '<p class="py-8 text-center text-sm text-gray-500">Cadastre os alimentos dessa refeição.</p>'; document.getElementById('back').onclick = home; document.getElementById('add-food').onclick = async () => { const nome = prompt('Alimento'); if (!nome) return; const quantidade = prompt('Quantidade / porção', '100 g') || ''; meal.alimentos.push({ nome, quantidade }); if (await save()) detail(meal); }; list.querySelectorAll('[data-remove]').forEach(button => button.onclick = async () => { meal.alimentos.splice(Number(button.dataset.remove), 1); if (await save()) detail(meal); }); }
onAuthStateChanged(auth, async account => { if (!account) return location.href = './login.html'; user = account; try { const snapshot = await getDoc(doc(db, 'dietas', user.uid)); if (snapshot.exists()) meals = (snapshot.data().refeicoes || []).map(meal => ({ ...meal, alimentos: meal.alimentos || (meal.itens || []).map(item => ({ nome: item.nome, quantidade: item.porcao ? `${item.porcao} ${item.unidade || 'g'}` : '' })) })); home(); } catch { showToast('Não foi possível carregar sua dieta.'); } });
document.title = 'Mol';

const originalHome = home;
home = function () {
  originalHome();
  const ordered = [...meals].sort((a, b) => a.hora.localeCompare(b.hora));
  const now = new Date().toTimeString().slice(0, 5);
  const next = ordered.find(meal => meal.hora >= now) || ordered[0];
  if (!next) return;
  const card = document.createElement('section');
  card.className = 'glass-card mt-6 rounded-3xl p-5';
  card.innerHTML = `<p class="text-xs font-bold uppercase tracking-wider text-neon">Próxima refeição</p><h2 class="mt-1 text-xl font-extrabold">${escapeHTML(next.nome)}</h2><p class="mt-1 text-sm text-gray-400">${next.hora} · ${next.alimentos.length} alimento(s)</p><button class="mt-4 min-h-11 w-full rounded-xl bg-neon text-sm font-bold text-black">Ver refeição</button>`;
  main.querySelector('header').after(card);
  card.querySelector('button').onclick = () => detail(next);
};

// O aviso de prÃ³xima refeiÃ§Ã£o pertence ao painel InÃ­cio, nÃ£o Ã  agenda da Dieta.
home = originalHome;
