import { db } from '../config/firebase-config.js';
import { watchProtectedPage } from '../modules/auth.js';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { DIET_PLANS } from '../data/diet-plans.js';
import { FASTING_PROTOCOLS, FOOD_CATALOG, foodNutrients, mealFoods, mealIsOutsideFastingWindow, mealOptionGroups, mealsForDay, nextMeal, normalizeDietMeals, normalizeFastingSettings, nutritionTotals, searchFoodCatalog, validateFood, validateMeal } from '../modules/nutrition.js';
import { confirmAction, escapeHTML, showToast } from '../utils/ui.js';
import { setupAppShell } from '../utils/app-shell.js';
import { getLocalItem, getSessionItem, setLocalItem, setSessionItem } from '../utils/storage.js';

setupAppShell();
const $ = id => document.getElementById(id);
let user = null;
let meals = [];
let goals = { kcal: 2400, protein: 180, carbs: 250, fat: 70 };
let fasting = normalizeFastingSettings();
let dietMode = 'view';
let selectedDay = new Date().getDay();
const requestedParams = new URLSearchParams(window.location.search);
const requestedMealId = requestedParams.get('meal');
let pendingRequestedMealId = requestedMealId;
const requestedDay = Number(requestedParams.get('day'));
if (Number.isInteger(requestedDay) && requestedDay >= 0 && requestedDay <= 6) selectedDay = requestedDay;
const newId = () => crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const clone = value => JSON.parse(JSON.stringify(value));
const rounded = value => Math.round(Number(value) || 0);
function withTimeout(promise, label, milliseconds = 9000) {
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(`${label} excedeu o tempo de resposta.`)), milliseconds); })
  ]).finally(() => clearTimeout(timer));
}
const goalValue = (value, fallback, max) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 && parsed <= max ? parsed : fallback;
};
let modalOpener = null;
let modalScrollY = 0;
let mealClock = null;
const MEAL_NAMES = ['Café da manhã', 'Lanche da manhã', 'Almoço', 'Pré-treino', 'Pós-treino', 'Lanche da tarde', 'Jantar', 'Ceia'];
const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
const MEAL_COMBINATIONS = [
  { label: 'Ovos + café', foods: [['Ovo cozido', 100], ['Café coado sem açúcar', 200]] },
  { label: 'Pão + carne', foods: [['Pão francês', 50], ['Carne bovina magra grelhada', 100]] },
  { label: 'Iogurte + aveia + banana', foods: [['Iogurte natural integral', 170], ['Aveia em flocos', 40], ['Banana', 100]] },
  { label: 'Arroz + feijão + frango', foods: [['Arroz branco cozido', 150], ['Feijão carioca cozido', 100], ['Peito de frango grelhado', 150]] },
  { label: 'Tapioca + ovos', foods: [['Tapioca pronta', 100], ['Ovo cozido', 100]] },
  { label: 'Whey + banana', foods: [['Whey protein', 30], ['Banana', 100]] }
];
const FOOD_EQUIVALENTS = [
  ['Peito de frango grelhado', ['Patinho moído refogado', 'Tilápia grelhada', 'Atum em água', 'Ovo cozido']],
  ['Arroz branco cozido', ['Arroz integral cozido', 'Batata inglesa cozida', 'Mandioca cozida', 'Macarrão cozido']],
  ['Feijão carioca cozido', ['Feijão preto cozido', 'Lentilha cozida', 'Grão-de-bico cozido']],
  ['Pão de forma', ['Pão integral', 'Pão francês', 'Tapioca pronta', 'Cuscuz de milho cozido']],
  ['Banana', ['Maçã', 'Mamão', 'Morango', 'Uva']],
  ['Leite integral', ['Leite desnatado', 'Leite sem lactose integral', 'Bebida de soja sem açúcar']]
];
const catalogFood = name => FOOD_CATALOG.find(food => food.nome === name);
function equivalentSuggestions(meal) {
  const names = mealFoods(meal).map(food => food.nome);
  return FOOD_EQUIVALENTS.filter(([base]) => names.includes(base)).map(([base, options]) => ({ base, options: options.filter(name => catalogFood(name)).slice(0, 4) })).filter(item => item.options.length).slice(0, 4);
}
const dietCacheKey = uid => `mol-diet-cache-${uid}`;
function readDietCache(uid) {
  try {
    const cached = JSON.parse(getSessionItem(dietCacheKey(uid)) || getLocalItem(dietCacheKey(uid)) || 'null');
    return cached && Array.isArray(cached.meals) ? { meals: normalizeDietMeals(cached.meals), goals: cached.goals || null, fasting: normalizeFastingSettings(cached.fasting) } : null;
  } catch { return null; }
}
function writeDietCache() {
  if (!user) return;
  const value = JSON.stringify({ meals, goals, fasting, updatedAt: Date.now() });
  setSessionItem(dietCacheKey(user.uid), value);
  setLocalItem(dietCacheKey(user.uid), value);
}

async function persist(nextMeals) {
  try {
    await setDoc(doc(db, 'dietas', user.uid), { userId: user.uid, refeicoes: normalizeDietMeals(nextMeals), jejum: normalizeFastingSettings(fasting), atualizadoEm: serverTimestamp() });
    meals = nextMeals; writeDietCache(); render(); return true;
  } catch (error) { console.error('Dieta não salva:', error); showToast(error.code === 'permission-denied' ? 'A dieta excede os limites permitidos.' : 'Não foi possível salvar a dieta.'); return false; }
}

