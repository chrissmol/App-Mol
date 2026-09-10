import { describe, expect, it } from 'vitest';
import { DIET_PLANS } from '../js/data/diet-plans.js';
import { mealsForDay, normalizeDietMeals } from '../js/modules/nutrition.js';

describe('modelos de dieta', () => {
  it('mantem o plano sem iogurte estruturado por dia e alternativas', () => {
    const plan = DIET_PLANS.find(item => item.id === 'plano-alimentar-sem-iogurte');
    const meals = normalizeDietMeals(plan.refeicoes);
    expect(meals).toHaveLength(6);
    expect(mealsForDay(meals, 6).some(meal => meal.nome.includes('R4'))).toBe(false);
    expect(mealsForDay(meals, 2).some(meal => meal.nome.includes('300 g arroz'))).toBe(true);
    expect(meals.find(meal => meal.id === 'plano-sem-iogurte-r3').gruposOpcoes[0].opcoes).toHaveLength(2);
  });
});
