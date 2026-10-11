import { describe, expect, it } from 'vitest';
import { activeWorkoutFrom, formatElapsed } from '../js/utils/active-workout.js';

describe('barra de treino em andamento', () => {
  const now = Date.parse('2026-10-11T12:00:00Z');
  it('lê o rascunho recente e ignora o antigo ou inválido', () => {
    const draft = { versao: 2, nomeRotina: 'Upper', iniciadaEm: '2026-10-11T11:30:00Z', atualizadoEm: '2026-10-11T11:55:00Z' };
    expect(activeWorkoutFrom(JSON.stringify(draft), now)).toEqual({ name: 'Upper', startedAt: Date.parse(draft.iniciadaEm) });
    expect(activeWorkoutFrom(JSON.stringify({ ...draft, atualizadoEm: '2026-10-10T20:00:00Z' }), now)).toBeNull();
    expect(activeWorkoutFrom('{quebrado', now)).toBeNull();
    expect(activeWorkoutFrom(null, now)).toBeNull();
  });
  it('mostra o tempo como no cronômetro', () => {
    expect(formatElapsed(65)).toBe('1:05');
    expect(formatElapsed(3725)).toBe('1:02:05');
  });
});
