import { mealFoods, mealAppliesToDay, nutritionTotals, foodNutrients } from './nutrition.js';

const plain = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const macros = ['protein', 'carbs', 'fat'];
const finite = value => Number.isFinite(Number(value)) && Number(value) >= 0;

export function suggestedMealIds(meals) {
  return meals.filter(meal => /almoco|jantar|janta\b/.test(plain(meal.nome))).map(meal => meal.id);
}

// A slot is a particular meal on a particular day, rather than a daily macro goal.
export function weeklyMealSlots(meals, mealIds, startDay = 0) {
  return Array.from({ length: 7 }, (_, offset) => (startDay + offset) % 7).flatMap(day =>
    meals.filter(meal => mealIds.includes(meal.id) && mealAppliesToDay(meal, day)).map(meal => ({
      key: `${day}:${meal.id}`, day, mealId: meal.id, name: meal.nome,
      target: nutritionTotals([meal]), foods: mealFoods(meal)
    }))
  );
}

export function validatePrepIngredients(ingredients) {
  if (!Array.isArray(ingredients) || !ingredients.length || ingredients.length > 20) throw new Error('Escolha entre 1 e 20 ingredientes.');
  ingredients.forEach(item => {
    if (!String(item.nome || '').trim()) throw new Error('Informe o nome do ingrediente.');
    if (!['adjustable', 'fixed'].includes(item.mode)) throw new Error('Escolha como ajustar o ingrediente.');
    for (const field of ['proteina100', 'carbo100', 'gordura100']) {
      if (!finite(item[field]) || Number(item[field]) > 100) throw new Error('Confira os nutrientes por 100 g.');
    }
    if (!finite(item.kcal100) || Number(item.kcal100) > 1000) throw new Error('Confira as calorias por 100 g.');
    if (!finite(item.grams) || Number(item.grams) > 2000) throw new Error('A porção deve ficar entre 0 e 2.000 g.');
    if (!finite(item.yieldFactor) || Number(item.yieldFactor) <= 0 || Number(item.yieldFactor) > 10) throw new Error('O rendimento deve ficar acima de 0 e até 10.');
  });
}

export function fitPortion(target, ingredients) {
  validatePrepIngredients(ingredients);
  if (macros.some(key => !finite(target?.[key]))) throw new Error('A refeição não tem uma referência nutricional válida.');
  if (macros.every(key => Number(target[key]) === 0)) throw new Error('Cadastre os nutrientes da refeição na aba Dieta.');
  const vectors = ingredients.map(item => foodNutrients({ ...item, gramas: 100 }));
  const grams = ingredients.map(item => item.mode === 'fixed' ? Number(item.grams) : 0);
  const totals = () => vectors.reduce((sum, v, index) => {
    macros.forEach(key => { sum[key] += v[key] * grams[index] / 100; });
    return sum;
  }, { protein: 0, carbs: 0, fat: 0 });
  // Bounded, non-negative coordinate descent. All nutrients of every food count.
  // Normalized residuals give low-fat targets the same relative importance.
  const weights = Object.fromEntries(macros.map(key => [key, 1 / Math.max(5, target[key]) ** 2]));
  for (let pass = 0; pass < 200; pass++) {
    let movement = 0;
    ingredients.forEach((item, index) => {
      if (item.mode === 'fixed') return;
      const current = totals();
      let numerator = 0;
      let denominator = 0;
      macros.forEach(key => {
        const coefficient = vectors[index][key] / 100;
        numerator += weights[key] * coefficient * (target[key] - current[key]);
        denominator += weights[key] * coefficient ** 2;
      });
      if (!denominator) return;
      const next = Math.max(0, Math.min(2000, grams[index] + numerator / denominator));
      movement += Math.abs(next - grams[index]);
      grams[index] = next;
    });
    if (movement < 0.001) break;
  }
  const portions = ingredients.map((item, index) => ({ ...item, gramas: Math.round(grams[index]) }));
  const actual = nutritionTotals([{ alimentos: portions }]);
  const difference = Object.fromEntries(macros.map(key => [key, actual[key] - target[key]]));
  const matched = macros.every(key => Math.abs(difference[key]) <= Math.max(2, target[key] * 0.08));
  return { portions, target, actual, difference, matched };
}

export function calculatePreparation(people, ingredients) {
  validatePrepIngredients(ingredients);
  if (!Array.isArray(people) || !people.length) throw new Error('Selecione as refeições que vai preparar.');
  const pots = people.flatMap(person => person.slots.map(slot => ({
    personId: person.id, personName: person.name, key: slot.key, day: slot.day, meal: slot.name,
    ...fitPortion(slot.target, ingredients)
  })));
  if (!pots.length || pots.length > 56) throw new Error('Selecione entre 1 e 56 marmitas.');
  const batch = ingredients.map((item, index) => {
    const cookedGrams = pots.reduce((sum, pot) => sum + pot.portions[index].gramas, 0);
    return { ...item, cookedGrams, rawGrams: item.yieldConfirmed === false ? null : Math.ceil(cookedGrams / Number(item.yieldFactor)) };
  });
  return { pots, batch, potCount: pots.length, matched: pots.every(pot => pot.matched) };
}

export function divideActualYield(preparation, actualGrams) {
  if (actualGrams.length !== preparation.batch.length || actualGrams.some(value => !finite(value))) throw new Error('Confira os pesos prontos.');
  const shortfall = actualGrams.some((value, index) => Number(value) < preparation.batch[index].cookedGrams * 0.95);
  // Largest remainder keeps all pot weights integral and conserves the measured batch.
  const allocated = preparation.batch.map((item, index) => {
    const measured = Math.round(Number(actualGrams[index]));
    if (!item.cookedGrams) return preparation.pots.map(() => 0);
    const exact = preparation.pots.map(pot => measured * pot.portions[index].gramas / item.cookedGrams);
    const values = exact.map(Math.floor);
    const remaining = measured - values.reduce((sum, value) => sum + value, 0);
    exact.map((value, pot) => ({ pot, remainder: value - values[pot] })).sort((a, b) => b.remainder - a.remainder).slice(0, remaining).forEach(({ pot }) => { values[pot]++; });
    return values;
  });
  const pots = preparation.pots.map((pot, potIndex) => {
    const portions = pot.portions.map((item, index) => ({ ...item, gramas: allocated[index][potIndex] }));
    const actual = nutritionTotals([{ alimentos: portions }]);
    const difference = Object.fromEntries(macros.map(key => [key, actual[key] - pot.target[key]]));
    const matched = macros.every(key => Math.abs(difference[key]) <= Math.max(2, pot.target[key] * 0.08));
    return { ...pot, portions, actual, difference, matched };
  });
  return { ...preparation, pots, matched: pots.every(pot => pot.matched), actualGrams: actualGrams.map(Number), shortfall };
}
