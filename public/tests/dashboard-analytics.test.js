import { describe, expect, it } from 'vitest';
import { dateOf, safeJSON, sessionsInWeek, weeklyStreak } from '../js/modules/dashboard-analytics.js';

describe('dashboard', () => {
  it('ignora JSON local corrompido', () => expect(safeJSON('{quebrado', [])).toEqual([]));

  it('aceita timestamps e datas serializadas', () => {
    expect(dateOf({ concluidoEm: { seconds: 1722852000 } })).toBeInstanceOf(Date);
    expect(dateOf({ concluidoEm: '2026-08-19T12:00:00Z' })).toBeInstanceOf(Date);
  });

  it('não inclui sessões futuras na semana atual', () => {
    const reference = new Date('2026-08-19T12:00:00');
    const sessions = [
      { concluidoEm: '2026-08-18T12:00:00' },
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
});
