export const FOOD_CATALOG = [
  ['Arroz branco cozido', 128, 2.5, 28.1, 0.2], ['Feijão carioca cozido', 76, 4.8, 13.6, 0.5],
  ['Peito de frango grelhado', 159, 32, 0, 2.5], ['Ovo cozido', 146, 13.3, 0.6, 9.5],
  ['Carne bovina magra grelhada', 219, 35.9, 0, 7.3], ['Batata-doce cozida', 77, 0.6, 18.4, 0.1],
  ['Aveia em flocos', 394, 13.9, 66.6, 8.5], ['Banana', 98, 1.3, 26, 0.1],
  ['Leite integral', 61, 2.9, 4.5, 3.2], ['Iogurte natural integral', 51, 4.1, 1.9, 3],
  ['Pão francês', 300, 8, 58.6, 3.1], ['Queijo muçarela', 330, 22.6, 3, 25.2],
  ['Azeite de oliva', 884, 0, 0, 100], ['Brócolis cozido', 25, 2.1, 4.4, 0.5],
  ['Whey protein', 400, 80, 10, 6]
].map(([nome, kcal100, proteina100, carbo100, gordura100]) => ({ nome, kcal100, proteina100, carbo100, gordura100 }));

const number = value => Number.isFinite(Number(value)) ? Number(value) : 0;
const bounded = (value, min, max, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= min && parsed <= max ? parsed : fallback;
};
const validTime = value => /^([01]\d|2[0-3]):[0-5]\d$/.test(String(value || '')) ? String(value) : '12:00';
export function foodNutrients(food) {
  const factor = bounded(food?.gramas, 0, 5000) / 100;
  return {
    kcal: bounded(food?.kcal100, 0, 1000) * factor,
    protein: bounded(food?.proteina100, 0, 100) * factor,
    carbs: bounded(food?.carbo100, 0, 100) * factor,
    fat: bounded(food?.gordura100, 0, 100) * factor
  };
}
export function nutritionTotals(meals) {
  return (Array.isArray(meals) ? meals : []).flatMap(meal => Array.isArray(meal?.alimentos) ? meal.alimentos : []).reduce((total, food) => { const value = foodNutrients(food); Object.keys(total).forEach(key => { total[key] += value[key]; }); return total; }, { kcal: 0, protein: 0, carbs: 0, fat: 0 });
}
export function normalizeDietMeals(meals) {
  return (Array.isArray(meals) ? meals : []).slice(0, 12).map((mealValue, mealIndex) => {
    const meal = mealValue && typeof mealValue === 'object' ? mealValue : {};
    return {
      id: String(meal.id || `legacy-meal-${mealIndex}`).slice(0, 100),
      nome: String(meal.nome || 'Refeição').trim().slice(0, 60) || 'Refeição',
      hora: validTime(meal.hora),
      alimentos: (Array.isArray(meal.alimentos) ? meal.alimentos : Array.isArray(meal.itens) ? meal.itens : []).slice(0, 50).map((foodValue, foodIndex) => {
        const food = foodValue && typeof foodValue === 'object' ? foodValue : {};
        return {
          id: String(food.id || `legacy-food-${foodIndex}`).slice(0, 100),
          nome: String(food.nome || 'Alimento').trim().slice(0, 80) || 'Alimento',
          gramas: bounded(food.gramas ?? food.porcao, 1, 5000, 100),
          kcal100: bounded(food.kcal100 ?? food.calorias, 0, 1000),
          proteina100: bounded(food.proteina100 ?? food.proteinas, 0, 100),
          carbo100: bounded(food.carbo100 ?? food.carboidratos, 0, 100),
          gordura100: bounded(food.gordura100 ?? food.gorduras, 0, 100)
        };
      })
    };
  });
}
export function validateMeal(meal) {
  if (!String(meal.nome || '').trim() || String(meal.nome).trim().length > 60) return 'Informe um nome de até 60 caracteres.';
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(meal.hora || '')) return 'Informe um horário válido.';
  return '';
}
export function validateFood(food) {
  if (!String(food.nome || '').trim() || String(food.nome).trim().length > 80) return 'Informe um nome de até 80 caracteres.';
  if (number(food.gramas) <= 0 || number(food.gramas) > 5000) return 'A porção deve ficar entre 1 g e 5.000 g.';
  if (number(food.kcal100) < 0 || number(food.kcal100) > 1000) return 'As calorias devem ficar entre 0 e 1.000 por 100 g.';
  for (const value of [food.proteina100, food.carbo100, food.gordura100]) if (number(value) < 0 || number(value) > 100) return 'Cada macronutriente deve ficar entre 0 e 100 g por 100 g.';
  return '';
}
export function nextMeal(meals, time) {
  const ordered = [...(Array.isArray(meals) ? meals : [])].filter(meal => meal && typeof meal.hora === 'string').sort((a, b) => a.hora.localeCompare(b.hora));
  return { meal: ordered.find(meal => meal.hora >= time) || ordered[0] || null, tomorrow: !!ordered.length && !ordered.some(meal => meal.hora >= time) };
}
