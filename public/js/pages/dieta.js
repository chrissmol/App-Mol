import { auth, db } from '../config/firebase-config.js';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { FOOD_CATALOG, foodNutrients, nextMeal, normalizeDietMeals, nutritionTotals, validateFood, validateMeal } from '../modules/nutrition.js';
import { confirmAction, escapeHTML, showToast } from '../utils/ui.js';
import { setupAppShell } from '../utils/app-shell.js';

setupAppShell();
const $ = id => document.getElementById(id);
let user = null;
let meals = [];
let goals = { kcal: 2400, protein: 180, carbs: 250, fat: 70 };
const newId = () => crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const clone = value => JSON.parse(JSON.stringify(value));
const rounded = value => Math.round(Number(value) || 0);
const goalValue = (value, fallback, max) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 && parsed <= max ? parsed : fallback;
};
let modalOpener = null;
let mealClock = null;
const MEAL_NAMES = ['Café da manhã', 'Lanche da manhã', 'Almoço', 'Pré-treino', 'Pós-treino', 'Lanche da tarde', 'Jantar', 'Ceia'];
const MEAL_COMBINATIONS = [
  { label: 'Ovos + café', foods: [['Ovo cozido', 100], ['Café coado sem açúcar', 200]] },
  { label: 'Pão + carne', foods: [['Pão francês', 50], ['Carne bovina magra grelhada', 100]] },
  { label: 'Iogurte + aveia + banana', foods: [['Iogurte natural integral', 170], ['Aveia em flocos', 40], ['Banana', 100]] },
  { label: 'Arroz + feijão + frango', foods: [['Arroz branco cozido', 150], ['Feijão carioca cozido', 100], ['Peito de frango grelhado', 150]] },
  { label: 'Tapioca + ovos', foods: [['Tapioca pronta', 100], ['Ovo cozido', 100]] },
  { label: 'Whey + banana', foods: [['Whey protein', 30], ['Banana', 100]] }
];
const catalogFood = name => FOOD_CATALOG.find(food => food.nome === name);

async function persist(nextMeals) {
  try {
    await setDoc(doc(db, 'dietas', user.uid), { userId: user.uid, refeicoes: normalizeDietMeals(nextMeals), atualizadoEm: serverTimestamp() });
    meals = nextMeals; render(); return true;
  } catch (error) { console.error('Dieta não salva:', error); showToast(error.code === 'permission-denied' ? 'A dieta excede os limites permitidos.' : 'Não foi possível salvar a dieta.'); return false; }
}

function closeModal() { $('diet-modal').innerHTML = ''; modalOpener?.focus?.(); modalOpener = null; }
function modal(title, content) {
  if (!$('diet-modal').contains(document.activeElement)) modalOpener = document.activeElement;
  $('diet-modal').innerHTML = `<div class="fixed inset-0 z-[200] flex items-end bg-black/70 p-4 backdrop-blur-sm sm:items-center sm:justify-center" data-overlay><section role="dialog" aria-modal="true" aria-labelledby="diet-modal-title" class="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-white/10 bg-[#151a17] p-5"><div class="flex items-center justify-between gap-3"><h2 id="diet-modal-title" class="text-xl font-extrabold">${escapeHTML(title)}</h2><button type="button" data-close class="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5" aria-label="Fechar"><i data-lucide="x"></i></button></div><div class="mt-5">${content}</div></section></div>`;
  $('diet-modal').querySelector('[data-close]').onclick = closeModal;
  $('diet-modal').querySelector('[data-overlay]').onclick = event => { if (event.target === event.currentTarget) closeModal(); };
  $('diet-modal').querySelector('[data-overlay]').onkeydown = event => {
    if (event.key === 'Escape') return closeModal();
    if (event.key !== 'Tab') return;
    const controls = [...$('diet-modal').querySelectorAll('button:not(:disabled), input:not(:disabled), a[href]')];
    const first = controls[0]; const last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };
  window.lucide?.createIcons();
}

