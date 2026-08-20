export const WORKOUT_LIMITS = Object.freeze({
  weight: 2000,
  reps: 1000,
  rir: 10,
  rest: 3600,
  targetReps: 1000
});

export const WORKOUT_STRUCTURE_LIMITS = Object.freeze({
  routines: 100,
  exercises: 60,
  setsPerExercise: 60
});

export function cloneValue(value) {
  return JSON.parse(JSON.stringify(value));
}

function boundedNumber(value, { min, max, integer = false }) {
  if (value === '' || value == null) return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < min || number > max || (integer && !Number.isInteger(number))) return null;
  return number;
}

export function normalizeRoutineExercises(exercises) {
  return (Array.isArray(exercises) ? exercises : []).slice(0, WORKOUT_STRUCTURE_LIMITS.exercises).flatMap(exercise => {
    if (!exercise || typeof exercise !== 'object') return [];
    const nome = typeof exercise.nome === 'string' ? exercise.nome.trim().slice(0, 80) : '';
    const grupo = typeof exercise.grupo === 'string' ? exercise.grupo.trim().slice(0, 40) : '';
    const repsMin = boundedNumber(exercise.repsMin, { min: 1, max: WORKOUT_LIMITS.targetReps, integer: true }) ?? 8;
    const repsMaxCandidate = boundedNumber(exercise.repsMax, { min: 1, max: WORKOUT_LIMITS.targetReps, integer: true }) ?? 12;
    const repsMax = Math.max(repsMin, repsMaxCandidate);
    const rirAlvo = boundedNumber(exercise.rirAlvo, { min: 0, max: WORKOUT_LIMITS.rir, integer: true }) ?? 2;
    const descansoSegundos = boundedNumber(exercise.descansoSegundos, { min: 15, max: WORKOUT_LIMITS.rest, integer: true }) ?? 90;
    const series = (Array.isArray(exercise.series) ? exercise.series : []).slice(0, WORKOUT_STRUCTURE_LIMITS.setsPerExercise).map(set => {
      const source = set && typeof set === 'object' ? set : {};
      const kg = boundedNumber(source.kg, { min: 0, max: WORKOUT_LIMITS.weight });
      const reps = boundedNumber(source.reps, { min: 1, max: WORKOUT_LIMITS.reps, integer: true });
      const rir = boundedNumber(source.rir, { min: 0, max: WORKOUT_LIMITS.rir, integer: true });
      const anteriorKg = boundedNumber(source.anteriorKg, { min: 0, max: WORKOUT_LIMITS.weight });
      const anteriorReps = boundedNumber(source.anteriorReps, { min: 1, max: WORKOUT_LIMITS.reps, integer: true });
      return {
        ...source,
        tipo: ['N', 'W', 'D', 'F'].includes(String(source.tipo).toUpperCase()) ? String(source.tipo).toUpperCase() : 'N',
        kg: kg ?? '',
        reps: reps ?? '',
        rir: rir ?? '',
        anteriorKg: anteriorKg ?? '',
        anteriorReps: anteriorReps ?? '',
        concluida: source.concluida === true && kg !== null && reps !== null
      };
    });
    return [{
      ...exercise,
      nome: nome || 'Exercício',
      grupo: grupo || 'Outros',
      notas: typeof exercise.notas === 'string' ? exercise.notas.slice(0, 500) : '',
      repsMin,
      repsMax,
      rirAlvo,
      descansoSegundos,
      series
    }];
  });
}

export function normalizeRoutineRecord(value = {}) {
  const source = value && typeof value === 'object' ? value : {};
  const nome = typeof source.nome === 'string' ? source.nome.trim().slice(0, 80) : '';
  const diasSemana = [...new Set((Array.isArray(source.diasSemana) ? source.diasSemana : []).map(Number).filter(day => Number.isInteger(day) && day >= 0 && day <= 6))];
  return {
    ...source,
    nome: nome || 'Rotina sem nome',
    descricao: typeof source.descricao === 'string' ? source.descricao.slice(0, 240) : '',
    diasSemana,
    exercicios: normalizeRoutineExercises(source.exercicios)
  };
}

export function elapsedSeconds(startedAt, now = Date.now()) {
  const start = startedAt instanceof Date ? startedAt.getTime() : new Date(startedAt).getTime();
  return Number.isFinite(start) ? Math.max(0, Math.floor((now - start) / 1000)) : 0;
}

