import { describe, expect, it } from 'vitest';
import { estimate1RM, sessionMetrics } from '../js/modules/workout-analytics.js';

describe('mÃ©tricas de treino', () => {
  it('estima o 1RM sem gerar valores negativos', () => {
    expect(estimate1RM(100, 5)).toBe(116.7);
    expect(estimate1RM(0, 8)).toBe(0);
  });

  it('calcula volume e sÃ©ries concluÃ­das', () => {
    const result = sessionMetrics({ exercicios: [{ series: [
      { kg: 50, reps: 10, concluida: true },
      { kg: 60, reps: 8, concluida: false }
    ] }] });
    expect(result.volume).toBe(500);
    expect(result.sets).toBe(1);
  });
});
