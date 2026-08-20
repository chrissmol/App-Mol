import { describe, expect, it } from 'vitest';
import { cleanRoutineExercises, elapsedSeconds, isRecoverableWorkoutDraft, normalizeRoutineRecord, validateExerciseTargets, validateSet, workoutTotals } from '../js/modules/workout-session.js';

describe('sessão de treino', () => {
  it('aceita peso corporal com carga zero e repetições válidas', () => {
    expect(validateSet({ kg: '0', reps: '12', rir: '2' })).toEqual({ valid: true, values: { kg: 0, reps: 12, rir: 2 } });
  });

  it('recusa carga, repetições e RIR fora dos limites', () => {
    expect(validateSet({ kg: '-1', reps: '12', rir: '2' }).valid).toBe(false);
    expect(validateSet({ kg: '20', reps: '2.5', rir: '2' }).valid).toBe(false);
    expect(validateSet({ kg: '20', reps: '8', rir: '11' }).valid).toBe(false);
  });

  it('calcula duração pelo relógio sem depender de intervalos', () => {
    expect(elapsedSeconds('2026-08-19T10:00:00.000Z', Date.parse('2026-08-19T10:02:05.900Z'))).toBe(125);
  });

  it('só recupera rascunhos íntegros, recentes e associados a uma rotina existente', () => {
    const now = Date.parse('2026-08-19T12:00:00.000Z');
    const valid = { versao: 2, rotinaId: 'rotina-1', exercicios: [{ nome: 'Flexão', series: [] }], iniciadaEm: '2026-08-19T10:00:00.000Z', atualizadoEm: '2026-08-19T11:59:00.000Z' };
    expect(isRecoverableWorkoutDraft(valid, ['rotina-1'], now)).toBe(true);
    expect(isRecoverableWorkoutDraft({ ...valid, rotinaId: 'excluida' }, ['rotina-1'], now)).toBe(false);
    expect(isRecoverableWorkoutDraft({ ...valid, exercicios: 'corrompido' }, ['rotina-1'], now)).toBe(false);
    expect(isRecoverableWorkoutDraft({ ...valid, atualizadoEm: '2026-08-20T12:00:00.000Z' }, ['rotina-1'], now)).toBe(false);
    expect(isRecoverableWorkoutDraft({ ...valid, atualizadoEm: '2026-08-01T12:00:00.000Z' }, ['rotina-1'], now)).toBe(false);
  });

  it('limpa uma cópia da rotina sem alterar a sessão original', () => {
    const original = [{ nome: 'Flexão', series: [{ kg: 0, reps: 12, rir: 2, concluida: true, anteriorKg: 5 }] }];
    const clean = cleanRoutineExercises(original);
    expect(clean[0].series[0]).toMatchObject({ kg: '', reps: '', rir: '', concluida: false, anteriorKg: 0, anteriorReps: 12 });
    expect(original[0].series[0].concluida).toBe(true);
  });

  it('permite finalizar parcialmente contabilizando apenas séries concluídas', () => {
    const totals = workoutTotals([{ series: [{ kg: 10, reps: 10, concluida: true }, { kg: 20, reps: 5, concluida: false }] }]);
    expect(totals).toEqual({ total: 2, completed: 1, volume: 100 });
  });

  it('ignora valores corrompidos no volume da sessão', () => {
    expect(workoutTotals([{ series: [{ kg: -10, reps: 10, concluida: true }, { kg: 'x', reps: 5, concluida: true }] }]).volume).toBe(0);
  });

  it('impede metas inconsistentes', () => {
    expect(validateExerciseTargets({ repsMin: 8, repsMax: 12 }, 'repsMin', 15).valid).toBe(false);
    expect(validateExerciseTargets({ repsMin: 8, repsMax: 12 }, 'descansoSegundos', 5).valid).toBe(false);
    expect(validateExerciseTargets({ repsMin: 8, repsMax: 12 }, 'rirAlvo', 11).valid).toBe(false);
  });

  it('normaliza rotinas antigas e descarta valores internos inseguros', () => {
    const routine = normalizeRoutineRecord({
      nome: '  Rotina antiga  ',
      diasSemana: [1, '1', 8, 'x'],
      exercicios: [{
        nome: ' Supino ',
        repsMin: 20,
        repsMax: 8,
        series: [{ tipo: 'script', kg: '\" onfocus=alert(1)', reps: 10, rir: 30, concluida: true }]
      }]
    });
    expect(routine.nome).toBe('Rotina antiga');
    expect(routine.diasSemana).toEqual([1]);
    expect(routine.exercicios[0]).toMatchObject({ nome: 'Supino', repsMin: 20, repsMax: 20 });
    expect(routine.exercicios[0].series[0]).toMatchObject({ tipo: 'N', kg: '', reps: 10, rir: '', concluida: false });
  });
});
