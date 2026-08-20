import { describe, expect, it } from 'vitest';
import { dateOf, estimatedWorkoutMinutes, recentWeightTrend, safeJSON, selectRoutine, sessionsInWeek, validWorkoutDraft, weeklyStreak } from '../js/modules/dashboard-analytics.js';

describe('dashboard', () => {
  it('ignora JSON local corrompido', () => expect(safeJSON('{quebrado', [])).toEqual([]));

  it('aceita timestamps e datas serializadas', () => {
    expect(dateOf({ concluidoEm: { seconds: 1722852000 } })).toBeInstanceOf(Date);
    expect(dateOf({ concluidoEm: '2026-08-19T12:00:00Z' })).toBeInstanceOf(Date);
  });

  it('interpreta datas sem horário no fuso local', () => {
    const date = dateOf('2026-08-19');
    expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([2026, 7, 19]);
  });

  it('não inclui sessões futuras na semana atual', () => {
    const reference = new Date('2026-08-19T12:00:00');
    const sessions = [
      { concluidoEm: '2026-08-18T12:00:00' },
      { concluidoEm: '2026-08-21T12:00:00' },
      { concluidoEm: '2026-08-24T12:00:00' }
    ];
    expect(sessionsInWeek(sessions, reference)).toHaveLength(1);
  });

  it('preserva a sequência anterior quando a semana atual ainda está vazia', () => {
    const sessions = [
      { concluidoEm: '2026-08-10T12:00:00' },
      { concluidoEm: '2026-08-03T12:00:00' }
    ];
    expect(weeklyStreak(sessions, new Date('2026-08-19T12:00:00'))).toBe(2);
  });

  it('calcula a sequência usando a meta semanal', () => {
    const sessions = ['2026-08-10', '2026-08-11', '2026-08-03', '2026-08-04'].map(concluidoEm => ({ concluidoEm }));
    expect(weeklyStreak(sessions, new Date('2026-08-19T12:00:00'), 2)).toBe(2);
    expect(weeklyStreak(sessions, new Date('2026-08-19T12:00:00'), 3)).toBe(0);
  });

  it('ignora rascunhos inválidos ou antigos', () => {
    const routines = [{ id: 'a' }];
    const draft = { versao: 2, rotinaId: 'a', exercicios: [], iniciadaEm: '2026-08-18T11:00:00', atualizadoEm: '2026-08-18T12:00:00' };
    expect(validWorkoutDraft(draft, routines, new Date('2026-08-19T12:00:00'))).toBeTruthy();
    expect(validWorkoutDraft({ ...draft, atualizadoEm: '2026-08-01T12:00:00' }, routines, new Date('2026-08-19T12:00:00'))).toBeNull();
  });

  it('seleciona de forma determinística a rotina do dia', () => {
    const routines = [{ id: 'b', nome: 'Zeta' }, { id: 'a', nome: 'Alpha', diasSemana: [3] }];
    expect(selectRoutine(routines, 3).id).toBe('a');
    expect(selectRoutine(routines, 4).id).toBe('a');
  });

  it('estima duração e calcula tendência recente de peso', () => {
    expect(estimatedWorkoutMinutes({ exercicios: [{ series: [{}, {}, {}] }] })).toBeGreaterThanOrEqual(10);
    const trend = recentWeightTrend([
      { pesoKg: 90, registradoEm: '2026-01-01' },
      { pesoKg: 82, registradoEm: '2026-08-01' },
      { pesoKg: 80, registradoEm: '2026-08-19' },
      { pesoKg: 70, registradoEm: '2026-08-20' }
    ], new Date('2026-08-19T23:59:59'));
    expect(trend.last.pesoKg).toBe(80);
    expect(trend.change).toBe(-2);
  });
});
