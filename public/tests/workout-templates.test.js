import { describe, expect, it } from 'vitest';
import { WORKOUT_TEMPLATES } from '../js/modules/workout-templates.js';
import { bibliotecaDeExercicios } from '../js/data/exercicios-data.js';

const library = new Set(bibliotecaDeExercicios.map(ex => ex.nome));

describe('modelos de treino', () => {
  it('mantêm estrutura suficiente para criar rotinas editáveis', () => {
    expect(Object.keys(WORKOUT_TEMPLATES).length).toBeGreaterThanOrEqual(5);
    for (const [name, template] of Object.entries(WORKOUT_TEMPLATES)) {
      expect(name.length).toBeGreaterThan(2);
      expect(template.description).toContain('·');
      expect(template.progression).toBeTruthy();
      expect(template.routines.length).toBeGreaterThanOrEqual(1);
      for (const routine of template.routines) {
        expect(`${name} · ${routine.name}`.length).toBeLessThanOrEqual(60);
        expect(routine.days.every(day => Number.isInteger(day) && day >= 0 && day <= 6)).toBe(true);
        expect(routine.exercises.length).toBeGreaterThanOrEqual(3);
        for (const [exerciseName, group, min, max, rir, rest, sets] of routine.exercises) {
          expect(library.has(exerciseName), `${exerciseName} não existe na biblioteca`).toBe(true);
          expect(group).toBeTruthy();
          expect(min).toBeGreaterThan(0);
          expect(max).toBeGreaterThanOrEqual(min);
          expect(rir).toBeGreaterThanOrEqual(0);
          expect(rest).toBeGreaterThanOrEqual(30);
          expect(sets).toBeGreaterThanOrEqual(1);
          expect(sets).toBeLessThanOrEqual(5);
        }
      }
    }
  });

  it('cobrem cada dia da semana sem sobrepor rotinas do mesmo modelo', () => {
    for (const template of Object.values(WORKOUT_TEMPLATES)) {
      const days = template.routines.flatMap(r => r.days);
      expect(new Set(days).size).toBe(days.length);
    }
  });
});
