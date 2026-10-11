import { describe, expect, it } from 'vitest';
import { DIARY_LIMITS, addFood, changeWater, dayKey, diaryDocId, diaryTotals, mealLogged, normalizeDiary, removeItem, toggleMeal, waterGoalMl } from '../js/modules/food-diary.js';

const meal = { id: 'almoco', nome: 'Almoço', alimentos: [
  { nome: 'Arroz', gramas: 200, kcal100: 128, proteina100: 2.5, carbo100: 28, gordura100: 0.2 },
  { nome: 'Frango', gramas: 150, kcal100: 159, proteina100: 32, carbo100: 0, gordura100: 2.5 }
] };

describe('diário de refeições', () => {
  it('usa a data local e um documento por dia', () => {
    expect(dayKey(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05');
    expect(diaryDocId('u1', '2026-01-05')).toBe('u1_2026-01-05');
  });

  it('marca e desmarca a refeição inteira do plano', () => {
    const logged = toggleMeal({}, meal, '12:10');
    expect(logged.itens).toHaveLength(2);
    expect(mealLogged(logged, 'almoco')).toBe(true);
    expect(Math.round(diaryTotals(logged).kcal)).toBe(Math.round(256 + 238.5));
    expect(toggleMeal(logged, meal).itens).toEqual([]);
  });

  it('soma alimento fora do plano e remove por id', () => {
    const diary = addFood(toggleMeal({}, meal), { nome: 'Chocolate', gramas: 30, kcal100: 540, proteina100: 7, carbo100: 57, gordura100: 31 });
    expect(diary.itens.at(-1)).toMatchObject({ nome: 'Chocolate', refeicaoId: null });
    expect(removeItem(diary, diary.itens.at(-1).id).itens).toHaveLength(2);
  });

  it('limita itens e água e descarta valores inválidos', () => {
    const many = { itens: Array.from({ length: DIARY_LIMITS.items }, () => ({ nome: 'x', gramas: 1 })) };
    expect(() => addFood(many, { nome: 'y', gramas: 1 })).toThrow('80 itens');
    expect(changeWater({ aguaMl: 9900 }, 250).aguaMl).toBe(10000);
    expect(changeWater({ aguaMl: 0 }, -250).aguaMl).toBe(0);
    expect(normalizeDiary({ itens: [{ nome: 'x', gramas: -5, kcal100: 'abc', hora: '25h' }] }).itens[0]).toMatchObject({ gramas: 0, kcal100: 0, hora: '' });
  });

  it('calcula a meta de água pelo peso', () => {
    expect(waterGoalMl(80)).toBe(2750);
    expect(waterGoalMl(null)).toBe(2000);
  });
});
