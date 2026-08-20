import { describe, expect, it } from 'vitest';
import { formatTrainingTime, profileMilestone, profileStats, readProfileCache } from '../js/modules/profile-analytics.js';

describe('perfil', () => {
  it('calcula a semana de segunda-feira sem sessões futuras', () => {
    const sessions = [
      { concluidoEm: '2026-08-17T10:00:00', duracaoSegundos: 1200, exercicios: [{ series: [{ concluida: true, kg: 10, reps: 10 }] }] },
      { concluidoEm: '2026-08-20T10:00:00' }
    ];
    const stats = profileStats(sessions, 3, new Date('2026-08-19T12:00:00'));
    expect(stats.workouts).toBe(1);
    expect(stats.weekly).toBe(1);
    expect(stats.sets).toBe(1);
    expect(stats.volume).toBe(100);
  });

  it('ignora sessão sem data e carga negativa em dados antigos', () => {
    const stats = profileStats([
      { concluidoEm: null, exercicios: [] },
      { concluidoEm: '2026-08-18T10:00:00', exercicios: [{ series: [{ concluida: true, kg: -10, reps: 10 }] }] }
    ], 3, new Date('2026-08-19T12:00:00'));
    expect(stats.workouts).toBe(1);
    expect(stats.volume).toBe(0);
  });

  it('formata minutos sem arredondar tudo para horas', () => {
    expect(formatTrainingTime(1200)).toBe('20 min');
    expect(formatTrainingTime(4500)).toBe('1h 15min');
  });

  it('gera progressão de marcos', () => {
    expect(profileMilestone(9)).toContain('Falta 1 treino');
    expect(profileMilestone(26)).toContain('25 treinos');
  });

  it('descarta cache inválido ou vencido', () => {
    expect(readProfileCache('{erro')).toBeNull();
    expect(readProfileCache(JSON.stringify({ savedAt: 1000, stats: { workouts: 2 } }), 2000, 5000)).toEqual({ workouts: 2, sets: 0, volume: 0, seconds: 0, weekly: 0, goal: 3, percent: 0 });
    expect(readProfileCache(JSON.stringify({ savedAt: 1000, stats: {} }), 7000, 5000)).toBeNull();
    expect(readProfileCache(JSON.stringify({ savedAt: 999999, stats: { workouts: 2 } }), 2000, 5000)).toBeNull();
  });
});