function render() {
  const totals = nutritionTotals(meals);
  $('diet-total').textContent = `${rounded(totals.kcal).toLocaleString('pt-BR')} kcal`;
  $('calorie-goal').textContent = `Meta: ${goals.kcal.toLocaleString('pt-BR')} kcal`;
  $('calorie-progress').style.width = `${Math.min(100, (totals.kcal / goals.kcal) * 100)}%`;
  $('macro-total').innerHTML = [['Proteína', totals.protein, goals.protein], ['Carbo', totals.carbs, goals.carbs], ['Gordura', totals.fat, goals.fat]].map(([label, value, goal]) => `<div class="rounded-2xl bg-white/5 p-3"><strong class="block text-sm">${rounded(value)} g</strong><span class="mt-1 block text-[10px] text-gray-500">${label} · ${goal} g</span></div>`).join('');
  const next = nextMeal(meals, new Date().toTimeString().slice(0, 5));
  $('next-meal').innerHTML = next.meal ? `<p class="text-xs font-bold uppercase tracking-wider text-neon">Próxima refeição${next.tomorrow ? ' · amanhã' : ''}</p><div class="mt-2 flex items-end justify-between gap-4"><div><h2 class="text-xl font-extrabold">${escapeHTML(next.meal.nome)}</h2><p class="mt-1 text-sm text-gray-400">${escapeHTML(next.meal.hora)} · ${next.meal.alimentos.length} ${next.meal.alimentos.length === 1 ? 'alimento' : 'alimentos'}</p></div><button type="button" data-open-next class="min-h-10 rounded-xl bg-neon px-3 text-xs font-bold text-black">Ver</button></div>` : '<div class="text-center"><p class="font-bold">Nenhuma refeição planejada</p><p class="mt-1 text-sm text-gray-500">Adicione sua primeira refeição do dia.</p></div>';
  $('next-meal').querySelector('[data-open-next]')?.addEventListener('click', () => openMeal(next.meal.id));
  $('meal-count').textContent = `${meals.length}/12`;
  $('meal-list').innerHTML = meals.length ? [...meals].sort((a, b) => a.hora.localeCompare(b.hora)).map(meal => {
    const total = nutritionTotals([{ alimentos: meal.alimentos }]);
    return `<article class="glass-card rounded-3xl p-5"><button type="button" data-open-meal="${escapeHTML(meal.id)}" class="w-full text-left"><div class="flex items-start justify-between gap-4"><div class="min-w-0"><span class="text-xs font-bold text-neon">${escapeHTML(meal.hora)}</span><h3 class="mt-1 truncate text-lg font-extrabold">${escapeHTML(meal.nome)}</h3><p class="mt-2 text-xs text-gray-500">${meal.alimentos.length} alimento(s) · ${rounded(total.kcal)} kcal</p></div><i data-lucide="chevron-right" class="h-5 w-5 text-gray-500"></i></div></button></article>`;
  }).join('') : '<div class="glass-card rounded-3xl px-5 py-10 text-center"><p class="font-bold">Sua agenda está vazia</p><p class="mt-2 text-sm text-gray-500">Adicione café da manhã, almoço, jantar ou seus próprios horários.</p><button type="button" data-empty-add class="mt-5 min-h-11 rounded-xl bg-neon px-5 text-sm font-bold text-black">Adicionar refeição</button></div>';
  $('meal-list').querySelectorAll('[data-open-meal]').forEach(button => button.onclick = () => openMeal(button.dataset.openMeal));
  $('meal-list').querySelector('[data-empty-add]')?.addEventListener('click', () => openMealForm());
  window.lucide?.createIcons();
}