export function isRecoverableWorkoutDraft(draft, routineIds, now = Date.now()) {
  if (!draft || typeof draft !== 'object' || draft.versao !== 2) return false;
  if (typeof draft.rotinaId !== 'string' || !routineIds?.includes(draft.rotinaId)) return false;
  if (!Array.isArray(draft.exercicios) || draft.exercicios.length > WORKOUT_STRUCTURE_LIMITS.exercises) return false;
  if (draft.exercicios.some(exercise => !exercise || typeof exercise !== 'object' || !Array.isArray(exercise.series) || exercise.series.length > WORKOUT_STRUCTURE_LIMITS.setsPerExercise)) return false;
  const updatedAt = new Date(draft.atualizadoEm).getTime();
  const startedAt = new Date(draft.iniciadaEm).getTime();
  const clockTolerance = 5 * 60 * 1000;
  if (!Number.isFinite(updatedAt) || !Number.isFinite(startedAt)) return false;
  if (updatedAt > now + clockTolerance || startedAt > now + clockTolerance) return false;
  if (now - updatedAt > 7 * 86400000 || startedAt > updatedAt + clockTolerance) return false;
  return true;
}

export function validateSet({ kg, reps, rir }) {
  const weight = Number(kg);
  const repetitions = Number(reps);
  const reserve = rir === '' || rir == null ? null : Number(rir);
  if (kg === '' || !Number.isFinite(weight) || weight < 0 || weight > WORKOUT_LIMITS.weight) return { valid: false, message: `Informe uma carga entre 0 e ${WORKOUT_LIMITS.weight} kg.` };
  if (reps === '' || !Number.isInteger(repetitions) || repetitions < 1 || repetitions > WORKOUT_LIMITS.reps) return { valid: false, message: `Informe entre 1 e ${WORKOUT_LIMITS.reps} repetições inteiras.` };
  if (reserve !== null && (!Number.isInteger(reserve) || reserve < 0 || reserve > WORKOUT_LIMITS.rir)) return { valid: false, message: 'O RIR deve ser um número inteiro entre 0 e 10.' };
  return { valid: true, values: { kg: weight, reps: repetitions, rir: reserve } };
}

export function validateExerciseTargets(exercise, field, rawValue) {
  const value = Number(rawValue);
  if (!Number.isInteger(value) || value < 0) return { valid: false, message: 'Use somente números inteiros positivos.' };
  if (field === 'rirAlvo' && value > WORKOUT_LIMITS.rir) return { valid: false, message: 'O RIR alvo deve ficar entre 0 e 10.' };
  if (field === 'descansoSegundos' && (value < 15 || value > WORKOUT_LIMITS.rest)) return { valid: false, message: 'O descanso deve ficar entre 15 segundos e 60 minutos.' };
  if ((field === 'repsMin' || field === 'repsMax') && (value < 1 || value > WORKOUT_LIMITS.targetReps)) return { valid: false, message: `A meta deve ficar entre 1 e ${WORKOUT_LIMITS.targetReps} repetições.` };
  const next = { ...exercise, [field]: value };
  if ((next.repsMin ?? 1) > (next.repsMax ?? WORKOUT_LIMITS.targetReps)) return { valid: false, message: 'A meta mínima não pode ser maior que a máxima.' };
  return { valid: true, value };
}

export function cleanRoutineExercises(exercises) {
  return normalizeRoutineExercises(cloneValue(exercises || [])).map(exercise => ({
    ...exercise,
    series: (exercise.series || []).map(set => ({
      ...set,
      anteriorKg: set.concluida ? set.kg : set.anteriorKg,
      anteriorReps: set.concluida ? set.reps : set.anteriorReps,
      concluida: false,
      kg: '',
      reps: '',
      rir: ''
    }))
  }));
}

export function completedWorkoutSnapshot(exercises) {
  return normalizeRoutineExercises(cloneValue(exercises || []));
}

export function workoutTotals(exercises) {
  const sets = (exercises || []).flatMap(exercise => exercise.series || []);
  const completed = sets.filter(set => set.concluida);
  return {
    total: sets.length,
    completed: completed.length,
    volume: completed.reduce((sum, set) => {
      const weight = Number(set.kg); const repetitions = Number(set.reps);
      return sum + (Number.isFinite(weight) && weight >= 0 && Number.isFinite(repetitions) && repetitions > 0 ? weight * repetitions : 0);
    }, 0)
  };
}
