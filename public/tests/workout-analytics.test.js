import { describe, expect, it } from 'vitest';
import { estimate1RM, normalizedGroup, personalRecords, sessionMetrics, volumeByGroup, workoutDate } from '../js/modules/workout-analytics.js';

const timestamp = iso => ({ toDate: () => new Date(iso) });
const session = (date, sets, name = 'Supino Reto', group = 'Peito') => ({ concluidoEm: date, exercicios: [{ nome: name, grupo: group, series: sets }] });

describe('métricas de treino', () => {
  it('estima o 1RM somente em uma faixa confiável de repetições', () => {
    expect(estimate1RM(100, 5)).toBe(116.7);
    expect(estimate1RM(0, 8)).toBe(0);
    expect(estimate1RM(50, 16)).toBe(0);
  });

  it('calcula volume e séries concluídas', () => {
    const result = sessionMetrics({ exercicios: [{ series: [{ kg: 50, reps: 10, concluida: true }, { kg: 60, reps: 8, concluida: false }] }] });
    expect(result.volume).toBe(500);
    expect(result.sets).toBe(1);
  });

  it('aceita timestamps Firestore, objetos com seconds e datas ISO', () => {
    expect(workoutDate({ concluidoEm: timestamp('2026-08-18T12:00:00Z') })).toBeInstanceOf(Date);
    expect(workoutDate({ concluidoEm: { seconds: 1787054400 } })).toBeInstanceOf(Date);
    expect(workoutDate({ concluidoEm: '2026-08-18T12:00:00Z' })).toBeInstanceOf(Date);
    expect(workoutDate({ concluidoEm: 'inválida' })).toBeNull();
    expect(workoutDate({ concluidoEm: null })).toBeNull();
  });

  it('não permite volume ou duração negativos em dados antigos', () => {
    const result = sessionMetrics({ duracaoSegundos: -30, exercicios: [{ series: [{ kg: -50, reps: 10, concluida: true }] }] });
    expect(result).toMatchObject({ volume: 0, durationSeconds: 0 });
  });

  it('ignora sinalizadores textuais e números infinitos corrompidos', () => {
    const result = sessionMetrics({ duracaoSegundos: Infinity, exercicios: [{ series: [{ kg: 50, reps: 10, concluida: 'false' }] }] });
    expect(result).toEqual({ sets: 0, volume: 0, durationSeconds: 0 });
    expect(estimate1RM(Infinity, 5)).toBe(0);
  });

  it('normaliza grupos equivalentes', () => {
    expect(normalizedGroup('Bíceps')).toBe('Braços');
    expect(normalizedGroup('braço')).toBe('Braços');
    expect(normalizedGroup('Peitoral')).toBe('Peito');
  });

  it('filtra o período, o futuro e séries de aquecimento', () => {
    const sessions = [
      session('2026-08-18T12:00:00Z', [{ concluida: true, tipo: 'N' }, { concluida: true, tipo: 'w' }], 'Rosca', 'Bíceps'),
      session('2026-07-01T12:00:00Z', [{ concluida: true, tipo: 'N' }]),
      session('2026-08-21T12:00:00Z', [{ concluida: true, tipo: 'N' }])
    ];
    expect(volumeByGroup(sessions, 7, new Date('2026-08-19T12:00:00Z'))).toEqual({ Braços: 1 });
  });

  it('une variações do nome e informa evolução do recorde', () => {
    const sessions = [
      session(timestamp('2026-08-01T12:00:00Z'), [{ concluida: true, kg: 80, reps: 5 }], ' Supino Reto '),
      session('2026-08-10T12:00:00Z', [{ concluida: true, kg: 90, reps: 5 }], 'supino reto'),
      session('2026-08-15T12:00:00Z', [{ concluida: true, kg: 70, reps: 20 }], 'SUPINO RETO')
    ];
    const records = personalRecords(sessions);
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({ weight: 90, reps: 5, e1rm: 105, previousE1rm: 93.3, improvement: 12.5 });
  });

  it('ignora marcas com data futura ou inválida', () => {
    const sessions = [
      session('2026-08-18T12:00:00Z', [{ concluida: true, kg: 80, reps: 5 }]),
      session('2026-08-21T12:00:00Z', [{ concluida: true, kg: 120, reps: 5 }]),
      session('inválida', [{ concluida: true, kg: 140, reps: 5 }])
    ];
    expect(personalRecords(sessions, new Date('2026-08-19T12:00:00Z'))[0].weight).toBe(80);
  });
});
