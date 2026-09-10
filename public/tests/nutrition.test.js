import { describe, expect, it } from 'vitest';
import {
  FOOD_CATALOG,
  fastingPhase,
  fastingStatus,
  foodNutrients,
  mealFoods,
  mealsForDay,
  mealIsOutsideFastingWindow,
  nextMeal,
  normalizeDietMeals,
  normalizeFastingSettings,
  nutritionTotals,
  searchFoodCatalog,
  validateFood,
  validateMeal
} from '../js/modules/nutrition.js';

describe('nutrição', () => {
  it('calcula nutrientes pela porção em gramas', () => {
    expect(foodNutrients({ gramas: 150, kcal100: 100, proteina100: 10, carbo100: 20, gordura100: 5 })).toEqual({ kcal: 150, protein: 15, carbs: 30, fat: 7.5 });
  });

  it('soma todas as refeições', () => {
    const totals = nutritionTotals([
      { alimentos: [{ gramas: 100, kcal100: 200, proteina100: 20, carbo100: 10, gordura100: 5 }] },
      { alimentos: [{ gramas: 50, kcal100: 100, proteina100: 10, carbo100: 20, gordura100: 2 }] }
    ]);
    expect(totals).toEqual({ kcal: 250, protein: 25, carbs: 20, fat: 6 });
  });

  it('normaliza o formato antigo e limita estruturas', () => {
    const normalized = normalizeDietMeals([{ nome: 'Almoço', itens: [{ nome: 'Arroz', porcao: 120, calorias: 128 }] }]);
    expect(normalized[0]).toMatchObject({ nome: 'Almoço', hora: '12:00' });
    expect(normalized[0].alimentos[0]).toMatchObject({ nome: 'Arroz', gramas: 120, kcal100: 128 });
  });

  it('filtra refeicoes por dia e soma apenas a primeira alternativa por padrao', () => {
    const [meal] = normalizeDietMeals([{
      nome: 'Lanche',
      diasSemana: [1, 3],
      observacao: 'Escolha uma opcao.',
      gruposOpcoes: [{
        nome: 'Opcoes',
        modo: 'alternativas',
        opcoes: [
          { nome: 'Salgada', alimentos: [{ nome: 'Pao', gramas: 100, kcal100: 200 }] },
          { nome: 'Doce', alimentos: [{ nome: 'Aveia', gramas: 100, kcal100: 400 }] }
        ]
      }]
    }]);
    expect(mealsForDay([meal], 1)).toHaveLength(1);
    expect(mealsForDay([meal], 2)).toHaveLength(0);
    expect(mealFoods(meal).map(food => food.nome)).toEqual(['Pao']);
    expect(nutritionTotals([meal]).kcal).toBe(200);
    expect(meal.observacao).toBe('Escolha uma opcao.');
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

  it('busca alimentos locais sem depender de acentos ou ordem exata', () => {
    expect(searchFoodCatalog('feijao carioca')[0].nome).toBe('Feijão carioca cozido');
    expect(searchFoodCatalog('frango grelhado').some(food => food.nome === 'Peito de frango grelhado')).toBe(true);
    expect(FOOD_CATALOG.length).toBeGreaterThan(70);
  });

  it('normaliza jejum e calcula janela alimentar atual', () => {
    const settings = normalizeFastingSettings({ ativo: true, protocolo: '16:8', inicioJanela: '12:00', diasSemana: [1, 2, 3], treino: 'jejum' });
    expect(settings).toMatchObject({ ativo: true, protocolo: '16:8', inicioJanela: '12:00', fimJanela: '20:00', treino: 'jejum' });
    const status = fastingStatus(settings, new Date('2026-09-01T14:30:00'));
    expect(status).toMatchObject({ active: true, eating: true, nextTime: '20:00' });
    expect(status.remainingMinutes).toBe(330);
  });

  it('calcula fase estimada do jejum e identifica refeições fora da janela', () => {
    const settings = normalizeFastingSettings({ ativo: true, protocolo: '16:8', inicioJanela: '12:00' });
    const status = fastingStatus(settings, new Date('2026-09-01T10:00:00'));
    expect(status).toMatchObject({ active: true, eating: false, nextTime: '12:00' });
    expect(status.elapsedFastMinutes).toBe(840);
    expect(status.phase.title).toBe('Jejum metabólico leve');
    expect(fastingPhase(21).title).toBe('Jejum prolongado');
    expect(mealIsOutsideFastingWindow({ hora: '08:00' }, settings)).toBe(true);
    expect(mealIsOutsideFastingWindow({ hora: '13:00' }, settings)).toBe(false);
  });
});
