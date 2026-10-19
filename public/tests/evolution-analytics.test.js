import { describe, expect, it } from 'vitest';
import { dateFrom, monthCalendar, sevenDayAverage, workoutStats } from '../js/modules/evolution-analytics.js';

const timestamp = value => ({ toDate: () => new Date(value) });

describe('métricas de evolução', () => {
  it('mantém a sequência anterior enquanto a semana atual ainda não atingiu a meta', () => {
    const sessions = [
      { concluidoEm: timestamp('2026-08-10T12:00:00') },
      { concluidoEm: timestamp('2026-08-11T12:00:00') },
      { concluidoEm: timestamp('2026-08-12T12:00:00') },
      { concluidoEm: timestamp('2026-08-17T12:00:00') }
    ];
    expect(workoutStats(sessions, 3, new Date('2026-08-19T12:00:00')).streak).toBe(1);
  });

  it('conta apenas séries explicitamente concluídas e recalcula volume legado', () => {
    const sessions = [{ concluidoEm: '2026-08-18T12:00:00', exercicios: [{ series: [
      { concluida: true, kg: 20, reps: 10 },
      { concluida: false, kg: 30, reps: 10 },
      { kg: 40, reps: 10 }
    ] }] }];
    const stats = workoutStats(sessions, 3);
    expect(stats.series).toBe(1);
    expect(stats.volume).toBe(200);
  });

  it('não subtrai volume quando um registro antigo tem carga negativa', () => {
    const stats = workoutStats([{ concluidoEm: '2026-08-18T12:00:00', exercicios: [{ series: [{ concluida: true, kg: -20, reps: 10 }] }] }], 3);
    expect(stats.volume).toBe(0);
  });

  it('interpreta data sem horário no fuso local e ignora sessões futuras', () => {
    const local = dateFrom('2026-08-19');
    expect([local.getFullYear(), local.getMonth(), local.getDate()]).toEqual([2026, 7, 19]);
    const result = workoutStats([
      { concluidoEm: '2026-08-18T10:00:00', exercicios: [] },
      { concluidoEm: '2026-08-20T10:00:00', exercicios: [] }
    ], 3, new Date('2026-08-19T12:00:00'));
    expect(result.sessions).toBe(1);
    expect(result.weekly).toBe(1);
  });

  it('alinha o calendário pelo domingo', () => {
    const calendar = monthCalendar(new Date(2026, 7, 1), new Set(), new Date(2026, 7, 19));
    expect(calendar.leadingBlanks).toBe(6);
    expect(calendar.days[18].today).toBe(true);
  });

  it('soma o volume por semana nas últimas 8 semanas', () => {
    const sessions = [
      { concluidoEm: '2026-08-18T12:00:00', volumeTotal: 1000 },
      { concluidoEm: '2026-08-19T12:00:00', volumeTotal: 500 },
      { concluidoEm: '2026-08-11T12:00:00', volumeTotal: 800 }
    ];
    const weeks = workoutStats(sessions, 3, new Date('2026-08-20T12:00:00')).weeklyVolume;
    expect(weeks).toHaveLength(8);
    expect(weeks.at(-1).kg).toBe(1500);
    expect(weeks.at(-2).kg).toBe(800);
    expect(weeks[0].kg).toBe(0);
  });

  it('calcula a média de 7 dias só com registros da janela', () => {
    const point = (day, kg) => ({ date: new Date(2026, 7, day), kg });
    expect(sevenDayAverage([point(1, 80), point(5, 78), point(10, 76)])).toEqual([80, 79, 77]);
  });
});