function closeModal() {
  document.documentElement.classList.remove('modal-open');
  document.body.classList.remove('modal-open');
  document.body.style.top = '';
  $('diet-modal').innerHTML = '';
  window.scrollTo(0, modalScrollY);
  modalOpener?.focus?.();
  modalOpener = null;
}
function modal(title, content) {
  if (!$('diet-modal').contains(document.activeElement)) modalOpener = document.activeElement;
  modalScrollY = window.scrollY || document.documentElement.scrollTop || 0;
  document.documentElement.classList.add('modal-open');
  document.body.classList.add('modal-open');
  document.body.style.top = `-${modalScrollY}px`;
  $('diet-modal').innerHTML = `<div class="mol-modal-overlay" data-overlay><section role="dialog" aria-modal="true" aria-labelledby="diet-modal-title" class="mol-modal-card mol-dialog-surface rounded-3xl p-5"><div class="flex shrink-0 items-center justify-between gap-3"><h2 id="diet-modal-title" class="text-xl font-extrabold">${escapeHTML(title)}</h2><button type="button" data-close class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl mol-soft" aria-label="Fechar"><i data-lucide="x"></i></button></div><div class="mol-modal-content mt-5">${content}</div></section></div>`;
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

async function persistFasting(nextFasting) {
  const previous = fasting;
  fasting = normalizeFastingSettings(nextFasting);
  const ok = await persist(meals);
  if (!ok) fasting = previous;
  return ok;
}

function renderFastingCard() {
  const activeDays = fasting.diasSemana.length === 7 ? 'Todos os dias' : `${fasting.diasSemana.length} dia(s) por semana`;
  $('fasting-card').innerHTML = `<div class="flex items-center justify-between gap-4"><div><p class="text-xs font-bold uppercase tracking-wider text-neon">Jejum intermitente</p><h2 class="mt-1 text-xl font-extrabold">${fasting.ativo ? escapeHTML(fasting.protocolo) : 'Desativado'}</h2><p class="mt-2 text-sm text-gray-500">${fasting.ativo ? `${escapeHTML(activeDays)} · ${escapeHTML(fasting.inicioJanela)}-${escapeHTML(fasting.fimJanela)}` : 'Configure sua janela de jejum quando quiser.'}</p></div><button type="button" id="fasting-settings" class="mol-btn mol-btn-secondary min-h-10 rounded-xl px-3 text-xs">${fasting.ativo ? 'Editar' : 'Configurar'}</button></div>`;
  $('fasting-settings').onclick = openFastingForm;
}

function renderDaySelector() {
  let selector = $('diet-day-selector');
  if (!selector) {
    selector = document.createElement('section');
    selector.id = 'diet-day-selector';
    selector.className = 'mt-6';
    $('diet-content')?.prepend(selector);
  }
  selector.innerHTML = `<div class="flex items-center justify-between gap-3"><div><p class="text-xs font-semibold uppercase tracking-[.16em] text-neon">Dia do plano</p><h2 class="mt-1 text-lg font-extrabold">${escapeHTML(DAY_LABELS[selectedDay])}</h2></div><button type="button" data-today class="min-h-9 rounded-xl mol-soft px-3 text-xs font-bold text-gray-300">Hoje</button></div><div class="mt-3 grid grid-cols-7 gap-1">${DAY_LABELS.map((label, day) => `<button type="button" data-day="${day}" class="min-h-10 rounded-xl px-1 text-xs font-bold ${day === selectedDay ? 'bg-neon text-black' : 'mol-soft text-gray-400'}">${label}</button>`).join('')}</div>`;
  selector.querySelector('[data-today]').onclick = () => { selectedDay = new Date().getDay(); render(); };
  selector.querySelectorAll('[data-day]').forEach(button => {
    button.onclick = () => { selectedDay = Number(button.dataset.day); render(); };
  });
}

function render() {
  setDietMode(dietMode);
  renderDaySelector();
  renderFastingCard();
  const dayMeals = mealsForDay(meals, selectedDay);
  const totals = nutritionTotals(dayMeals);
  $('diet-total').textContent = `${rounded(totals.kcal).toLocaleString('pt-BR')} kcal`;
  $('calorie-goal').textContent = `Meta: ${goals.kcal.toLocaleString('pt-BR')} kcal`;
  $('calorie-progress').style.width = `${Math.min(100, (totals.kcal / goals.kcal) * 100)}%`;
  $('macro-total').innerHTML = [['Proteína', totals.protein, goals.protein], ['Carbo', totals.carbs, goals.carbs], ['Gordura', totals.fat, goals.fat]].map(([label, value, goal]) => `<div class="rounded-2xl mol-soft p-3"><strong class="block text-sm">${rounded(value)} g</strong><span class="mt-1 block text-[10px] text-gray-500">${label} · ${goal} g</span></div>`).join('');
  const next = nextMeal(dayMeals, selectedDay === new Date().getDay() ? new Date().toTimeString().slice(0, 5) : '00:00');
  $('next-meal').innerHTML = next.meal ? `<p class="text-xs font-bold uppercase tracking-wider text-neon">Próxima refeição${next.tomorrow ? ' · amanhã' : ''}</p><div class="mt-2 flex items-end justify-between gap-4"><div><h2 class="text-xl font-extrabold">${escapeHTML(next.meal.nome)}</h2><p class="mt-1 text-sm text-gray-400">${escapeHTML(next.meal.hora)} · ${mealFoods(next.meal).length} ${mealFoods(next.meal).length === 1 ? 'alimento' : 'alimentos'}</p></div><button type="button" data-open-next class="min-h-10 rounded-xl bg-neon px-3 text-xs font-bold text-black">Ver</button></div>` : '<div class="text-center"><p class="font-bold">Nenhuma refeição planejada</p><p class="mt-1 text-sm text-gray-500">Adicione sua primeira refeição do dia.</p></div>';
  $('next-meal').querySelector('[data-open-next]')?.addEventListener('click', () => openMeal(next.meal.id));
  $('meal-count').textContent = `${dayMeals.length}/${meals.length}`;
  $('meal-list').innerHTML = dayMeals.length ? [...dayMeals].sort((a, b) => a.hora.localeCompare(b.hora)).map(meal => {
    const total = nutritionTotals([meal]);
    const outsideWindow = mealIsOutsideFastingWindow(meal, fasting) ? ' · fora da janela' : '';
    const macroLine = [['P', total.protein], ['C', total.carbs], ['G', total.fat]].map(([label, value]) => `<span class="rounded-xl bg-white/5 px-2 py-1">${label} ${rounded(value)}g</span>`).join('');
    return `<article class="glass-card rounded-3xl p-5"><button type="button" data-open-meal="${escapeHTML(meal.id)}" class="w-full text-left"><div class="flex items-start justify-between gap-4"><div class="min-w-0"><span class="text-xs font-bold text-neon">${escapeHTML(meal.hora)}</span><h3 class="mt-1 truncate text-lg font-extrabold">${escapeHTML(meal.nome)}</h3><p class="mt-2 text-xs text-gray-500">${mealFoods(meal).length} alimento(s) · ${rounded(total.kcal)} kcal${outsideWindow}</p><div class="mt-3 flex flex-wrap gap-1.5 text-[10px] font-bold text-gray-300">${macroLine}</div>${meal.observacao ? `<p class="mt-3 line-clamp-2 rounded-2xl bg-white/5 p-3 text-xs text-gray-400">${escapeHTML(meal.observacao)}</p>` : ''}</div><span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-gray-400"><i data-lucide="chevron-right" class="h-5 w-5"></i></span></div></button></article>`;
  }).join('') : '<div class="mol-state"><p class="mol-state-title">Nenhuma refeição neste dia</p><p class="mol-state-copy">Use a edição para escolher em quais dias cada refeição aparece.</p><button type="button" data-empty-add class="mol-state-action mt-5">Adicionar refeição</button></div>';
  $('meal-list').querySelectorAll('[data-open-meal]').forEach(button => button.onclick = () => openMeal(button.dataset.openMeal));
  $('meal-list').querySelector('[data-empty-add]')?.addEventListener('click', () => openMealForm());
  renderEditView();
  window.lucide?.createIcons();
}

function setDietMode(mode) {
  dietMode = mode === 'edit' ? 'edit' : 'view';
  const view = $('diet-content'); const edit = $('diet-edit-content');
  const viewButton = $('diet-mode-view'); const editButton = $('diet-mode-edit');
  if (!view || !edit || !viewButton || !editButton) return;
  const viewing = dietMode === 'view';
  view.classList.toggle('hidden', !viewing); edit.classList.toggle('hidden', viewing);
  viewButton.classList.toggle('bg-neon', viewing); viewButton.classList.toggle('text-black', viewing); viewButton.classList.toggle('text-gray-400', !viewing);
  editButton.classList.toggle('bg-neon', !viewing); editButton.classList.toggle('text-black', !viewing); editButton.classList.toggle('text-gray-400', viewing);
  viewButton.setAttribute('aria-selected', String(viewing)); editButton.setAttribute('aria-selected', String(!viewing));
}

function renderEditView() {
  const list = $('diet-edit-list');
  if (!list) return;
  const sorted = [...meals].sort((a, b) => a.hora.localeCompare(b.hora));
  list.innerHTML = sorted.length ? sorted.map(meal => {
    const total = nutritionTotals([meal]);
    return `<article class="glass-card rounded-3xl p-5"><div class="flex items-start justify-between gap-3"><div class="min-w-0"><span class="text-xs font-bold text-neon">${escapeHTML(meal.hora)}</span><h3 class="mt-1 truncate text-lg font-extrabold">${escapeHTML(meal.nome)}</h3><p class="mt-2 text-xs text-gray-500">${mealFoods(meal).length} alimento(s) · ${rounded(total.kcal)} kcal</p></div><button type="button" data-edit-view="${escapeHTML(meal.id)}" class="min-h-10 rounded-xl mol-soft px-3 text-xs font-bold">Visualizar</button></div><div class="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3"><button type="button" data-edit-meal="${escapeHTML(meal.id)}" class="min-h-11 rounded-xl bg-neon px-3 text-xs font-bold text-black">Editar refeição</button><button type="button" data-edit-foods="${escapeHTML(meal.id)}" class="min-h-11 rounded-xl mol-soft px-3 text-xs font-bold">Alimentos</button><button type="button" data-delete-meal="${escapeHTML(meal.id)}" class="col-span-2 min-h-11 rounded-xl bg-red-500/10 px-3 text-xs font-bold text-red-300 sm:col-span-1">Excluir</button></div></article>`;
  }).join('') : '<div class="mol-state"><p class="mol-state-title">Nenhuma refeição para editar</p><p class="mol-state-copy">Crie sua primeira refeição e adicione quantos alimentos quiser.</p><button type="button" data-edit-empty-add class="mol-state-action mt-5">Nova refeição</button></div>';
  list.querySelectorAll('[data-edit-view]').forEach(button => button.onclick = () => openMeal(button.dataset.editView));
  list.querySelectorAll('[data-edit-meal]').forEach(button => button.onclick = () => openMealForm(button.dataset.editMeal));
  list.querySelectorAll('[data-edit-foods]').forEach(button => button.onclick = () => openMeal(button.dataset.editFoods, { editable: true }));
  list.querySelectorAll('[data-delete-meal]').forEach(button => button.onclick = async () => {
    const meal = meals.find(item => item.id === button.dataset.deleteMeal);
    if (!meal || !await confirmAction({ title: 'Excluir refeição?', message: `${meal.nome} e seus alimentos serão removidos.`, confirmText: 'Excluir', danger: true })) return;
    if (await persist(meals.filter(item => item.id !== meal.id))) showToast('Refeição excluída.', 'success');
  });
  list.querySelector('[data-edit-empty-add]')?.addEventListener('click', () => openMealForm());
}

async function applyDietPlan(plan) {
  const confirmed = await confirmAction({
    title: 'Substituir dieta?',
    message: `${plan.nome} substituirá todas as refeições atuais. Essa ação não altera seus treinos, perfil ou histórico.`,
    confirmText: 'Substituir'
  });
  if (!confirmed) return;
  const button = $('diet-modal')?.querySelector(`[data-import-plan="${escapeHTML(plan.id)}"]`);
  if (button) {
    button.disabled = true;
    button.textContent = 'Importando...';
  }
  const ok = await persist(normalizeDietMeals(plan.refeicoes));
  if (ok) {
    closeModal();
    setDietMode('view');
    showToast('Plano importado na sua dieta.', 'success');
  } else if (button) {
    button.disabled = false;
    button.textContent = 'Substituir dieta atual';
  }
}

function openDietPlanImport() {
  modal('Importar plano', `<div class="space-y-3">${DIET_PLANS.map(plan => `<article class="rounded-2xl mol-soft p-4"><div class="flex items-start justify-between gap-3"><div><strong class="text-sm">${escapeHTML(plan.nome)}</strong><p class="mt-1 text-xs leading-relaxed text-gray-500">${escapeHTML(plan.descricao)}</p><p class="mt-2 text-xs text-gray-400">${normalizeDietMeals(plan.refeicoes).length} refeição(ões)</p></div><button type="button" data-import-plan="${escapeHTML(plan.id)}" class="min-h-11 shrink-0 rounded-xl bg-neon px-3 text-xs font-bold text-black">Substituir dieta atual</button></div></article>`).join('')}</div>`);
  $('diet-modal').querySelectorAll('[data-import-plan]').forEach(button => {
    const plan = DIET_PLANS.find(item => item.id === button.dataset.importPlan);
    button.onclick = () => plan && applyDietPlan(plan);
  });
}

function openFastingForm() {
  const value = normalizeFastingSettings(fasting);
  const dayLabels = [['0','Dom'], ['1','Seg'], ['2','Ter'], ['3','Qua'], ['4','Qui'], ['5','Sex'], ['6','Sab']];
  modal('Jejum intermitente', `<label class="flex min-h-16 cursor-pointer items-center justify-between gap-4 rounded-2xl mol-soft p-4"><span><strong class="block text-sm">Acompanhar jejum</strong><small class="mt-1 block text-xs text-gray-500">Mostra janela alimentar e fases estimadas.</small></span><span class="relative shrink-0"><input id="fasting-enabled" type="checkbox" class="peer sr-only" ${value.ativo ? 'checked' : ''}><span class="block h-7 w-12 rounded-full bg-white/10 transition-colors peer-checked:bg-neon"></span><span class="absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-5"></span></span></label><label class="mt-4 block text-xs font-bold text-gray-400">Protocolo<select id="fasting-protocol" class="mt-2 min-h-12 w-full rounded-xl mol-field px-4">${FASTING_PROTOCOLS.map(item => `<option value="${item.id}" ${item.id === value.protocolo ? 'selected' : ''}>${item.label}</option>`).join('')}</select></label><div class="fasting-time-grid mt-4"><label class="fasting-time-field text-xs font-bold text-gray-400"><span>Quando começa o jejum</span><input id="fasting-start" type="time" aria-label="Horário em que começa o jejum" value="${escapeHTML(value.fimJanela)}" class="mt-2 min-h-12 w-full rounded-xl mol-field px-3"></label><label class="fasting-time-field text-xs font-bold text-gray-400"><span>Quando termina o jejum</span><input id="fasting-end" type="time" aria-label="Horário em que termina o jejum" value="${escapeHTML(value.inicioJanela)}" class="mt-2 min-h-12 w-full rounded-xl mol-field px-3"></label></div><p class="mt-4 text-xs font-bold uppercase tracking-wider text-neon">Dias da semana</p><div class="mt-2 grid grid-cols-4 gap-2">${dayLabels.map(([day,label]) => `<label><input class="peer sr-only" type="checkbox" data-fasting-day="${day}" ${value.diasSemana.includes(Number(day)) ? 'checked' : ''}><span class="flex min-h-10 items-center justify-center rounded-xl bg-white/5 px-2 text-xs font-bold text-gray-400 peer-checked:bg-neon peer-checked:text-black">${label}</span></label>`).join('')}</div><label class="mt-4 block text-xs font-bold text-gray-400">Treino durante jejum<select id="fasting-training" class="mt-2 min-h-12 w-full rounded-xl mol-field px-4"><option value="flexivel" ${value.treino === 'flexivel' ? 'selected' : ''}>Depende do dia</option><option value="jejum" ${value.treino === 'jejum' ? 'selected' : ''}>Costumo treinar em jejum</option><option value="alimentado" ${value.treino === 'alimentado' ? 'selected' : ''}>Prefiro treinar alimentado</option></select></label><label class="mt-4 flex min-h-14 cursor-pointer items-center justify-between gap-4 rounded-2xl mol-soft p-4"><span><strong class="block text-sm">Pausar hoje</strong><small class="mt-1 block text-xs text-gray-500">Mantém a configuração, mas não mostra cobrança hoje.</small></span><span class="relative shrink-0"><input id="fasting-paused" type="checkbox" class="peer sr-only" ${value.pausadoHoje ? 'checked' : ''}><span class="block h-7 w-12 rounded-full bg-white/10 transition-colors peer-checked:bg-neon"></span><span class="absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-5"></span></span></label><p class="mt-4 text-xs leading-relaxed text-gray-500">As fases são estimativas educacionais, não orientação médica. Interrompa o jejum se passar mal.</p><div class="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2"><button id="delete-fasting" type="button" class="min-h-12 rounded-2xl bg-red-500/10 px-4 text-sm font-bold text-red-300">Remover jejum</button><button id="save-fasting" type="button" class="min-h-12 rounded-2xl bg-neon px-4 font-bold text-black">Salvar jejum</button></div>`);
  $('fasting-protocol').onchange = () => { $('fasting-start').disabled = $('fasting-protocol').value !== 'custom'; };
  $('fasting-protocol').onchange();
  $('delete-fasting').onclick = async () => {
    $('delete-fasting').disabled = true;
    $('delete-fasting').textContent = 'Removendo...';
    const next = normalizeFastingSettings({ ativo: false, pausadoHoje: false });
    if (await persistFasting(next)) { closeModal(); showToast('Jejum removido.', 'success'); }
    else { $('delete-fasting').disabled = false; $('delete-fasting').textContent = 'Remover jejum'; }
  };
  $('save-fasting').onclick = async () => {
    const enabled = $('fasting-enabled').checked;
    const days = [...$('diet-modal').querySelectorAll('[data-fasting-day]:checked')].map(input => Number(input.dataset.fastingDay));
    const next = normalizeFastingSettings({ ativo: enabled, protocolo: $('fasting-protocol').value, inicioJanela: $('fasting-end').value, fimJanela: $('fasting-start').value, diasSemana: days, treino: $('fasting-training').value, pausadoHoje: enabled && $('fasting-paused').checked });
    if (next.ativo && !next.diasSemana.length) return showToast('Escolha ao menos um dia da semana.');
    $('save-fasting').disabled = true; $('save-fasting').textContent = 'Salvando...';
    if (await persistFasting(next)) { closeModal(); showToast(next.ativo ? 'Jejum atualizado.' : 'Jejum removido.', 'success'); }
    else { $('save-fasting').disabled = false; $('save-fasting').textContent = 'Salvar jejum'; }
  };
}

function openMealForm(mealId = null) {
  const existing = meals.find(item => item.id === mealId);
  const value = existing || { id: newId(), nome: '', hora: '12:00', alimentos: [] };
  modal(existing ? 'Editar refeição' : 'Nova refeição', `<p class="text-xs font-bold uppercase tracking-wider text-neon">Escolha um momento do dia ou personalize</p><div id="meal-name-options" class="mt-3 flex gap-2 overflow-x-auto pb-2">${MEAL_NAMES.map(name => `<button type="button" data-meal-name="${escapeHTML(name)}" class="shrink-0 rounded-full mol-soft px-3 py-2 text-xs font-bold text-gray-300">${escapeHTML(name)}</button>`).join('')}</div><label class="mt-3 block text-xs font-bold text-gray-400">Nome<input id="meal-name" maxlength="60" autocomplete="off" value="${escapeHTML(value.nome)}" class="mt-2 min-h-12 w-full rounded-xl mol-field px-4 text-white" placeholder="Ex.: Café da manhã"></label><label class="mt-4 block text-xs font-bold text-gray-400">Horário<input id="meal-time" type="time" value="${escapeHTML(value.hora)}" class="mt-2 min-h-12 w-full rounded-xl mol-field px-4 text-white"></label><p class="mt-4 text-xs font-bold uppercase tracking-wider text-neon">Dias da semana</p><div class="mt-2 grid grid-cols-4 gap-2">${DAY_LABELS.map((label, day) => `<label><input class="peer sr-only" type="checkbox" data-meal-day="${day}" ${(value.diasSemana || [0,1,2,3,4,5,6]).includes(day) ? 'checked' : ''}><span class="flex min-h-10 items-center justify-center rounded-xl bg-white/5 px-2 text-xs font-bold text-gray-400 peer-checked:bg-neon peer-checked:text-black">${label}</span></label>`).join('')}</div><label class="mt-4 block text-xs font-bold text-gray-400">Observacao<textarea id="meal-note" maxlength="500" class="mt-2 min-h-24 w-full rounded-xl mol-field px-4 py-3 text-white" placeholder="Ex.: feijao opcional, sabado sem jantar, usar 300 g em alguns dias">${escapeHTML(value.observacao || '')}</textarea></label><button id="save-meal" type="button" class="mt-6 min-h-12 w-full rounded-2xl bg-neon font-bold text-black">Salvar refeição</button>`);
  $('meal-name').focus();
  $('meal-name-options').querySelectorAll('[data-meal-name]').forEach(button => button.onclick = () => { $('meal-name').value = button.dataset.mealName; });
  $('save-meal').onclick = async () => {
    const days = [...$('diet-modal').querySelectorAll('[data-meal-day]:checked')].map(input => Number(input.dataset.mealDay));
    if (!days.length) return showToast('Escolha ao menos um dia da semana.');
    const updated = { ...value, nome: $('meal-name').value.trim(), hora: $('meal-time').value, diasSemana: days, observacao: $('meal-note')?.value.trim() || '' };
    const error = validateMeal(updated); if (error) return showToast(error);
    if (!existing && meals.length >= 12) return showToast('O limite é de 12 refeições.');
    const next = clone(meals); const index = next.findIndex(item => item.id === updated.id); if (index >= 0) next[index] = updated; else next.push(updated);
    $('save-meal').disabled = true; $('save-meal').textContent = 'Salvando...'; if (await persist(next)) { closeModal(); showToast('Refeição salva.', 'success'); } else { $('save-meal').disabled = false; $('save-meal').textContent = 'Salvar refeição'; }
  };
}

function foodCard(food, removable = true) {
  const nutrients = foodNutrients(food);
  return `<article class="rounded-2xl mol-soft p-4"><div class="flex items-start justify-between gap-3"><div><strong class="text-sm">${escapeHTML(food.nome)}</strong><p class="mt-1 text-xs text-gray-500">${food.gramas} g · ${rounded(nutrients.kcal)} kcal · P ${rounded(nutrients.protein)} · C ${rounded(nutrients.carbs)} · G ${rounded(nutrients.fat)}</p></div>${removable ? `<button type="button" data-remove-food="${escapeHTML(food.id)}" class="min-h-10 text-xs font-bold text-red-300">Remover</button>` : ''}</div></article>`;
}

function optionGroupsHTML(meal) {
  const groups = mealOptionGroups(meal);
  if (!groups.length) return '';
  return groups.map(group => `<section class="mt-4"><p class="text-xs font-bold uppercase tracking-wider text-gray-400">${escapeHTML(group.nome)}${group.modo === 'alternativas' ? '  escolha uma' : ''}</p><div class="mt-2 space-y-2">${group.opcoes.map(option => `<article class="rounded-2xl border border-white/10 p-3"><strong class="text-sm text-neon">${escapeHTML(option.nome)}</strong><div class="mt-2 space-y-2">${option.alimentos.map(food => foodCard(food, false)).join('')}</div></article>`).join('')}</div></section>`).join('');
}

function openMeal(mealId, { editable = dietMode === 'edit' } = {}) {
  const meal = meals.find(item => item.id === mealId); if (!meal) return;
  const total = nutritionTotals([meal]);
  const equivalents = equivalentSuggestions(meal);
  const equivalentsHTML = equivalents.length ? `<section class="mt-5 rounded-2xl mol-soft p-4 text-left"><p class="text-xs font-bold uppercase tracking-wider text-neon">Trocas equivalentes</p><div class="mt-3 space-y-3">${equivalents.map(item => `<div><p class="text-xs font-bold text-gray-300">${escapeHTML(item.base)}</p><p class="mt-1 text-xs leading-relaxed text-gray-500">${item.options.map(option => escapeHTML(option)).join(' · ')}</p></div>`).join('')}</div></section>` : '';
  const editTools = editable ? `<button id="add-food" type="button" class="mt-5 min-h-12 w-full rounded-2xl bg-neon font-bold text-black">Adicionar alimento</button><section class="mt-4"><p class="text-xs font-bold uppercase tracking-wider text-gray-400">Combinações rápidas</p><div id="meal-combinations" class="mt-2 flex gap-2 overflow-x-auto pb-1">${MEAL_COMBINATIONS.map((item, index) => `<button type="button" data-combination="${index}" class="shrink-0 rounded-xl mol-soft px-3 py-2 text-xs font-bold text-gray-300">+ ${item.label}</button>`).join('')}</div></section>` : '';
  const editActions = editable ? '<div class="mt-6 grid grid-cols-2 gap-3"><button id="edit-meal" type="button" class="min-h-11 rounded-xl mol-soft text-sm font-bold">Editar</button><button id="delete-meal" type="button" class="min-h-11 rounded-xl bg-red-500/10 text-sm font-bold text-red-300">Excluir</button></div>' : '';
  modal(meal.nome, `<p class="text-sm text-neon">${escapeHTML(meal.hora)} · ${rounded(total.kcal)} kcal</p><div class="mt-4 grid grid-cols-3 gap-2 text-center text-xs"><span class="rounded-xl mol-soft p-2">P ${rounded(total.protein)} g</span><span class="rounded-xl mol-soft p-2">C ${rounded(total.carbs)} g</span><span class="rounded-xl mol-soft p-2">G ${rounded(total.fat)} g</span></div>${meal.observacao ? `<p class="mt-4 rounded-2xl mol-soft p-4 text-sm text-gray-400">${escapeHTML(meal.observacao)}</p>` : ''}${editTools}<div id="meal-foods" class="mt-4 space-y-2"></div>${optionGroupsHTML(meal)}${equivalentsHTML}${editActions}`);
  $('meal-foods').innerHTML = meal.alimentos.length ? meal.alimentos.map(food => foodCard(food, editable)).join('') : '<p class="py-6 text-center text-sm text-gray-500">Nenhum alimento fixo nesta refeição.</p>';
  if (!editable) return;
  $('add-food').onclick = () => openFoodSearch(meal.id); $('edit-meal').onclick = () => openMealForm(meal.id);
  $('meal-combinations').querySelectorAll('[data-combination]').forEach(button => button.onclick = async () => {
    const combination = MEAL_COMBINATIONS[Number(button.dataset.combination)]; const next = clone(meals); const target = next.find(item => item.id === meal.id);
    if (!combination || !target) return;
    const foods = combination.foods.map(([name, grams]) => { const food = catalogFood(name); return food ? { id: newId(), ...food, gramas: grams } : null; }).filter(Boolean);
    if (target.alimentos.length + foods.length > 50) return showToast('Essa refeição atingiu o limite de 50 alimentos.');
    target.alimentos.push(...foods);
    if (await persist(next)) { closeModal(); openMeal(meal.id, { editable: true }); showToast(`${combination.label} adicionados à refeição.`, 'success'); }
  });
  $('delete-meal').onclick = async () => { if (!await confirmAction({ title: 'Excluir refeição?', message: `${meal.nome} e seus alimentos serão removidos.`, confirmText: 'Excluir', danger: true })) return; const next = meals.filter(item => item.id !== meal.id); if (await persist(next)) { closeModal(); showToast('Refeição excluída.', 'success'); } };
  $('meal-foods').querySelectorAll('[data-remove-food]').forEach(button => button.onclick = async () => { const next = clone(meals); const target = next.find(item => item.id === meal.id); target.alimentos = target.alimentos.filter(food => food.id !== button.dataset.removeFood); if (await persist(next)) { closeModal(); openMeal(meal.id, { editable: true }); showToast('Alimento removido.', 'success'); } });
  $('add-food').focus();
}

function chooseMealForFood() {
  if (!meals.length) return showToast('Crie uma refeição antes de adicionar alimentos.');
  if (meals.length === 1) return openFoodSearch(meals[0].id);
  modal('Escolha a refeição', meals.map(meal => `<button type="button" data-target-meal="${escapeHTML(meal.id)}" class="mb-2 min-h-12 w-full rounded-xl mol-soft px-4 text-left text-sm font-bold">${escapeHTML(meal.hora)} · ${escapeHTML(meal.nome)}</button>`).join(''));
  $('diet-modal').querySelectorAll('[data-target-meal]').forEach(button => button.onclick = () => openFoodSearch(button.dataset.targetMeal));
  $('diet-modal').querySelector('[data-target-meal]')?.focus();
}

function openFoodSearch(mealId) {
  modal('Buscar alimento', `<label class="flex min-h-12 items-center gap-3 rounded-xl mol-soft px-4"><i data-lucide="search" class="h-4 w-4 text-gray-500"></i><span class="sr-only">Buscar alimento</span><input id="food-query" type="search" placeholder="Ex.: arroz, frango, banana" class="min-w-0 flex-1 bg-transparent text-sm outline-none"></label><button id="custom-food" type="button" class="mt-3 min-h-11 w-full rounded-xl border border-neon/30 text-xs font-bold text-neon">Cadastrar alimento personalizado</button><p class="mt-3 text-[11px] leading-relaxed text-gray-500">Catálogo local com valores médios por 100 g. Confira o rótulo quando usar um produto específico.</p><div id="food-results" class="mt-4 space-y-2"></div>`);
  const paint = () => { const term = $('food-query').value.trim().toLocaleLowerCase('pt-BR'); const list = searchFoodCatalog(term); $('food-results').innerHTML = list.map((food, index) => `<button type="button" data-food-index="${index}" class="min-h-14 w-full rounded-2xl mol-soft p-3 text-left"><strong class="text-sm">${escapeHTML(food.nome)}</strong><span class="mt-1 block text-xs text-gray-500">${food.kcal100} kcal · P ${food.proteina100} · C ${food.carbo100} · G ${food.gordura100} por 100 g</span></button>`).join('') || '<p class="py-6 text-center text-sm text-gray-500">Nenhum alimento encontrado.</p>'; $('food-results').querySelectorAll('[data-food-index]').forEach((button, index) => button.onclick = () => openFoodForm(mealId, list[index])); };
  $('food-query').oninput = paint; $('custom-food').onclick = () => openFoodForm(mealId, null); paint(); $('food-query').focus(); window.lucide?.createIcons();
}

function openFoodForm(mealId, catalogFood) {
  const food = catalogFood || { nome: '', kcal100: 0, proteina100: 0, carbo100: 0, gordura100: 0 };
  modal(catalogFood ? 'Definir porção' : 'Novo alimento', `<label class="block text-xs font-bold text-gray-400">Alimento<input id="food-name" maxlength="80" value="${escapeHTML(food.nome)}" class="mt-2 min-h-12 w-full rounded-xl mol-field px-4"></label><label class="mt-4 block text-xs font-bold text-gray-400">Porção (g)<input id="food-grams" type="number" min="1" max="5000" step="1" value="100" class="mt-2 min-h-12 w-full rounded-xl mol-field px-4"></label><p class="mt-5 text-xs font-bold uppercase tracking-wider text-neon">Valores por 100 g</p><div class="mt-3 grid grid-cols-2 gap-3">${[['food-kcal','Kcal',food.kcal100,1000],['food-protein','Proteína',food.proteina100,100],['food-carbs','Carboidrato',food.carbo100,100],['food-fat','Gordura',food.gordura100,100]].map(([id,label,value,max]) => `<label class="text-xs text-gray-400">${label}<input id="${id}" type="number" min="0" max="${max}" step="0.1" value="${value}" class="mt-1 min-h-11 w-full rounded-xl mol-field px-3"></label>`).join('')}</div><button id="save-food" type="button" class="mt-6 min-h-12 w-full rounded-2xl bg-neon font-bold text-black">Adicionar alimento</button>`);
  $(catalogFood ? 'food-grams' : 'food-name').focus();
  $('save-food').onclick = async () => { const value = { id: newId(), nome: $('food-name').value.trim(), gramas: Number($('food-grams').value), kcal100: Number($('food-kcal').value), proteina100: Number($('food-protein').value), carbo100: Number($('food-carbs').value), gordura100: Number($('food-fat').value) }; const error = validateFood(value); if (error) return showToast(error); const next = clone(meals); const target = next.find(item => item.id === mealId); if (!target) return; if (target.alimentos.length >= 50) return showToast('O limite é de 50 alimentos por refeição.'); target.alimentos.push(value); $('save-food').disabled = true; if (await persist(next)) { closeModal(); openMeal(mealId); showToast('Alimento adicionado.', 'success'); } else $('save-food').disabled = false; };
}

function openRequestedMeal() {
  if (!pendingRequestedMealId) return;
  const target = meals.find(meal => meal.id === pendingRequestedMealId);
  if (!target) return;
  pendingRequestedMealId = null;
  setDietMode('view');
  window.setTimeout(() => openMeal(target.id, { editable: false }), 0);
}

function showDietContent() {
  $('diet-status').classList.add('hidden');
  $('diet-content').classList.remove('hidden');
  $('add-meal').disabled = false;
  document.body.setAttribute('aria-busy', 'false');
  render();
  openRequestedMeal();
  clearInterval(mealClock);
  mealClock = setInterval(render, 60000);
}

async function load() {
  const cached = readDietCache(user.uid);
  if (cached) {
    meals = cached.meals;
    if (cached.goals) goals = cached.goals;
    if (cached.fasting) fasting = cached.fasting;
    showDietContent();
  }
  try {
    const [dietResult, profileResult] = await Promise.allSettled([
      withTimeout(getDoc(doc(db, 'dietas', user.uid)), 'A dieta'),
      withTimeout(getDoc(doc(db, 'users', user.uid)), 'O perfil')
    ]);
    if (dietResult.status === 'rejected') throw dietResult.reason;
    const dietData = dietResult.value.data() || {};
    meals = normalizeDietMeals(dietData.refeicoes || []);
    fasting = normalizeFastingSettings(dietData.jejum);
    if (profileResult.status === 'fulfilled') {
      const profile = profileResult.value.data() || {};
      goals = {
        kcal: goalValue(profile.metaCalorias ?? profile.dailyCalorieGoal, 2400, 10000),
        protein: goalValue(profile.macroGoals?.protein, 180, 1000),
        carbs: goalValue(profile.macroGoals?.carbs, 250, 1000),
        fat: goalValue(profile.macroGoals?.fat, 70, 1000)
      };
    } else console.warn('Metas nutricionais não carregadas; usando valores locais:', profileResult.reason?.message);
    writeDietCache();
    showDietContent();
  } catch (error) {
    console.error('Dieta não carregada:', error);
    document.body.setAttribute('aria-busy', 'false');
    if (cached) {
      return;
    }
    $('add-meal').disabled = true;
    const message = error?.code === 'permission-denied'
      ? 'Sua dieta ainda não está liberada pelas regras do banco.'
      : 'Não foi possível carregar sua dieta.';
    $('diet-status').innerHTML = `<div class="mol-state"><p class="mol-state-title">${message}</p><button id="retry-diet" type="button" class="mol-state-action mt-4">Tentar novamente</button></div>`;
    $('retry-diet').onclick = load;
    showToast(message);
  }
}

$('add-meal').onclick = () => openMealForm(); $('food-search').onclick = chooseMealForFood;
$('edit-add-meal').onclick = () => openMealForm();
$('import-diet-plan').onclick = openDietPlanImport;
$('diet-mode-view').onclick = () => setDietMode('view');
$('diet-mode-edit').onclick = () => setDietMode('edit');
watchProtectedPage(account => { user = account; void load(); });
