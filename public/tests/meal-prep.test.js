import { describe, expect, it } from 'vitest';
import { calculatePreparation, divideActualYield, fitPortion, suggestedMealIds, weeklyMealSlots } from '../js/modules/meal-prep.js';
import { nutritionTotals } from '../js/modules/nutrition.js';

const rice = { nome: 'Arroz cozido', kcal100: 128, proteina100: 2.5, carbo100: 28.1, gordura100: 0.2, mode: 'adjustable', grams: 100, yieldFactor: 3 };
const chicken = { nome: 'Frango grelhado', kcal100: 159, proteina100: 32, carbo100: 0, gordura100: 2.5, mode: 'adjustable', grams: 100, yieldFactor: 0.75 };
const target = nutritionTotals([{ alimentos: [{ ...rice, gramas: 250 }, { ...chicken, gramas: 150 }] }]);
const meals = [
  { id: 'lunch', nome: 'R2 - Almoço', diasSemana: [0, 1, 2, 3, 4, 5, 6], alimentos: [{ ...rice, gramas: 250 }, { ...chicken, gramas: 150 }] },
  { id: 'dinner', nome: 'R4 - Jantar', diasSemana: [0, 1, 2, 3, 4, 5, 6], alimentos: [{ ...rice, gramas: 200 }, { ...chicken, gramas: 150 }] },
  { id: 'snack', nome: 'Lanche', diasSemana: [0, 1, 2, 3, 4, 5, 6], alimentos: [{ ...rice, gramas: 100 }] }
];

describe('planejamento de marmitas', () => {
  it('usa apenas as refeições selecionadas e respeita o dia da dieta', () => {
    expect(suggestedMealIds(meals)).toEqual(['lunch', 'dinner']);
    const slots = weeklyMealSlots(meals, ['lunch', 'dinner'], 1);
    expect(slots).toHaveLength(14);
    expect(slots[0].day).toBe(1);
    expect(slots[0].target.carbs).toBeGreaterThan(slots[1].target.carbs);
    expect(weeklyMealSlots([{ ...meals[0], diasSemana: [2, 5] }], ['lunch'])).toHaveLength(2);
  });
  it('recupera uma porção conhecida contando também a proteína do arroz', () => {
    const result = fitPortion(target, [rice, chicken]);
    expect(result.portions.map(item => item.gramas)).toEqual([250, 150]);
    expect(result.matched).toBe(true);
  });
  it.each([5, 10, 14])('escala o preparo para %s potes', count => {
    const result = calculatePreparation([{ id: 'a', name: 'A', slots: weeklyMealSlots(meals, ['lunch', 'dinner']).slice(0, count) }], [rice, chicken]);
    expect(result.potCount).toBe(count);
    expect(result.batch[1].cookedGrams).toBe(150 * count);
    expect(result.batch[1].rawGrams).toBe(200 * count);
  });
  it('soma dois perfis sem misturar suas porções', () => {
    const result = calculatePreparation([
      { id: 'a', name: 'A', slots: weeklyMealSlots(meals, ['lunch']).slice(0, 5) },
      { id: 'b', name: 'B', slots: weeklyMealSlots(meals, ['dinner']).slice(0, 3) }
    ], [rice, chicken]);
    expect(result.potCount).toBe(8);
    expect(result.batch[0].cookedGrams).toBe(5 * 250 + 3 * 200);
    expect(result.pots[5].portions[0].gramas).toBe(200);
  });
  it('não inventa peso cru quando o rendimento não foi informado', () => {
    const result = calculatePreparation([{ id: 'a', name: 'A', slots: weeklyMealSlots(meals, ['lunch']).slice(0, 1) }], [{ ...rice, yieldConfirmed: false }, chicken]);
    expect(result.batch[0].rawGrams).toBeNull();
    expect(result.batch[1].rawGrams).toBe(200);
  });
  it('mantém complementos fixos e indica uma combinação inviável', () => {
    const sauce = { ...rice, nome: 'Molho', mode: 'fixed', grams: 50 };
    expect(fitPortion(target, [sauce, rice, chicken]).portions[0].gramas).toBe(50);
    expect(fitPortion({ protein: 50, carbs: 0, fat: 0 }, [rice]).matched).toBe(false);
  });
  it('conserva o peso medido ao dividir e alerta sobre rendimento insuficiente', () => {
    const result = calculatePreparation([{ id: 'a', name: 'A', slots: weeklyMealSlots(meals, ['lunch']).slice(0, 3) }], [rice, chicken]);
    const divided = divideActualYield(result, [701, 401]);
    expect(divided.pots.reduce((sum, pot) => sum + pot.portions[0].gramas, 0)).toBe(701);
    expect(divided.pots.reduce((sum, pot) => sum + pot.portions[1].gramas, 0)).toBe(401);
    expect(divided.shortfall).toBe(true);
  });
  it('recusa potes vazios e valores inválidos', () => {
    expect(() => calculatePreparation([{ slots: [] }], [rice])).toThrow();
    expect(() => fitPortion(target, [{ ...rice, yieldFactor: 0 }])).toThrow();
    expect(() => fitPortion(target, [{ ...rice, proteina100: -1 }])).toThrow();
  });
});
