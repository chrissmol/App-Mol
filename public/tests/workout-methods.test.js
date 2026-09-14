import { describe, expect, it } from 'vitest';
import { SET_METHODS, setSummary, validateContextualSet, workoutTotals } from '../js/modules/workout-session.js';

describe('métodos contextuais de treino', () => {
  it('calcula volume e resumo de drop set e rest-pause', () => {
    const dropSet = {
      method: SET_METHODS.DROP_SET,
      concluida: true,
      details: { primary: { kg: 80, reps: 10 }, drops: [{ kg: 64, reps: 8 }, { kg: 50, reps: 7 }] }
    };
    const restPause = {
      method: SET_METHODS.REST_PAUSE,
      concluida: true,
      details: { kg: 80, blocks: [10, 4, 2], restSeconds: 20 }
    };

    expect(validateContextualSet(dropSet).valid).toBe(true);
    expect(setSummary(restPause)).toBe('80 kg · 10 + 4 + 2 · 20s');
    expect(workoutTotals([{ series: [dropSet, restPause] }])).toMatchObject({ completed: 2, volume: 2942 });
  });

  it('recusa método avançado sem estrutura mínima', () => {
    expect(validateContextualSet({ method: SET_METHODS.MYO_REPS, details: { activation: { kg: 50, reps: 15 }, miniSets: [] } }).valid).toBe(false);
  });
});
