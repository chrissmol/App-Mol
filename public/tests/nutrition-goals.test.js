import { describe, expect, it } from 'vitest';
import { ageFrom, calculateNutritionGoals, missingGoalInputs } from '../js/modules/nutrition-goals.js';

const today = new Date(2026, 9, 10);
const base = { sexo: 'masculino', nascimento: '1996-10-11', alturaCm: 180, pesoKg: 80, nivelAtividade: 'moderado' };

describe('meta calórica calculada', () => {
  it('conta a idade pelo aniversário', () => {
    expect(ageFrom('1996-10-11', today)).toBe(29);
    expect(ageFrom('1996-10-10', today)).toBe(30);
    expect(ageFrom('10/10/1996', today)).toBeNull();
  });

  it('aplica Mifflin-St Jeor, atividade e objetivo', () => {
    // 10*80 + 6,25*180 - 5*29 + 5 = 1785; ×1,55 = 2766,75 → 2770
    const keep = calculateNutritionGoals({ ...base, objetivo: 'Saúde' }, today);
    expect(keep).toMatchObject({ gasto: 2770, kcal: 2770, macroGoals: { protein: 128, fat: 64 } });
    expect(keep.macroGoals.carbs).toBe(Math.round((2770 - 128 * 4 - 64 * 9) / 4));
    expect(calculateNutritionGoals({ ...base, objetivo: 'Emagrecimento' }, today)).toMatchObject({ kcal: 2350, macroGoals: { protein: 160 } });
    expect(calculateNutritionGoals({ ...base, objetivo: 'Hipertrofia' }, today).kcal).toBe(3050);
    expect(calculateNutritionGoals({ ...base, objetivo: 'Emagrecimento' }, today).explicacao).toMatch(/2\.770 kcal.*menos 15%/);
  });

  it('não desce do mínimo seguro', () => {
    const small = calculateNutritionGoals({ sexo: 'feminino', nascimento: '1950-01-01', alturaCm: 150, pesoKg: 42, nivelAtividade: 'sedentario', objetivo: 'Emagrecimento' }, today);
    expect(small.kcal).toBe(1200);
    expect(small.explicacao).toMatch(/mínimo seguro/);
  });

  it('diz o que falta e não calcula sem dados', () => {
    expect(missingGoalInputs({ ...base, sexo: '', pesoKg: '' })).toEqual(['sexo', 'peso atual']);
    expect(calculateNutritionGoals({ ...base, nivelAtividade: 'x' })).toBeNull();
  });
});
