import { beforeEach, describe, expect, it } from 'vitest';
import { exerciseNames, exerciseProgress } from '../js/modules/workout-analytics.js';
import { flushPendingSessions, pendingSessions, queueSession } from '../js/utils/pending-sessions.js';

const set = (kg, reps) => ({ kg, reps, concluida: true });
const session = (date, sets) => ({ concluidoEm: date, exercicios: [{ nome: 'Supino', grupo: 'Peito', series: sets }] });

describe('progresso por exercício', () => {
  it('gera um ponto por treino em ordem cronológica', () => {
    const sessions = [session('2026-02-10', [set(80, 5)]), session('2026-01-10', [set(60, 10), set(70, 5)])];
    const points = exerciseProgress(sessions, 'Supino');
    expect(points.map(point => point.kg)).toEqual([70, 80]);
    expect(points[1].oneRM).toBe(93.3);
    expect(points[0].volume).toBe(950);
    expect(exerciseNames(sessions)).toEqual(['Supino']);
    expect(exerciseProgress(sessions, 'Agachamento')).toEqual([]);
  });
});

describe('fila de treinos offline', () => {
  const store = new Map();
  beforeEach(() => {
    store.clear();
    globalThis.window = { localStorage: { getItem: key => store.get(key) ?? null, setItem: (key, value) => store.set(key, value), removeItem: key => store.delete(key) } };
  });

  it('mantém na fila só o que falhou ao enviar', async () => {
    queueSession({ session: { userId: 'a', n: 1 } });
    queueSession({ session: { userId: 'a', n: 2 } });
    queueSession({ session: { userId: 'b', n: 3 } });
    const sent = await flushPendingSessions('a', async entry => { if (entry.session.n === 2) throw new Error('offline'); });
    expect(sent).toBe(1);
    expect(pendingSessions('a').map(item => item.session.n)).toEqual([2]);
    expect(pendingSessions('b')).toHaveLength(1);
  });
});
