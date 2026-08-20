import { describe, expect, it } from 'vitest';
import { filterHistory, historySummary, sessionsByDay, sortSessionsNewest } from '../js/modules/history-analytics.js';

const session = (date, name, exercise = 'Supino') => ({ concluidoEm: date, nomeRotina: name, exercicios: [{ nome: exercise, series: [{ concluida: true, kg: 50, reps: 10 }] }] });

describe('histórico de treinos', () => {
  it('resume sessões, séries e volume real', () => {
    expect(historySummary([session('2026-08-10', 'A'), session('2026-08-11', 'B')])).toEqual({ workouts: 2, sets: 2, volume: 1000 });
  });

  it('conta múltiplas sessões no mesmo dia', () => {
    const counts = sessionsByDay([session('2026-08-10T08:00:00', 'A'), session('2026-08-10T18:00:00', 'B'), session('2026-08-11', 'C')], new Date(2026, 7, 1));
    expect(counts.get(10)).toBe(2);
    expect(counts.get(11)).toBe(1);
  });

  it('filtra por mês, dia, rotina e exercício', () => {
    const sessions = [session('2026-08-10', 'Upper A', 'Supino'), session('2026-08-11', 'Lower', 'Agachamento'), session('2026-07-10', 'Upper antigo', 'Supino')];
    expect(filterHistory(sessions, { month: new Date(2026, 7, 1) })).toHaveLength(2);
    expect(filterHistory(sessions, { month: new Date(2026, 7, 1), day: 10 })).toHaveLength(1);
    expect(filterHistory(sessions, { query: 'agachamento' })[0].nomeRotina).toBe('Lower');
    expect(filterHistory(sessions, { query: 'upper' })).toHaveLength(2);
  });

  it('ordena formatos de data diferentes do mais recente para o mais antigo', () => {
    const sorted = sortSessionsNewest([session({ seconds: 1786320000 }, 'Antigo'), session('2026-08-19T12:00:00Z', 'Novo')]);
    expect(sorted[0].nomeRotina).toBe('Novo');
  });

  it('remove sessões futuras e sem data dos totais', () => {
    const sessions = [session('2026-08-18T10:00:00', 'Válido'), session('2026-08-20T10:00:00', 'Futuro'), { nomeRotina: 'Sem data', exercicios: [] }];
    const now = new Date('2026-08-19T12:00:00');
    expect(historySummary(sessions, now).workouts).toBe(1);
    expect(sortSessionsNewest(sessions, now)).toHaveLength(1);
  });
});
