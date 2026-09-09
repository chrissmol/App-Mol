import { describe, expect, it } from 'vitest';
import { buildExercisePerformanceHistory, normalizeExerciseLibraryPreferences } from '../js/modules/exercise-library.js';

describe('biblioteca pessoal de exercícios', () => {
  it('normaliza listas, remove duplicados e limita campos personalizados', () => {
    const preferences = normalizeExerciseLibraryPreferences({
      favoritosExercicios: ['Supino', 'Supino', '  Remada  '],
      recentesExercicios: ['A', 'A', 'B'],
      exerciciosPersonalizados: [
        { nome: ' Meu exercício ', grupo: '' },
        { nome: 'meu exercício', grupo: 'Outro' },
      ],
    });
    expect(preferences.favoritosExercicios).toEqual(['Supino', 'Remada']);
    expect(preferences.recentesExercicios).toEqual(['A', 'B']);
    expect(preferences.exerciciosPersonalizados).toEqual([
      { nome: 'Meu exercício', grupo: 'Outros', personalizado: true },
    ]);
  });

  it('produz histórico ordenado e última performance por exercício', () => {
    const result = buildExercisePerformanceHistory([
      { concluidoEm: { seconds: 10 }, exercicios: [{ nome: 'Supino', series: [{ concluida: true, kg: '20', reps: '10', rir: '2' }] }] },
      { concluidoEm: { seconds: 20 }, exercicios: [{ nome: 'Supino', series: [{ concluida: true, kg: '25', reps: '8', rir: '' }] }] },
    ]);
    expect(result.latest.get('Supino')).toEqual({ kg: 25, reps: 8, rir: null, sets: [{ index: 0, kg: 25, reps: 8, rir: null }] });
    expect(result.history.get('Supino')).toHaveLength(2);
  });

  it('mantém a última performance por índice de série', () => {
    const result = buildExercisePerformanceHistory([
      {
        concluidoEm: { seconds: 20 },
        exercicios: [{
          nome: 'Remada',
          series: [
            { concluida: true, kg: '50', reps: '8', rir: '1' },
            { concluida: true, kg: '48', reps: '6', rir: '0' },
          ],
        }],
      },
    ]);

    expect(result.latest.get('Remada').sets).toEqual([
      { index: 0, kg: 50, reps: 8, rir: 1 },
      { index: 1, kg: 48, reps: 6, rir: 0 },
    ]);
  });
});
