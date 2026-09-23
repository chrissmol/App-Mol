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

describe('caches de dados persistentes', () => {
  // Fake de Storage: itens são propriedades próprias (Object.keys funciona como no navegador).
  const fakeStorage = () => Object.defineProperties({}, {
    getItem: { value(k) { return Object.hasOwn(this, k) ? this[k] : null; } },
    setItem: { value(k, v) { this[k] = String(v); } },
    removeItem: { value(k) { delete this[k]; } }
  });

  it('guarda caches no localStorage e apaga só eles no logout', async () => {
    const local = fakeStorage(); const session = fakeStorage();
    globalThis.window = { localStorage: local, sessionStorage: session };
    const storage = await import('../js/utils/storage.js');
    storage.setSessionItem('mol-profile-cache-u1', '1');
    storage.setSessionItem('mol-login-success', 'true');
    local.setItem('mol-pending-sessions', '[]');
    expect(local.getItem('mol-profile-cache-u1')).toBe('1');
    expect(session.getItem('mol-login-success')).toBe('true');
    storage.clearUserCaches();
    expect(local.getItem('mol-profile-cache-u1')).toBeNull();
    expect(local.getItem('mol-pending-sessions')).toBe('[]');
  });
});
