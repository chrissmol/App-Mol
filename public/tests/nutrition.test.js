import { describe, expect, it } from 'vitest';
import { foodNutrients, nextMeal, normalizeDietMeals, nutritionTotals, validateFood, validateMeal } from '../js/modules/nutrition.js';

describe('nutrição', () => {
  it('calcula nutrientes pela porção em gramas', () => {
    expect(foodNutrients({ gramas: 150, kcal100: 100, proteina100: 10, carbo100: 20, gordura100: 5 })).toEqual({ kcal: 150, protein: 15, carbs: 30, fat: 7.5 });
  });

  it('soma todas as refeições', () => {
    const totals = nutritionTotals([{ alimentos: [{ gramas: 100, kcal100: 200, proteina100: 20, carbo100: 10, gordura100: 5 }] }, { alimentos: [{ gramas: 50, kcal100: 100, proteina100: 10, carbo100: 20, gordura100: 2 }] }]);
    expect(totals).toEqual({ kcal: 250, protein: 25, carbs: 20, fat: 6 });
  });

  it('normaliza o formato antigo e limita estruturas', () => {
    const normalized = normalizeDietMeals([{ nome: 'Almoço', itens: [{ nome: 'Arroz', porcao: 120, calorias: 128 }] }]);
    expect(normalized[0]).toMatchObject({ nome: 'Almoço', hora: '12:00' });
    expect(normalized[0].alimentos[0]).toMatchObject({ nome: 'Arroz', gramas: 120, kcal100: 128 });
  });

  it('neutraliza horários e nutrientes corrompidos', () => {
    const [meal] = normalizeDietMeals([{ hora: '99:99', alimentos: [{ gramas: -10, kcal100: -200, proteina100: 150 }] }]);
    expect(meal.hora).toBe('12:00');
    expect(meal.alimentos[0]).toMatchObject({ gramas: 100, kcal100: 0, proteina100: 0 });
    expect(foodNutrients({ gramas: -10, kcal100: 500 })).toEqual({ kcal: 0, protein: 0, carbs: 0, fat: 0 });
    expect(nutritionTotals({ alimentos: [] })).toEqual({ kcal: 0, protein: 0, carbs: 0, fat: 0 });
  });

  it('encontra a próxima refeição e informa a virada do dia', () => {
    const meals = [{ nome: 'Café', hora: '08:00' }, { nome: 'Jantar', hora: '20:00' }];
    expect(nextMeal(meals, '12:00')).toMatchObject({ meal: { nome: 'Jantar' }, tomorrow: false });
    expect(nextMeal(meals, '22:00')).toMatchObject({ meal: { nome: 'Café' }, tomorrow: true });
  });

  it('valida refeições, horários, porções e nutrientes', () => {
    expect(validateMeal({ nome: '', hora: '12:00' })).toBeTruthy();
    expect(validateMeal({ nome: 'Almoço', hora: '25:00' })).toBeTruthy();
    expect(validateMeal({ nome: 'Almoço', hora: '12:00' })).toBe('');
    expect(validateFood({ nome: 'Arroz', gramas: 0 })).toBeTruthy();
    expect(validateFood({ nome: 'Inválido', gramas: 100, kcal100: 200, proteina100: 120 })).toBeTruthy();
    expect(validateFood({ nome: 'Arroz', gramas: 100, kcal100: 128, proteina100: 2, carbo100: 28, gordura100: 0 })).toBe('');
  });
});