function openMealForm(mealId = null) {
  const existing = meals.find(item => item.id === mealId);
  const value = existing || { id: newId(), nome: '', hora: '12:00', alimentos: [] };
  modal(existing ? 'Editar refeição' : 'Nova refeição', `<p class="text-xs font-bold uppercase tracking-wider text-neon">Escolha um momento do dia ou personalize</p><div id="meal-name-options" class="mt-3 flex gap-2 overflow-x-auto pb-2">${MEAL_NAMES.map(name => `<button type="button" data-meal-name="${escapeHTML(name)}" class="shrink-0 rounded-full bg-white/5 px-3 py-2 text-xs font-bold text-gray-300">${escapeHTML(name)}</button>`).join('')}</div><label class="mt-3 block text-xs font-bold text-gray-400">Nome<input id="meal-name" maxlength="60" autocomplete="off" value="${escapeHTML(value.nome)}" class="mt-2 min-h-12 w-full rounded-xl bg-card-dark-2 px-4 text-white" placeholder="Ex.: Café da manhã"></label><label class="mt-4 block text-xs font-bold text-gray-400">Horário<input id="meal-time" type="time" value="${escapeHTML(value.hora)}" class="mt-2 min-h-12 w-full rounded-xl bg-card-dark-2 px-4 text-white"></label><button id="save-meal" type="button" class="mt-6 min-h-12 w-full rounded-2xl bg-neon font-bold text-black">Salvar refeição</button>`);
  $('meal-name').focus();
  $('meal-name-options').querySelectorAll('[data-meal-name]').forEach(button => button.onclick = () => { $('meal-name').value = button.dataset.mealName; });
  $('save-meal').onclick = async () => {
    const updated = { ...value, nome: $('meal-name').value.trim(), hora: $('meal-time').value };
    const error = validateMeal(updated); if (error) return showToast(error);
    if (!existing && meals.length >= 12) return showToast('O limite é de 12 refeições.');
    const next = clone(meals); const index = next.findIndex(item => item.id === updated.id); if (index >= 0) next[index] = updated; else next.push(updated);
    $('save-meal').disabled = true; $('save-meal').textContent = 'Salvando…'; if (await persist(next)) { closeModal(); showToast('Refeição salva.', 'success'); } else { $('save-meal').disabled = false; $('save-meal').textContent = 'Salvar refeição'; }
  };
}

function openMeal(mealId) {
  const meal = meals.find(item => item.id === mealId); if (!meal) return;
  const total = nutritionTotals([{ alimentos: meal.alimentos }]);
  modal(meal.nome, `<p class="text-sm text-neon">${escapeHTML(meal.hora)} · ${rounded(total.kcal)} kcal</p><div class="mt-4 grid grid-cols-3 gap-2 text-center text-xs"><span class="rounded-xl bg-white/5 p-2">P ${rounded(total.protein)} g</span><span class="rounded-xl bg-white/5 p-2">C ${rounded(total.carbs)} g</span><span class="rounded-xl bg-white/5 p-2">G ${rounded(total.fat)} g</span></div><button id="add-food" type="button" class="mt-5 min-h-12 w-full rounded-2xl bg-neon font-bold text-black">Adicionar alimento</button><section class="mt-4"><p class="text-xs font-bold uppercase tracking-wider text-gray-400">Combinações rápidas</p><div id="meal-combinations" class="mt-2 flex gap-2 overflow-x-auto pb-1">${MEAL_COMBINATIONS.map((item, index) => `<button type="button" data-combination="${index}" class="shrink-0 rounded-xl bg-white/5 px-3 py-2 text-xs font-bold text-gray-300">+ ${item.label}</button>`).join('')}</div></section><div id="meal-foods" class="mt-4 space-y-2"></div><div class="mt-6 grid grid-cols-2 gap-3"><button id="edit-meal" type="button" class="min-h-11 rounded-xl bg-white/5 text-sm font-bold">Editar</button><button id="delete-meal" type="button" class="min-h-11 rounded-xl bg-red-500/10 text-sm font-bold text-red-300">Excluir</button></div>`);
  $('meal-foods').innerHTML = meal.alimentos.length ? meal.alimentos.map(food => { const nutrients = foodNutrients(food); return `<article class="rounded-2xl bg-white/5 p-4"><div class="flex items-start justify-between gap-3"><div><strong class="text-sm">${escapeHTML(food.nome)}</strong><p class="mt-1 text-xs text-gray-500">${food.gramas} g · ${rounded(nutrients.kcal)} kcal · P ${rounded(nutrients.protein)} · C ${rounded(nutrients.carbs)} · G ${rounded(nutrients.fat)}</p></div><button type="button" data-remove-food="${escapeHTML(food.id)}" class="min-h-10 text-xs font-bold text-red-300">Remover</button></div></article>`; }).join('') : '<p class="py-6 text-center text-sm text-gray-500">Nenhum alimento nesta refeição.</p>';
  $('add-food').onclick = () => openFoodSearch(meal.id); $('edit-meal').onclick = () => openMealForm(meal.id);
  $('meal-combinations').querySelectorAll('[data-combination]').forEach(button => button.onclick = async () => {
    const combination = MEAL_COMBINATIONS[Number(button.dataset.combination)]; const next = clone(meals); const target = next.find(item => item.id === meal.id);
    if (!combination || !target) return;
    const foods = combination.foods.map(([name, grams]) => { const food = catalogFood(name); return food ? { id: newId(), ...food, gramas: grams } : null; }).filter(Boolean);
    if (target.alimentos.length + foods.length > 50) return showToast('Essa refeição atingiu o limite de 50 alimentos.');
    target.alimentos.push(...foods);
    if (await persist(next)) { closeModal(); openMeal(meal.id); showToast(`${combination.label} adicionados à refeição.`, 'success'); }
  });
  $('delete-meal').onclick = async () => { if (!await confirmAction({ title: 'Excluir refeição?', message: `${meal.nome} e seus alimentos serão removidos.`, confirmText: 'Excluir', danger: true })) return; const next = meals.filter(item => item.id !== meal.id); if (await persist(next)) { closeModal(); showToast('Refeição excluída.', 'success'); } };
  $('meal-foods').querySelectorAll('[data-remove-food]').forEach(button => button.onclick = async () => { const next = clone(meals); const target = next.find(item => item.id === meal.id); target.alimentos = target.alimentos.filter(food => food.id !== button.dataset.removeFood); if (await persist(next)) { closeModal(); openMeal(meal.id); showToast('Alimento removido.', 'success'); } });
  $('add-food').focus();
}

