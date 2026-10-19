// Diário de refeições: o que a pessoa comeu de fato no dia (o plano fica em dietas/{uid}).
// Um documento por dia: diario/{uid}_{AAAA-MM-DD} = { userId, data, itens, aguaMl }.
import { foodNutrients, mealFoods } from './nutrition.js';
import { dateFrom } from './evolution-analytics.js';

export const DIARY_LIMITS = { items: 80, waterMl: 10000, waterStep: 250 };

/** Data local no formato AAAA-MM-DD (o dia da pessoa, não o UTC). */
export function dayKey(date = new Date()) {
  const pad = value => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export const diaryDocId = (uid, key = dayKey()) => `${uid}_${key}`;

const newId = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const number = (value, max) => Math.min(max, Math.max(0, Number(value) || 0));

function entryFrom(food, extra = {}) {
  return {
    id: newId(),
    nome: String(food?.nome || 'Alimento').trim().slice(0, 80),
    gramas: number(food?.gramas, 5000),
    kcal100: number(food?.kcal100, 1000),
    proteina100: number(food?.proteina100, 100),
    carbo100: number(food?.carbo100, 100),
    gordura100: number(food?.gordura100, 100),
    ...extra
  };
}

/** Documento do dia sempre no mesmo formato, descartando o que estiver fora dos limites. */
export function normalizeDiary(data = {}) {
  const itens = (Array.isArray(data?.itens) ? data.itens : []).slice(0, DIARY_LIMITS.items).map(item => entryFrom(item, {
    id: String(item?.id || newId()).slice(0, 80),
    refeicaoId: item?.refeicaoId ? String(item.refeicaoId).slice(0, 80) : null,
    hora: /^\d{2}:\d{2}$/.test(item?.hora || '') ? item.hora : ''
  }));
  return { itens, aguaMl: number(data?.aguaMl, DIARY_LIMITS.waterMl) };
}

export function diaryTotals(diary) {
  return normalizeDiary(diary).itens.reduce((total, item) => {
    const value = foodNutrients(item);
    Object.keys(total).forEach(key => { total[key] += value[key]; });
    return total;
  }, { kcal: 0, protein: 0, carbs: 0, fat: 0 });
}

export const mealLogged = (diary, mealId) => normalizeDiary(diary).itens.some(item => item.refeicaoId === mealId);

/** Marca ou desmarca a refeição do plano como comida (todos os alimentos dela). */
export function toggleMeal(diary, meal, time = '') {
  const current = normalizeDiary(diary);
  if (mealLogged(current, meal.id)) return { ...current, itens: current.itens.filter(item => item.refeicaoId !== meal.id) };
  const added = mealFoods(meal).map(food => entryFrom(food, { refeicaoId: meal.id, hora: time }));
  if (current.itens.length + added.length > DIARY_LIMITS.items) throw new Error(`O diário aceita até ${DIARY_LIMITS.items} itens por dia.`);
  return { ...current, itens: [...current.itens, ...added] };
}

/** Alimento comido fora do plano. */
export function addFood(diary, food, time = '') {
  const current = normalizeDiary(diary);
  if (current.itens.length >= DIARY_LIMITS.items) throw new Error(`O diário aceita até ${DIARY_LIMITS.items} itens por dia.`);
  return { ...current, itens: [...current.itens, entryFrom(food, { refeicaoId: null, hora: time })] };
}

export const removeItem = (diary, itemId) => {
  const current = normalizeDiary(diary);
  return { ...current, itens: current.itens.filter(item => item.id !== itemId) };
};

export function changeWater(diary, deltaMl) {
  const current = normalizeDiary(diary);
  return { ...current, aguaMl: number(current.aguaMl + deltaMl, DIARY_LIMITS.waterMl) };
}

/** Meta de água: 35 ml por kg, arredondada para copos de 250 ml; sem peso, 2 litros. */
export function waterGoalMl(weightKg) {
  const kg = Number(weightKg);
  if (!(kg >= 20 && kg <= 400)) return 2000;
  return Math.round((kg * 35) / DIARY_LIMITS.waterStep) * DIARY_LIMITS.waterStep;
}

/** Nome do treino concluído no dia (ou ''), para puxar a meta de proteína. */
export function workoutOnDay(sessions, key = dayKey()) {
  const done = sessions.find(session => { const date = dateFrom(session?.concluidoEm); return date && dayKey(date) === key; });
  return done ? String(done.nomeRotina || 'Treino') : '';
}

/** Marca como comidas todas as refeições do plano que ainda faltam. */
export function logAllMeals(diary, meals, time = '') {
  return meals.filter(meal => mealFoods(meal).length && !mealLogged(diary, meal.id)).reduce((current, meal) => toggleMeal(current, meal, time), normalizeDiary(diary));
}
