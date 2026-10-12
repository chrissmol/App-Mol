import { describe, expect, it } from 'vitest';
import { showWeeklyReview, weeklyReview } from '../js/modules/weekly-review.js';

const now = new Date(2026, 9, 12, 10); // segunda-feira
const session = (day, volume) => ({ concluidoEm: new Date(2026, 9, day, 18).toISOString(), volumeTotal: volume });

describe('resumo semanal', () => {
  it('aparece no domingo e na segunda para quem já treinou', () => {
    expect(showWeeklyReview([session(1, 0)], now)).toBe(true);
    expect(showWeeklyReview([], now)).toBe(false);
    expect(showWeeklyReview([session(1, 0)], new Date(2026, 9, 14))).toBe(false);
  });

  it('conta só os últimos 7 dias e escolhe o estado do pet', () => {
    const sessions = [session(6, 1000), session(8, 1500.4), session(10, 2000), session(1, 9999)];
    const weights = [{ pesoKg: 80, registradoEm: new Date(2026, 9, 6).toISOString() }, { pesoKg: 79.4, registradoEm: new Date(2026, 9, 11).toISOString() }];
    expect(weeklyReview({ sessions, weights, mealDays: 5, goal: 3, now })).toEqual({ workouts: 3, goal: 3, volume: 4500, mealDays: 5, weightChange: -0.6, state: 'conquista' });
    expect(weeklyReview({ sessions: sessions.slice(0, 1), goal: 3, now })).toMatchObject({ workouts: 1, state: 'evolucao', weightChange: null });
    expect(weeklyReview({ sessions: [session(1, 0)], goal: 3, now })).toMatchObject({ workouts: 0, state: 'apoio' });
  });
});
