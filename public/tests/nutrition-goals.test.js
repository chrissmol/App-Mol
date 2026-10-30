import { describe, expect, it } from 'vitest';
import { activityFactor, ageFrom, calculateNutritionGoals, missingGoalInputs } from '../js/modules/nutrition-goals.js';

const today = new Date(2026, 9, 10);
const base = { sexo: 'masculino', nascimento: '1996-10-11', alturaCm: 180, pesoKg: 80, nivelAtividade: 'sedentario', treinosSemana: 4 };

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

  it('combina rotina e treinos por semana no fator de atividade', () => {
    expect(activityFactor('sedentario', 0)).toBe(1.2);
    expect(activityFactor('sedentario', 2)).toBeCloseTo(1.375);
    expect(activityFactor('sedentario', 4)).toBeCloseTo(1.55);
    expect(activityFactor('sedentario', 5)).toBeCloseTo(1.725);
    expect(activityFactor('em-pe', 4)).toBeCloseTo(1.65);
    expect(activityFactor('bracal', 7)).toBe(1.9);
    // valor antigo ('moderado' = treino 3–4x) continua calculando
    expect(calculateNutritionGoals({ ...base, nivelAtividade: 'moderado', objetivo: 'Saúde' }, today).kcal).toBe(2770);
  });

  it('usa o ritmo escolhido no lugar do percentual', () => {
    // gasto 2770; 0,5 kg/semana = 7700*0,5/7 = 550 kcal por dia
    expect(calculateNutritionGoals({ ...base, objetivo: 'Emagrecimento', ritmoMetaKg: 0.5 }, today)).toMatchObject({ kcal: 2220 });
    expect(calculateNutritionGoals({ ...base, objetivo: 'Hipertrofia', ritmoMetaKg: 0.25 }, today).kcal).toBe(3050);
    expect(calculateNutritionGoals({ ...base, objetivo: 'Emagrecimento', ritmoMetaKg: 0.5 }, today).explicacao).toMatch(/menos 550 kcal por dia.*0,5 kg por semana/);
    expect(calculateNutritionGoals({ ...base, objetivo: 'Saúde', ritmoMetaKg: 0.5 }, today).kcal).toBe(2770);
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
