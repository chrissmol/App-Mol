import { describe, expect, it } from 'vitest';
import { WORKOUT_TEMPLATES } from '../js/modules/workout-templates.js';

describe('modelos de treino', () => {
  it('mantêm estrutura suficiente para criar rotinas editáveis', () => {
    expect(Object.keys(WORKOUT_TEMPLATES).length).toBeGreaterThanOrEqual(5);
    for (const [name, template] of Object.entries(WORKOUT_TEMPLATES)) {
      expect(name.length).toBeGreaterThan(2);
      expect(template.description).toContain('·');
      expect(template.days.every(day => Number.isInteger(day) && day >= 0 && day <= 6)).toBe(true);
      expect(template.exercises.length).toBeGreaterThanOrEqual(4);
      for (const exercise of template.exercises) {
        const [exerciseName, group, min, max, rir, rest] = exercise;
        expect(exerciseName).toBeTruthy();
        expect(group).toBeTruthy();
        expect(min).toBeGreaterThan(0);
        expect(max).toBeGreaterThanOrEqual(min);
        expect(rir).toBeGreaterThanOrEqual(0);
        expect(rest).toBeGreaterThanOrEqual(30);
      }
    }
  });
});