function chooseMealForFood() {
  if (!meals.length) return showToast('Crie uma refeição antes de adicionar alimentos.');
  if (meals.length === 1) return openFoodSearch(meals[0].id);
  modal('Escolha a refeição', meals.map(meal => `<button type="button" data-target-meal="${escapeHTML(meal.id)}" class="mb-2 min-h-12 w-full rounded-xl bg-white/5 px-4 text-left text-sm font-bold">${escapeHTML(meal.hora)} · ${escapeHTML(meal.nome)}</button>`).join(''));
  $('diet-modal').querySelectorAll('[data-target-meal]').forEach(button => button.onclick = () => openFoodSearch(button.dataset.targetMeal));
  $('diet-modal').querySelector('[data-target-meal]')?.focus();
}

function openFoodSearch(mealId) {
  modal('Buscar alimento', `<label class="flex min-h-12 items-center gap-3 rounded-xl bg-white/5 px-4"><i data-lucide="search" class="h-4 w-4 text-gray-500"></i><span class="sr-only">Buscar alimento</span><input id="food-query" type="search" placeholder="Ex.: arroz, frango, banana" class="min-w-0 flex-1 bg-transparent text-sm outline-none"></label><button id="custom-food" type="button" class="mt-3 min-h-11 w-full rounded-xl border border-neon/30 text-xs font-bold text-neon">Cadastrar alimento personalizado</button><div id="food-results" class="mt-4 space-y-2"></div>`);
  const paint = () => { const term = $('food-query').value.trim().toLocaleLowerCase('pt-BR'); const list = FOOD_CATALOG.filter(food => food.nome.toLocaleLowerCase('pt-BR').includes(term)); $('food-results').innerHTML = list.map((food, index) => `<button type="button" data-food-index="${index}" class="min-h-14 w-full rounded-2xl bg-white/5 p-3 text-left"><strong class="text-sm">${escapeHTML(food.nome)}</strong><span class="mt-1 block text-xs text-gray-500">${food.kcal100} kcal · P ${food.proteina100} · C ${food.carbo100} · G ${food.gordura100} por 100 g</span></button>`).join('') || '<p class="py-6 text-center text-sm text-gray-500">Nenhum alimento encontrado.</p>'; $('food-results').querySelectorAll('[data-food-index]').forEach((button, index) => button.onclick = () => openFoodForm(mealId, list[index])); };
  $('food-query').oninput = paint; $('custom-food').onclick = () => openFoodForm(mealId, null); paint(); $('food-query').focus(); window.lucide?.createIcons();
}

function openFoodForm(mealId, catalogFood) {
  const food = catalogFood || { nome: '', kcal100: 0, proteina100: 0, carbo100: 0, gordura100: 0 };
  modal(catalogFood ? 'Definir porção' : 'Novo alimento', `<label class="block text-xs font-bold text-gray-400">Alimento<input id="food-name" maxlength="80" value="${escapeHTML(food.nome)}" class="mt-2 min-h-12 w-full rounded-xl bg-card-dark-2 px-4"></label><label class="mt-4 block text-xs font-bold text-gray-400">Porção (g)<input id="food-grams" type="number" min="1" max="5000" step="1" value="100" class="mt-2 min-h-12 w-full rounded-xl bg-card-dark-2 px-4"></label><p class="mt-5 text-xs font-bold uppercase tracking-wider text-neon">Valores por 100 g</p><div class="mt-3 grid grid-cols-2 gap-3">${[['food-kcal','Kcal',food.kcal100,1000],['food-protein','Proteína',food.proteina100,100],['food-carbs','Carboidrato',food.carbo100,100],['food-fat','Gordura',food.gordura100,100]].map(([id,label,value,max]) => `<label class="text-xs text-gray-400">${label}<input id="${id}" type="number" min="0" max="${max}" step="0.1" value="${value}" class="mt-1 min-h-11 w-full rounded-xl bg-card-dark-2 px-3"></label>`).join('')}</div><button id="save-food" type="button" class="mt-6 min-h-12 w-full rounded-2xl bg-neon font-bold text-black">Adicionar alimento</button>`);
  $(catalogFood ? 'food-grams' : 'food-name').focus();
  $('save-food').onclick = async () => { const value = { id: newId(), nome: $('food-name').value.trim(), gramas: Number($('food-grams').value), kcal100: Number($('food-kcal').value), proteina100: Number($('food-protein').value), carbo100: Number($('food-carbs').value), gordura100: Number($('food-fat').value) }; const error = validateFood(value); if (error) return showToast(error); const next = clone(meals); const target = next.find(item => item.id === mealId); if (!target) return; if (target.alimentos.length >= 50) return showToast('O limite é de 50 alimentos por refeição.'); target.alimentos.push(value); $('save-food').disabled = true; if (await persist(next)) { closeModal(); openMeal(mealId); showToast('Alimento adicionado.', 'success'); } else $('save-food').disabled = false; };
}

async function load() {
  try {
    const [dietSnapshot, profileSnapshot] = await Promise.all([getDoc(doc(db, 'dietas', user.uid)), getDoc(doc(db, 'users', user.uid))]);
    meals = normalizeDietMeals(dietSnapshot.data()?.refeicoes || []); const profile = profileSnapshot.data() || {};
    goals = {
      kcal: goalValue(profile.metaCalorias ?? profile.dailyCalorieGoal, 2400, 10000),
      protein: goalValue(profile.macroGoals?.protein, 180, 1000),
      carbs: goalValue(profile.macroGoals?.carbs, 250, 1000),
      fat: goalValue(profile.macroGoals?.fat, 70, 1000)
    };
    $('diet-status').classList.add('hidden'); $('diet-content').classList.remove('hidden'); $('add-meal').disabled = false; document.body.setAttribute('aria-busy', 'false'); render();
    clearInterval(mealClock); mealClock = setInterval(render, 60000);
  } catch (error) { console.error('Dieta não carregada:', error); document.body.setAttribute('aria-busy', 'false'); $('add-meal').disabled = true; $('diet-status').innerHTML = '<p>Não foi possível carregar sua dieta.</p><button id="retry-diet" type="button" class="mt-4 min-h-10 rounded-xl bg-neon px-4 text-xs font-bold text-black">Tentar novamente</button>'; $('retry-diet').onclick = load; showToast('Não foi possível carregar sua dieta.'); }
}

$('add-meal').onclick = () => openMealForm(); $('food-search').onclick = chooseMealForFood;
onAuthStateChanged(auth, account => { if (!account) { location.href = './login.html'; return; } user = account; void load(); });
